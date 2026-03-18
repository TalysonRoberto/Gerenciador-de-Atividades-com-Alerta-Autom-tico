import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verificarAtividadesExpiradas } from "@/lib/monitor";

// Configurações para evitar cache do Next.js e garantir dados em tempo real
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const filePath = path.join(process.cwd(), "data/atividades.json");

export async function GET() {
  try {
    // 1. Monitoria: Verifica estouros de prazo antes de processar números
    await verificarAtividadesExpiradas();

    if (!fs.existsSync(filePath)) return NextResponse.json({});

    const fileData = fs.readFileSync(filePath, "utf-8");
    const atividades: any[] = JSON.parse(fileData || "[]");

    // --- 2. MÉTRICAS GERAIS ---
    // Filtros simples baseados no status atual de cada tarefa
    const total = atividades.length;
    const emAndamento = atividades.filter(a => a.status === "andamento").length;
    const renovadas = atividades.filter(a => a.status === "renovado").length;
    const estouradasSemSolucao = atividades.filter(a => a.status === "estourado").length;
    const excluidas = atividades.filter(a => a.status === "excluido").length;
    const encerradas = atividades.filter(a => a.status === "encerrado").length;

    // --- 3. LÓGICA DE EVOLUÇÃO (GRÁFICO) ---
    // IMPORTANTE: Definir os dias PRIMEIRO para poder usar no map abaixo
    const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }).reverse();

    const evolucao = ultimos7Dias.map(data => {
        // Conta chamados criados nesta data específica
        const criadosNoDia = atividades.filter(a => a.hora_registro.startsWith(data)).length;
        
        // Conta quem foi resolvido NESTA data (olhando o log de ações)
        const resolvidosNoDia = atividades.filter(a => 
            a.status === 'resolvido' && 
            a.registros?.some((r: any) => r.acao === 'resolvido' && r.data.startsWith(data))
        ).length;

        const [, mes, dia] = data.split('-');
        return {
            label: `${dia}/${mes}`,
            total: criadosNoDia,
            resolvidos: resolvidosNoDia
        };
    });

    // --- 4. LÓGICA DE TÉCNICOS E SLA ---
    const resolvidos = atividades.filter(a => a.status === "resolvido");
    let resolvidosNoTempo = 0;
    let resolvidosEstourados = 0;
    const rankingTecnicos: Record<string, number> = {};

    resolvidos.forEach(a => {
      const prazoFinal = new Date(a.hora_entrega);
      const logResolvido = a.registros?.find((r: any) => r.acao === "resolvido");
      const dataResolucao = logResolvido ? new Date(logResolvido.data) : new Date();

      // Cálculo de eficiência (SLA)
      if (dataResolucao <= prazoFinal) {
        resolvidosNoTempo++;
      } else {
        resolvidosEstourados++;
      }
    
      // Ranking: quem assinou a resolução
      const nomeTecnico = logResolvido?.autor?.nome || "Sistema";
      rankingTecnicos[nomeTecnico] = (rankingTecnicos[nomeTecnico] || 0) + 1;
    });

    // Ordenação do Ranking: do técnico com mais resoluções para o com menos
    const tecnicosOrdenados = Object.entries(rankingTecnicos)
      .map(([nome, totalResolvidos]) => ({
        nome,
        total: totalResolvidos
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);

    const produtividadeSLA = total > 0 
      ? Math.round((resolvidosNoTempo / total) * 100) 
      : 0;

    // --- 5. RETORNO UNIFICADO ---
    return NextResponse.json({
      total,
      resolvidosNoTempo,
      resolvidosEstourados,
      estouradasSemSolucao,
      emAndamento,
      renovadas,
      excluidas,
      encerradas,
      evolucao,
      produtividade: `${produtividadeSLA}%`,
      tecnicos: tecnicosOrdenados
    });
    
  } catch (error) {
    console.error("Erro na API Stats:", error);
    return NextResponse.json({ error: "Erro ao processar estatísticas" }, { status: 500 });
  }
}