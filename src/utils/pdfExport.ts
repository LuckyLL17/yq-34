import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  scale?: number;
  marginMm?: number;
}

async function waitFontsReady(): Promise<void> {
  try {
    if (document && (document as any).fonts && (document as any).fonts.ready) {
      await (document as any).fonts.ready;
      await new Promise((r) => setTimeout(r, 300));
    }
  } catch (e) {
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function capturePage(
  element: HTMLElement,
  scale: number
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
  const { filename = '字帖.pdf', scale = 2, marginMm = 8 } = options;

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
      scale
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
