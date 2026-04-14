import PDFDocument from 'pdfkit';
import { AdminRepository } from '../repositories/admin.repository.js';

const adminRepo = new AdminRepository();

interface ReportData {
  startDate: Date;
  endDate: Date;
}

export class ReportService {
  async generateMetricsPdf(data: ReportData): Promise<Buffer> {
    const metrics = await adminRepo.getMetrics(data.startDate, data.endDate);
    const dashboard = await adminRepo.getDashboardStats();

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const formatDate = (d: Date) =>
        d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text('TL EM PAR', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Relatório de Métricas', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(10).text(
        `Período: ${formatDate(data.startDate)} a ${formatDate(data.endDate)}`,
        { align: 'center' },
      );
      doc.moveDown(0.3);
      doc.fontSize(8).fillColor('#888888').text(
        `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
        { align: 'center' },
      );
      doc.fillColor('#000000');
      doc.moveDown(1);

      // Separator
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc');
      doc.moveDown(1);

      // Dashboard section
      doc.fontSize(16).font('Helvetica-Bold').text('Visão Geral');
      doc.moveDown(0.5);

      const dashItems = [
        ['Total de Usuários', String(dashboard.totalUsers)],
        ['Assinaturas Ativas', String(dashboard.activeSubscriptions)],
        ['Total de Empresas', String(dashboard.totalCompanies)],
        ['Empresas Ativas', String(dashboard.activeCompanies)],
        ['Total de Validações', String(dashboard.totalRedemptions)],
        ['Validações este Mês', String(dashboard.redemptionsThisMonth)],
      ];

      doc.fontSize(10).font('Helvetica');
      for (const [label, value] of dashItems) {
        doc.text(`${label}: `, { continued: true }).font('Helvetica-Bold').text(value);
        doc.font('Helvetica');
      }

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc');
      doc.moveDown(1);

      // Metrics section
      doc.fontSize(16).font('Helvetica-Bold').text('Métricas do Período');
      doc.moveDown(0.5);

      const metricItems = [
        ['Novos Assinantes', String(metrics.newSubscribers)],
        ['Cancelamentos', String(metrics.canceledSubscribers)],
        ['Assinaturas Ativas (total)', String(metrics.totalActiveSubscriptions)],
        ['Receita Estimada (mensal)', `R$ ${metrics.totalRevenue.toFixed(2)}`],
        ['Validações no Período', String(metrics.redemptionsInPeriod)],
        ['Idade Média dos Assinantes', metrics.averageAge ? `${metrics.averageAge} anos` : 'N/A'],
      ];

      doc.fontSize(10).font('Helvetica');
      for (const [label, value] of metricItems) {
        doc.text(`${label}: `, { continued: true }).font('Helvetica-Bold').text(value);
        doc.font('Helvetica');
      }

      doc.moveDown(1);

      // Gender distribution
      if (metrics.genderDistribution.length > 0) {
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc');
        doc.moveDown(1);
        doc.fontSize(14).font('Helvetica-Bold').text('Distribuição por Gênero');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        for (const g of metrics.genderDistribution) {
          doc.text(`${g.gender}: ${g.count}`);
        }
      }

      // Top companies
      if (dashboard.topCompanies.length > 0) {
        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc');
        doc.moveDown(1);
        doc.fontSize(14).font('Helvetica-Bold').text('Top 10 Empresas (por validações)');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');

        // Table header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('#', 50, tableTop, { width: 30 });
        doc.text('Empresa', 80, tableTop, { width: 350 });
        doc.text('Validações', 430, tableTop, { width: 100 });
        doc.font('Helvetica');
        doc.moveDown(0.3);

        dashboard.topCompanies.forEach((c, i) => {
          const y = doc.y;
          doc.text(String(i + 1), 50, y, { width: 30 });
          doc.text(c.name, 80, y, { width: 350 });
          doc.text(String(c.redemptionCount), 430, y, { width: 100 });
          doc.moveDown(0.3);
        });
      }

      doc.end();
    });
  }
}
