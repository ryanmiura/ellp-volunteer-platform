import type { Volunteer } from '../types/volunteer.types';

/**
 * Service for generating PDF documents
 * Creates participation certificates and volunteer reports
 */
export const pdfService = {
  /**
   * Generate a participation certificate for a volunteer
   * Uses canvas-based rendering to create a professional PDF
   */
  async generateParticipationCertificate(volunteer: Volunteer): Promise<void> {
    // Dynamically import dependencies to avoid bundling issues
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    // Create HTML content for the certificate
    const certificateHTML = this.createCertificateHTML(volunteer);

    // Create temporary container
    const container = document.createElement('div');
    container.innerHTML = certificateHTML;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    document.body.appendChild(container);

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      // Create PDF from canvas
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

      // Download the PDF
      pdf.save(`certificado-${volunteer.name.replace(/\s+/g, '-')}.pdf`);
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
  },

  /**
   * Generate a detailed participation report for a volunteer
   */
  async generateParticipationReport(volunteer: Volunteer): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Set text properties
    pdf.setFont('Helvetica', 'normal');

    // Header
    pdf.setFillColor(242, 242, 242);
    pdf.rect(margin, yPosition, pageWidth - margin * 2, 20, 'F');
    pdf.setFontSize(18);
    pdf.setTextColor(25, 118, 210);
    pdf.text('RELATÓRIO DE PARTICIPAÇÃO', pageWidth / 2, yPosition + 12, { align: 'center' });

    yPosition += 25;

    // Volunteer Information
    pdf.setFontSize(12);
    pdf.setTextColor(25, 118, 210);
    pdf.text('Informações do Voluntário', margin, yPosition);

    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    const volunteerInfo = [
      [`Nome:`, volunteer.name],
      [`Email:`, volunteer.email],
      [`Telefone:`, volunteer.phone || 'Não informado'],
      [`Status:`, volunteer.is_active ? 'Ativo' : 'Inativo'],
      [`Data de Entrada:`, new Date(volunteer.entry_date).toLocaleDateString('pt-BR')],
    ];

    volunteerInfo.forEach(([label, value]) => {
      pdf.text(`${label} ${value}`, margin + 5, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Academic Information (if applicable)
    if (volunteer.is_academic) {
      pdf.setFontSize(12);
      pdf.setTextColor(25, 118, 210);
      pdf.text('Informações Acadêmicas', margin, yPosition);

      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      const academicInfo = [
        [`Curso:`, volunteer.course || 'N/A'],
        [`RA:`, volunteer.ra || 'N/A'],
      ];

      academicInfo.forEach(([label, value]) => {
        pdf.text(`${label} ${value}`, margin + 5, yPosition);
        yPosition += 6;
      });

      yPosition += 5;
    }

    // Workshops participation
    if (volunteer.workshops && volunteer.workshops.length > 0) {
      pdf.setFontSize(12);
      pdf.setTextColor(25, 118, 210);
      pdf.text(`Oficinas Participadas (${volunteer.workshops.length})`, margin, yPosition);

      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      volunteer.workshops.forEach((workshop, index) => {
        pdf.text(`${index + 1}. ${typeof workshop === 'string' ? workshop : 'Oficina'}`, margin + 5, yPosition);
        yPosition += 6;

        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      });
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Documento gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    pdf.save(`relatorio-${volunteer.name.replace(/\s+/g, '-')}.pdf`);
  },

  /**
   * Create HTML for a professional certificate
   */
  createCertificateHTML(volunteer: Volunteer): string {
    const entryDate = new Date(volunteer.entry_date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const workshopCount = volunteer.workshops?.length || 0;

    return `
      <div style="
        width: 800px;
        height: 600px;
        padding: 40px;
        background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
        font-family: 'Georgia', serif;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border: 3px solid #1976d2;
        box-sizing: border-box;
      ">
        <div style="text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #1976d2; margin-bottom: 10px;">
            CERTIFICADO DE PARTICIPAÇÃO
          </div>
          <div style="border-bottom: 2px solid #1976d2; width: 60%; margin: 0 auto; padding: 10px 0; margin-bottom: 30px;"></div>
        </div>

        <div style="text-align: center; font-size: 18px; color: #333; line-height: 1.8;">
          <p style="margin: 10px 0;">
            Por este meio, certificamos que
          </p>
          <p style="font-size: 24px; font-weight: bold; color: #1976d2; margin: 20px 0;">
            ${volunteer.name}
          </p>
          <p style="margin: 10px 0;">
            participou como voluntário do projeto
          </p>
          <p style="font-size: 20px; font-weight: bold; color: #1976d2; margin: 15px 0;">
            ELLP - Ensino Lúdico de Lógica e Programação
          </p>
        </div>

        <div style="text-align: center; font-size: 14px; color: #666; margin: 20px 0;">
          <p>Data de Participação: ${entryDate}</p>
          <p>Total de Oficinas Participadas: ${workshopCount}</p>
          <p>${volunteer.is_academic ? `Curso: ${volunteer.course || 'N/A'} | RA: ${volunteer.ra || 'N/A'}` : 'Voluntário Externo'}</p>
        </div>

        <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
          <p>
            Documento emitido em ${new Date().toLocaleDateString('pt-BR')}<br/>
            Projeto ELLP - Universidade Tecnológica Federal do Paraná
          </p>
        </div>
      </div>
    `;
  },

  /**
   * Generate batch participation report for multiple volunteers
   */
  async generateBatchReport(volunteers: Volunteer[]): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    pdf.setFont('Helvetica', 'normal');

    // Title
    pdf.setFontSize(16);
    pdf.setTextColor(25, 118, 210);
    pdf.text('RELATÓRIO DE VOLUNTÁRIOS', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Relatório contendo ${volunteers.length} voluntário(s)`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;

    // Table header
    pdf.setFillColor(242, 242, 242);
    pdf.setFontSize(9);
    pdf.setTextColor(25, 118, 210);

    pdf.rect(margin, yPosition, pageWidth - margin * 2, 7, 'F');
    pdf.text('Nome', margin + 2, yPosition + 5);
    pdf.text('Email', margin + 60, yPosition + 5);
    pdf.text('Oficinas', margin + 120, yPosition + 5);
    pdf.text('Status', margin + 150, yPosition + 5);

    yPosition += 10;

    // Volunteer rows
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);

    volunteers.forEach((volunteer, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPosition, pageWidth - margin * 2, 6, 'F');
      }

      pdf.text(volunteer.name, margin + 2, yPosition + 4);
      pdf.text(volunteer.email, margin + 60, yPosition + 4);
      pdf.text(`${volunteer.workshops?.length || 0}`, margin + 120, yPosition + 4);
      pdf.text(volunteer.is_active ? 'Ativo' : 'Inativo', margin + 150, yPosition + 4);

      yPosition += 6;

      // Add new page if necessary
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    pdf.save(`relatorio-voluntarios-${new Date().toISOString().split('T')[0]}.pdf`);
  },
};

