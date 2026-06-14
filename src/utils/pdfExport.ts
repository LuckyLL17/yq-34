import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  scale?: number;
  usePrintBackground?: boolean;
}

export async function exportToPdf(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const { filename = '字帖.pdf', scale = 2 } = options;

  if (!element) {
    throw new Error('找不到要导出的元素');
  }

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const pdf = new jsPDF({
    orientation: imgWidth > imgHeight ? 'l' : 'p',
    unit: 'px',
    format: [imgWidth, imgHeight],
    compress: true,
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

  const pages = Math.ceil(imgHeight / imgWidth / 1.414);
  if (pages > 1) {
    const pageHeightPx = imgWidth * 1.414;
    for (let i = 1; i < pages; i++) {
      pdf.addPage([imgWidth, pageHeightPx], imgWidth > pageHeightPx ? 'l' : 'p');
      const offset = i * pageHeightPx * scale;
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      const sliceHeight = Math.min(canvas.height - offset, pageHeightPx * scale);
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvas,
          0,
          offset,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );
        const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(
          sliceImgData,
          'JPEG',
          0,
          0,
          imgWidth,
          sliceHeight / scale,
          undefined,
          'FAST'
        );
      }
    }
  }

  pdf.save(filename);
}

export async function exportToPdfA4(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const { filename = '字帖-A4.pdf', scale = 2 } = options;

  if (!element) {
    throw new Error('找不到要导出的元素');
  }

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const marginMm = 10;
  const maxWidthMm = pageWidthMm - marginMm * 2;
  const maxHeightMm = pageHeightMm - marginMm * 2;

  const imgRatio = canvas.width / canvas.height;
  let drawWidthMm = maxWidthMm;
  let drawHeightMm = drawWidthMm / imgRatio;

  if (drawHeightMm > maxHeightMm) {
    drawHeightMm = maxHeightMm;
    drawWidthMm = drawHeightMm * imgRatio;
  }

  const xMm = (pageWidthMm - drawWidthMm) / 2;
  const yMm = marginMm;

  pdf.addImage(
    imgData,
    'JPEG',
    xMm,
    yMm,
    drawWidthMm,
    drawHeightMm,
    undefined,
    'FAST'
  );

  pdf.save(filename);
}
