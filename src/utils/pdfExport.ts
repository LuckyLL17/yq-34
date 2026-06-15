import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import CopybookPreview from '@/components/Preview/CopybookPreview';
import type { CopybookConfig, CopybookTemplate } from '@/types';

export interface ExportOptions {
  filename?: string;
  scale?: number;
  marginMm?: number;
  includeDrawing?: boolean;
}

export interface BatchExportOptions extends ExportOptions {
  progressCallback?: (current: number, total: number) => void;
}

async function waitFontsReady(): Promise<void> {
  try {
    const doc = document as Document & {
      fonts?: {
        ready?: Promise<void>;
      };
    };
    if (doc.fonts && doc.fonts.ready) {
      await doc.fonts.ready;
      await new Promise((r) => setTimeout(r, 300));
    }
  } catch {
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function capturePage(
  element: HTMLElement,
  scale: number,
  includeDrawing: boolean
): Promise<{ dataUrl: string; width: number; height: number }> {
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    logging: false,
    windowWidth: element.scrollWidth + 100,
    windowHeight: element.scrollHeight + 100,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    onclone: (clonedDoc) => {
      const clone = clonedDoc.body.querySelector(
        `[data-page-index="${element.getAttribute('data-page-index')}"]`
      ) as HTMLElement | null;
      if (clone) {
        clone.style.transform = 'none';
        clone.style.filter = 'none';
        clone.style.margin = '0';
      }
      if (!includeDrawing) {
        const canvases = clonedDoc.querySelectorAll('canvas.page-drawing-canvas');
        canvases.forEach((c) => c.remove());
      }
      const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach((s) => s.removeAttribute('media'));
    },
  });

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.97),
    width: canvas.width,
    height: canvas.height,
  };
}

export async function exportCopybookToPdf(
  container: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const { filename = '字帖.pdf', scale = 2, marginMm = 8, includeDrawing = true } = options;

  if (!container) {
    throw new Error('找不到要导出的元素');
  }

  await waitFontsReady();

  const pageElements = Array.from(
    container.querySelectorAll<HTMLElement>('[data-page-index]')
  ).sort(
    (a, b) =>
      Number(a.getAttribute('data-page-index')) -
      Number(b.getAttribute('data-page-index'))
  );

  if (pageElements.length === 0) {
    throw new Error('未找到字帖页面');
  }

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const drawWidthMm = pageWidthMm - marginMm * 2;
  const drawHeightMm = pageHeightMm - marginMm * 2;

  for (let i = 0; i < pageElements.length; i++) {
    const pageEl = pageElements[i];

    const { dataUrl, width: imgW, height: imgH } = await capturePage(
      pageEl,
      scale,
      includeDrawing
    );

    if (i > 0) {
      pdf.addPage('a4', 'p');
    }

    const imgRatio = imgW / imgH;
    const pageRatio = drawWidthMm / drawHeightMm;

    let w: number, h: number, x: number, y: number;

    if (imgRatio > pageRatio) {
      w = drawWidthMm;
      h = drawWidthMm / imgRatio;
      x = marginMm;
      y = marginMm + (drawHeightMm - h) / 2;
    } else {
      h = drawHeightMm;
      w = drawHeightMm * imgRatio;
      x = marginMm + (drawWidthMm - w) / 2;
      y = marginMm;
    }

    pdf.addImage(dataUrl, 'JPEG', x, y, w, h, undefined, 'FAST');
  }

  pdf.save(filename);
}

function createTemporaryContainer(): HTMLElement {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '-99999px';
  container.style.width = '1200px';
  container.style.zIndex = '-1';
  container.style.pointerEvents = 'none';
  container.style.opacity = '0';
  document.body.appendChild(container);
  return container;
}

