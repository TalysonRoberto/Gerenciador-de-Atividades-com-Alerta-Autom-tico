import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/atividades.json");

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!fs.existsSync(filePath)) return NextResponse.json({ erro: "Arquivo não encontrado" }, { status: 500 });

    const data = fs.readFileSync(filePath, "utf-8");
    let atividades = JSON.parse(data);

    const index = atividades.findIndex((a: any) => String(a.id) === String(id));

    if (index === -1) {
      return NextResponse.json({ erro: "Atividade não encontrada" }, { status: 404 });
    }

    const atividadeAntiga = atividades[index];

    // Criar o log de auditoria da ação
    const novoLog = {
      id: Date.now(),
      infor: body.motivo || "Ação realizada",
      data: new Date().toISOString(),
      autor: {
        nome: body.user?.nome || "Usuário Desconhecido",
        matricula: body.user?.matricula || "---"
      },
      acao: body.status
    };

    // Lógica para manter a data inicial mesmo em registros antigos que não a possuem
    const dataInicialSegura = atividadeAntiga.hora_entrega_inicial || atividadeAntiga.hora_entrega;

    if (body.status === "renovado") {
      atividades[index] = {
        ...atividadeAntiga,
        hora_entrega_inicial: dataInicialSegura, // Garante que a inicial nunca se perca
        status: "renovado",
        hora_entrega: body.hora_entrega, // Atualiza apenas o prazo ATUAL
        registros: [...(atividadeAntiga.registros || []), novoLog],
        ultima_atualizacao: new Date().toISOString(),
        notificado: false 
      };
    } else {
      // Resolvido ou Excluído
      atividades[index] = {
        ...atividadeAntiga,
        hora_entrega_inicial: dataInicialSegura, // Mantém a inicial aqui também
        status: body.status,
        motivo: body.motivo,
        registros: [...(atividadeAntiga.registros || []), novoLog],
        ultima_atualizacao: new Date().toISOString()
      };
    }

    fs.writeFileSync(filePath, JSON.stringify(atividades, null, 2));
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error("Erro na API PUT:", error);
    return NextResponse.json({ erro: "Falha ao atualizar atividade" }, { status: 500 });
  }
}