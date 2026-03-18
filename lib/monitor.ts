import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/atividades.json");
// URL configurada como "Qualquer pessoa" no Power Automate
const POWER_AUTOMATE_URL = "https://030c180aed64e15d80b27beed05970.ed.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/80b0f69822c74ac7a0849c5dc18145c3/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5xPAnDnB2Y0u2Y1LRn1AatY6TEaPMdyFt0Uuw5oJFu0";

export async function verificarAtividadesExpiradas() {
  if (!fs.existsSync(filePath)) return;

  const data = fs.readFileSync(filePath, "utf-8");
  const atividades = JSON.parse(data);
  let houveAlteracao = false;
  const agora = new Date();

  for (const ativ of atividades) {
    const entrega = new Date(ativ.hora_entrega);
    
    // 1. ATUALIZAÇÃO DE STATUS: Se venceu e ainda estava 'andamento' ou 'renovado'
    const statusAtivos = ["andamento", "renovado"];
    if (statusAtivos.includes(ativ.status) && agora >= entrega) {
      ativ.status = "estourado";
      houveAlteracao = true;
      console.log(`🟠 Status alterado para ESTOURADO: ${ativ.referencia}`);
    }

    // 2. LÓGICA DE NOTIFICAÇÃO: Verifica se deve avisar o Teams
    // Notifica se estiver estourado E tiver passado 1 minuto da última notificação
    const podeNotificar = !ativ.ultima_notificacao || 
      (agora.getTime() - new Date(ativ.ultima_notificacao).getTime()) >= 60000;

    if (ativ.status === "estourado" && podeNotificar) {
      console.log(`🚨 ALERTA TEAMS: ${ativ.referencia} - ${ativ.nome}`);

      try {
        const res = await fetch(POWER_AUTOMATE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referencia: ativ.referencia,
            nome: ativ.nome,
            descricao: ativ.descricao,
            hora_entrega: ativ.hora_entrega,
            status: "EXPIRADO"
          })
        });

        if (res.ok) {
          ativ.ultima_notificacao = new Date().toISOString();
          houveAlteracao = true;
          console.log("✅ Notificação enviada com sucesso.");
        } else {
          const erro = await res.text();
          console.error(`❌ Erro HTTP ${res.status}:`, erro);
        }
      } catch (error) {
        console.error("❌ Falha na conexão com Power Automate:", error);
      }
    }
  }

  if (houveAlteracao) {
    fs.writeFileSync(filePath, JSON.stringify(atividades, null, 2));
  }
}