function cleanupTemporaryContainer(container: HTMLElement, root?: Root): void {
  if (root) {
    root.unmount();
  }
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

async function renderAndCaptureConfig(
  config: CopybookConfig,
  scale: number,
  marginMm: number,
  includeDrawing: boolean,
  pdf: jsPDF,
  isFirstTemplate: boolean
): Promise<{ pagesAdded: number }> {
  const container = createTemporaryContainer();
  let root: Root | undefined;
  let pagesAdded = 0;

  try {
    const wrapper = document.createElement('div');
    container.appendChild(wrapper);
    root = createRoot(wrapper);

    await new Promise<void>((resolve, reject) => {
      try {
        root!.render(
          React.createElement(CopybookPreview, {
            overrideConfig: { ...config },
          })
        );
        setTimeout(resolve, 400);
      } catch (e) {
        reject(e);
      }
    });

    await waitFontsReady();

    const pageElements = Array.from(
      container.querySelectorAll<HTMLElement>('[data-page-index]')
    ).sort(
      (a, b) =>
        Number(a.getAttribute('data-page-index')) -
        Number(b.getAttribute('data-page-index'))
    );

    if (pageElements.length === 0) {
      throw new Error('未找到字帖页面');
    }

    const pageWidthMm = pdf.internal.pageSize.getWidth();
    const pageHeightMm = pdf.internal.pageSize.getHeight();
    const drawWidthMm = pageWidthMm - marginMm * 2;
    const drawHeightMm = pageHeightMm - marginMm * 2;

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      const { dataUrl, width: imgW, height: imgH } = await capturePage(
        pageEl,
        scale,
        includeDrawing
      );

      if (!isFirstTemplate || i > 0) {
        pdf.addPage('a4', 'p');
      }

      const imgRatio = imgW / imgH;
      const pageRatio = drawWidthMm / drawHeightMm;

      let w: number, h: number, x: number, y: number;

      if (imgRatio > pageRatio) {
        w = drawWidthMm;
        h = drawWidthMm / imgRatio;
        x = marginMm;
        y = marginMm + (drawHeightMm - h) / 2;
      } else {
        h = drawHeightMm;
        w = drawHeightMm * imgRatio;
        x = marginMm + (drawWidthMm - w) / 2;
        y = marginMm;
      }

      pdf.addImage(dataUrl, 'JPEG', x, y, w, h, undefined, 'FAST');
      pagesAdded++;
    }

    return { pagesAdded };
  } finally {
    await new Promise((r) => setTimeout(r, 50));
    cleanupTemporaryContainer(container, root);
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || '字帖';
}

export async function exportTemplatesToMergedPdf(
  templates: CopybookTemplate[],
  options: BatchExportOptions = {}
): Promise<void> {
  if (!templates || templates.length === 0) {
    throw new Error('请选择要导出的字帖模板');
  }

  const {
    filename = '字帖合集.pdf',
    scale = 2,
    marginMm = 8,
    includeDrawing = false,
    progressCallback,
  } = options;

  await waitFontsReady();

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    if (progressCallback) {
      progressCallback(i + 1, templates.length);
    }
    await renderAndCaptureConfig(
      template.config,
      scale,
      marginMm,
      includeDrawing,
      pdf,
      i === 0
    );
  }

  pdf.save(filename);
}

export async function exportTemplatesSeparately(
  templates: CopybookTemplate[],
  options: BatchExportOptions = {}
): Promise<void> {
  if (!templates || templates.length === 0) {
    throw new Error('请选择要导出的字帖模板');
  }

  const { scale = 2, marginMm = 8, includeDrawing = false, progressCallback } = options;

  await waitFontsReady();

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    if (progressCallback) {
      progressCallback(i + 1, templates.length);
    }

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    await renderAndCaptureConfig(
      template.config,
      scale,
      marginMm,
      includeDrawing,
      pdf,
      true
    );

    const filename = `${sanitizeFilename(template.name)}.pdf`;
    pdf.save(filename);

    if (i < templates.length - 1) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }
}

