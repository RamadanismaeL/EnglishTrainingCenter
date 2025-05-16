import { ElementRef, Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfExportEnrollmentFormService {
  constructor() {}

  async exportToPdf(element: HTMLElement | ElementRef, filename: string = 'document.pdf'): Promise<void> {
    const domElement = element instanceof ElementRef ? element.nativeElement : element;

    if (!domElement) {
      console.warn('Elemento inválido para exportação.');
      return;
    }

    const canvas = await html2canvas(domElement, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgProps = {
      width: canvas.width,
      height: canvas.height,
    };

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Convert canvas dimensions to mm (pixels * 25.4 / 96)
    const pxToMm = (px: number) => (px * 25.4) / 96;
    const imgWidthMm = pxToMm(imgProps.width);
    const imgHeightMm = pxToMm(imgProps.height);

    const scale = pageWidth / imgWidthMm;
    const scaledHeight = imgHeightMm * scale;

    let position = 0;

    if (scaledHeight <= pageHeight) {
      // Se cabe em uma página
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, scaledHeight);
    } else {
      // Se precisa de múltiplas páginas
      let remainingHeight = scaledHeight;
      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, scaledHeight);
        remainingHeight -= pageHeight;
        position -= pageHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    }

    pdf.save(filename);
  }
}
