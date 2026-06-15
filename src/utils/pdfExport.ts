import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import CopybookPreview from '@/components/Preview/CopybookPreview';
import type { CopybookConfig, CopybookTemplate } from '@/types';

export type PaperSize = 'a4' | 'a5' | 'letter' | 'legal';
export type PageOrientation = 'portrait' | 'landscape';
export type ExportFormat = 'pdf' | 'png' | 'jpg';
export type ImageQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface ExportOptions {
  filename?: string;
  scale?: number;
  marginMm?: number;
  includeDrawing?: boolean;
  paperSize?: PaperSize;
  orientation?: PageOrientation;
  format?: ExportFormat;
  imageQuality?: ImageQuality;
  pageRange?: 'all' | 'current' | [number, number];
  currentPageIndex?: number;
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
  includeDrawing: boolean,
  format: ExportFormat = 'pdf',
  quality: ImageQuality = 'high'
): Promise<{ canvas: HTMLCanvasElement; dataUrl: string; width: number; height: number }> {
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

  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const jpegQuality = JPEG_QUALITY[quality];

  return {
    canvas,
    dataUrl: canvas.toDataURL(mimeType, jpegQuality),
    width: canvas.width,
    height: canvas.height,
  };
}

export async function exportCopybook(
  container: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = '字帖',
    scale,
    marginMm = 8,
    includeDrawing = true,
    paperSize = 'a4',
    orientation = 'portrait',
    format = 'pdf',
    imageQuality = 'high',
    pageRange = 'all',
    currentPageIndex = 0,
  } = options;

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

  const filteredPages = filterPageElements(pageElements, pageRange, currentPageIndex);
  const actualScale = scale || QUALITY_SCALE[imageQuality];
  const safeFilename = sanitizeFilename(filename);

  if (format === 'pdf') {
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: paperSize,
      compress: true,
    });

    const { width: pageWidthMm, height: pageHeightMm } = getPaperDimensions(paperSize, orientation);
    const drawWidthMm = pageWidthMm - marginMm * 2;
    const drawHeightMm = pageHeightMm - marginMm * 2;

    for (let i = 0; i < filteredPages.length; i++) {
      const pageEl = filteredPages[i];

      const { dataUrl, width: imgW, height: imgH } = await capturePage(
        pageEl,
        actualScale,
        includeDrawing,
        'pdf',
        imageQuality
      );

      if (i > 0) {
        pdf.addPage(paperSize, orientation);
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

      const imgFormat = 'JPEG';
      pdf.addImage(dataUrl, imgFormat, x, y, w, h, undefined, 'FAST');
    }

    pdf.save(`${safeFilename}.pdf`);
  } else {
    for (let i = 0; i < filteredPages.length; i++) {
      const pageEl = filteredPages[i];
      const { dataUrl } = await capturePage(
        pageEl,
        actualScale,
        includeDrawing,
        format,
        imageQuality
      );

      const link = document.createElement('a');
      const pageIndex = Number(pageEl.getAttribute('data-page-index'));
      const suffix = filteredPages.length > 1 ? `_第${pageIndex + 1}页` : '';
      link.download = `${safeFilename}${suffix}.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (i < filteredPages.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  }
}

export async function exportCopybookToPdf(
  container: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  return exportCopybook(container, { ...options, format: 'pdf' });
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

const PAPER_SIZES_MM: Record<PaperSize, { width: number; height: number }> = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
};

const QUALITY_SCALE: Record<ImageQuality, number> = {
  low: 1,
  medium: 2,
  high: 3,
  ultra: 4,
};

const JPEG_QUALITY: Record<ImageQuality, number> = {
  low: 0.7,
  medium: 0.85,
  high: 0.95,
  ultra: 0.98,
};

function getPaperDimensions(
  paperSize: PaperSize,
  orientation: PageOrientation
): { width: number; height: number } {
  const size = PAPER_SIZES_MM[paperSize];
  if (orientation === 'landscape') {
    return { width: size.height, height: size.width };
  }
  return size;
}

function filterPageElements(
  pageElements: HTMLElement[],
  pageRange: ExportOptions['pageRange'],
  currentPageIndex: number
): HTMLElement[] {
  if (pageRange === 'all' || !pageRange) {
    return pageElements;
  }
  if (pageRange === 'current') {
    const page = pageElements.find(
      (el) => Number(el.getAttribute('data-page-index')) === currentPageIndex
    );
    return page ? [page] : pageElements.slice(0, 1);
  }
  if (Array.isArray(pageRange)) {
    const [start, end] = pageRange;
    return pageElements.filter((el) => {
      const idx = Number(el.getAttribute('data-page-index'));
      return idx >= start && idx <= end;
    });
  }
  return pageElements;
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

