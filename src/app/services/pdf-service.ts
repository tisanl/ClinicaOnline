import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private readonly logoUrl = 'assets/favicon.png';
  private readonly nombreClinica = 'Clínica Online';

  crearPdfVacio(): jsPDF {
    return new jsPDF('p', 'mm', 'a4');
  }

  private descargarPdf(pdf: jsPDF, nombreArchivo: string) {
    pdf.save(nombreArchivo);
  }

  drawLabelValue(pdf: jsPDF, label: string, value: string, x: number, y: number) {
    const labelText = `${label}:`;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);

    const labelWidth = pdf.getTextWidth(labelText);
    pdf.text(labelText, x, y);

    pdf.setFont('helvetica', 'normal');
    pdf.text(` ${value}`, x + labelWidth, y);
  }

  async agregarEncabezado(pdf: jsPDF, titulo: string) {
    const margen = 20;

    let x = margen;
    let y = margen;

    // logo
    const logo = new Image();
    logo.src = this.logoUrl;
    await logo.decode();

    pdf.addImage(logo, 'PNG', x, y, 18, 18);

    // nombre de la clínica
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(this.nombreClinica, x + 24, y + 7);

    // título
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(titulo, x + 24, y + 14);

    // línea separadora
    y += 25;
    pdf.line(margen, y, 190 - margen, y);

    return { nextY: y + 10 };
  }

  async agregarContenidoHistoriaClinica(pdf: jsPDF, turnos: any[], yInicio: number): Promise<number> {
    const marginLeft = 20;
    const bottomMargin = 20;   // mismo valor que usás como margen en el header
    const lineHeight = 6;

    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = yInicio;

    const ensureSpace = async (lines: number = 1) => {
      // si lo próximo que voy a escribir se pasa del margen inferior, salto de página
      if (y + lines * lineHeight > pageHeight - bottomMargin) {
        pdf.addPage();
        const { nextY } = await this.agregarEncabezado(pdf, 'Historia Clinica');
        y = nextY; // sigo escribiendo justo debajo del encabezado de la nueva hoja
      }
    };

    for (const t of turnos) {
      const hc = t.historia_clinica ?? {};
      const campos = hc.campos_dinamicos ?? [];

      // Día
      await ensureSpace(1);
      const diaTexto = `Día: ${new Date(t.dia).toLocaleDateString('es-AR')} ${t.hora.slice(0, 5)}`;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(diaTexto, marginLeft, y);
      y += lineHeight;

      // Paciente
      await ensureSpace(1);
      this.drawLabelValue(pdf, 'Paciente', `${t.paciente?.apellido} ${t.paciente?.nombre}`, marginLeft, y);
      y += lineHeight;

      // Especialista
      await ensureSpace(1);
      this.drawLabelValue(pdf, 'Especialista', `${t.especialista?.apellido} ${t.especialista?.nombre}`, marginLeft, y);
      y += lineHeight;

      // Especialidad
      await ensureSpace(1);
      this.drawLabelValue(pdf, 'Especialidad', t.especialidad?.nombre ?? '', marginLeft, y);
      y += lineHeight * 2;

      // Título historia clínica
      await ensureSpace(1);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Datos de la consulta', marginLeft, y);
      y += lineHeight;

      // Campos fijos
      await ensureSpace(4);
      this.drawLabelValue(pdf, 'Altura', String(hc.altura ?? ''), marginLeft, y);
      y += lineHeight;

      this.drawLabelValue(pdf, 'Peso', String(hc.peso ?? ''), marginLeft, y);
      y += lineHeight;

      this.drawLabelValue(pdf, 'Temperatura', String(hc.temperatura ?? ''), marginLeft, y);
      y += lineHeight;

      this.drawLabelValue(pdf, 'Presión', String(hc.presion ?? ''), marginLeft, y);
      y += lineHeight;

      // Campos dinámicos
      for (const campo of campos) {
        if (!campo.clave) continue;

        await ensureSpace(1);
        let valorTexto: string;
        if (campo.valor === true) valorTexto = 'Si';
        else if (campo.valor === false) valorTexto = 'No';
        else valorTexto = String(campo.valor ?? '');

        this.drawLabelValue(pdf, campo.clave, valorTexto, marginLeft, y);
        y += lineHeight;
      }

      // Línea separadora
      await ensureSpace(2);
      pdf.line(marginLeft, y + 3, 190 - marginLeft, y + 3);
      y += lineHeight * 2;
    }

    return y;
  }

  async descargarHistoriaClinica(turnos: any[]) {
    const pdf = this.crearPdfVacio();

    const { nextY } = await this.agregarEncabezado(pdf, 'Historia Clinica');

    await this.agregarContenidoHistoriaClinica(pdf, turnos, nextY);

    this.descargarPdf(pdf, 'historia-clinica');
  }
}