import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verificarAtividadesExpiradas } from "@/lib/monitor";

const filePath = path.join(process.cwd(), "data/atividades.json");

const getAtividades = () => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf-8");
  return data ? JSON.parse(data) : [];
};

export async function GET() {
  // 1. Atualiza status para 'estourado' antes de retornar os dados
  await verificarAtividadesExpiradas();

  let atividades = getAtividades();
  const hoje = new Date();
  const diaSemanaHoje = hoje.getDay(); 
  let houveAlteracao = false;

  // 2. Lógica de Recorrência Diária
  atividades = atividades.map((ativ: any) => {
    if (ativ.recorrente && ativ.dias_semana?.includes(diaSemanaHoje)) {
      const dataEntrega = new Date(ativ.hora_entrega);
      if (dataEntrega.setHours(0,0,0,0) < hoje.setHours(0,0,0,0)) {
        houveAlteracao = true;
        const novaEntrega = new Date();
        const original = new Date(ativ.hora_entrega);
        novaEntrega.setHours(original.getHours(), original.getMinutes(), 0, 0);

        return {
          ...ativ,
          status: "andamento",
          hora_registro: new Date().toISOString(),

          // Atualizamos os dois para o novo ciclo da tarefa recorrente
          hora_entrega: novaEntrega.toISOString(),
          hora_entrega_inicial: novaEntrega.toISOString(),
          
          motivo: "",
          registros: [] // Reinicia o log para o novo ciclo da tarefa recorrente
        };
      }
    }
    return ativ;
  });

  if (houveAlteracao) fs.writeFileSync(filePath, JSON.stringify(atividades, null, 2));
  
  return NextResponse.json(atividades);
}

export async function POST(req: Request) {
  const body = await req.json(); // Espera { nova: {...}, user: {nome, matricula} }
  const atividades = getAtividades();

  const numeroReferencia = (atividades.length + 1).toString().padStart(4, '0');

  const objetoFinal = {
    ...body.nova,
    id: Date.now(),
    referencia: `#${numeroReferencia}`,
    status: "andamento",
    hora_registro: new Date().toISOString(),

    // NOVIDADE: Salvando o prazo inicial para comparação futura
    hora_entrega: body.nova.hora_entrega,
    hora_entrega_inicial: body.nova.hora_entrega,

    // RASTREABILIDADE: Quem criou
    criado_por: {
      nome: body.user?.nome,
      matricula: body.user?.matricula
    },
    recorrente: body.nova.recorrente || false,
    dias_semana: body.nova.dias_semana || [],
    registros: [], 
    motivo: "" 
  };

  atividades.push(objetoFinal);
  fs.writeFileSync(filePath, JSON.stringify(atividades, null, 2));
  
  return NextResponse.json({ ok: true });
}