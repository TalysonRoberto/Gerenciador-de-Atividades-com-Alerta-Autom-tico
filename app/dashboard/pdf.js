import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const gerarRelatorioPDF = (stats) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('pt-BR');
  const time = new Date().toLocaleTimeString('pt-BR');

  // Cores da Identidade TASK
  const primaryBlue = [9, 200, 227]; // #09C8E3
  const darkNavy = [11, 15, 26];    // #0B0F1A

  // 1. HEADER PREMIUM
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 33, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("TASK.", 15, 22);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("RELATÓRIO TÉCNICO DE PERFORMANCE", 15, 28);

  doc.setFontSize(9);
  doc.text(`EMISSÃO: ${date} às ${time}`, 155, 20);

  // 2. RESUMO EXECUTIVO (KPIs)
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. Resumo Executivo (SLA & Volumetria)", 15, 50);

  // Funções auxiliares de lógica para manter o código limpo
const getSlaStatus = (produtividade) => {
  const valor = parseFloat(produtividade) || 0;
  if (valor >= 100) return 'Ótimo';
  if (valor >= 80) return 'Moderado';
  if (valor < 40) return 'Crítico';
  if (valor < 60) return 'Em Alerta';
  return 'Em conformidade';
};

const getRetrabalhoStatus = (renovadas) => {
  if (renovadas > 5) return 'Alerta';
  if (renovadas > 3) return 'Atenção';
  return 'Normal';
};

const getForaPrazoStatus = (estourados) => {
  if (estourados >= 5) return 'Crítico';
  if (estourados >= 2) return 'Ruim';
  return 'Bom';
};

autoTable(doc, {
  startY: 55,
  head: [['Indicador', 'Valor Nominal', 'Status']],
  body: [
        ['Volume Total de Atividades', stats?.total || 0, 'Monitorado'],
        [
        'Eficiência de Entrega (SLA)', 
        stats?.produtividade || '0%', 
        getSlaStatus(stats?.produtividade)
        ],
        ['Atividades em Andamento', stats?.emAndamento || 0, '--'],
        [
        'Índice de Retrabalho (Renovadas)', 
        stats?.renovadas || 0, 
        getRetrabalhoStatus(stats?.renovadas)
        ],
        ['Taxa de Sucesso (No Prazo)', stats?.resolvidosNoTempo || 0, '--'],
        [
        'Resolvido fora do prazo', 
        stats?.resolvidosEstourados || 0, 
        getForaPrazoStatus(stats?.resolvidosEstourados)
        ],
        [
        'Passivo Crítico (Estouradas)', 
        stats?.estouradasSemSolucao || 0, 
        (stats?.estouradasSemSolucao > 0 ? 'Crítico' : 'Zerado')
        ],
    ],

    });

  // 3. PERFORMANCE POR TÉCNICO
  const tecnicoY = (doc).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("2. Desempenho Analítico por Analista", 15, tecnicoY);

  const totalResolvidos = (stats?.resolvidosNoTempo || 0) + (stats?.resolvidosEstourados || 0);
  const tecnicosData = stats?.tecnicos?.map((t) => [
    t.nome.toUpperCase(), 
    t.total, 
    totalResolvidos > 0 ? ((t.total / totalResolvidos) * 100).toFixed(1) + '%' : '0%'
  ]) || [];

  autoTable(doc, {
    startY: tecnicoY + 5,
    head: [['Analista', 'Total Resolvido', 'Representatividade']],
    body: tecnicosData,
    theme: 'grid',
    headStyles: { fillColor: primaryBlue, textColor: [255, 255, 255] },
    styles: { fontSize: 9 }
  });

  // 4. RODAPÉ E ASSINATURA
  const finalY = (doc).lastAutoTable.finalY + 20;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text([
    "Notas de Auditoria:",
    "- Documento gerado via interface Task.",
    "- Dados auditados automaticamente com base no histórico de chamados."
  ], 15, finalY);

  doc.setDrawColor(200, 200, 200);
  doc.line(70, 275, 140, 275);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Coordenação de Operações Lanlink", 83, 280);

  // Salva o arquivo
  doc.save(`TASK_RELATORIO_${date.split('/').reverse().join('-')}.pdf`);
};