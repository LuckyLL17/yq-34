import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  scale?: number;
  marginMm?: number;
}

export async function exportCopybookToPdf(
  container: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const { filename = '字帖.pdf', scale = 2, marginMm = 8 } = options;

  if (!container) {
    throw new Error('找不到要导出的元素');
  }

  const pageElements = container.querySelectorAll<HTMLElement>('[data-page-index]');
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

    const canvas = await html2canvas(pageEl, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    if (i > 0) {
      pdf.addPage('a4', 'p');
    }

    const imgRatio = canvas.width / canvas.height;
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

    pdf.addImage(imgData, 'JPEG', x, y, w, h, undefined, 'FAST');
  }

  pdf.save(filename);
}
