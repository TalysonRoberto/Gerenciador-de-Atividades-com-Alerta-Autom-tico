"use client"
import { useState } from "react"
import { X } from "lucide-react"
import RecorrenciaSelector from "./RecorrenciaSelector"

interface ModalCriarProps {
  fechar: () => void;
  atualizar: () => void;
  user: any; // Recebe o usuário da Home
}

export default function ModalCriarAtividade({ fechar, atualizar, user }: ModalCriarProps) {
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [horaEntrega, setHoraEntrega] = useState("")
  const [recorrente, setRecorrente] = useState(false);
  const [diasRecorrencia, setDiasRecorrencia] = useState<number[]>([]);

  async function criar() {
    if (!nome || !horaEntrega) return alert("Preencha o nome e o prazo!");

    try {
      const response = await fetch("/api/atividades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nova: {
            nome,
            descricao,
            hora_entrega: horaEntrega,
            recorrente,
            dias_semana: recorrente ? diasRecorrencia : [],
          },
          user: user // RASTREABILIDADE: Quem criou
        })
      });

      if (!response.ok) throw new Error("Erro ao criar atividade");

      atualizar();
      fechar();
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao criar atividade.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#161B26] border border-white/10 rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="bg-white/5 px-8 py-4 flex justify-between items-center border-b border-white/5">
          <h2 className="text-gray-200 text-sm font-black uppercase tracking-widest">Registrar atividade</h2>
          <button onClick={fechar} className="bg-white/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase ml-1">Nome da atividade</label>
              <input
                placeholder="Ex: Enviar Relatório"
                className="w-full bg-white/5 border border-white/10 p-3.5 rounded-lg text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase ml-1">Prazo de Entrega</label>
              <input
                type="datetime-local"
                className="w-full bg-white/5 border border-white/10 p-3.5 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
                onChange={(e) => setHoraEntrega(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase ml-1">Descrição</label>
            <textarea
              placeholder="Detalhes sobre a tarefa..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-lg text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-t border-white/5 pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-[11px] font-black text-gray-500 uppercase">Atividade Recorrente?</label>
                <button 
                  onClick={() => setRecorrente(!recorrente)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${recorrente ? 'bg-blue-600' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${recorrente ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              {recorrente && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <RecorrenciaSelector selecionados={diasRecorrencia} onChange={setDiasRecorrencia} />
                </div>
              )}
            </div>
            
            <button
              className="w-full md:w-auto bg-gray-200 hover:bg-white text-[#161B26] px-12 py-3 rounded-lg font-black uppercase text-[12px] shadow-lg transition-all active:scale-95"
              onClick={criar}
            >
              Criar Atividade
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}