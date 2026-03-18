"use client"
import { useState } from "react"
import { X, Clock, MessageSquare } from "lucide-react"

interface ModalAcaoProps {
  atividade: any;
  tipo: "resolver" | "renovar" | "excluir";
  fechar: () => void;
  atualizar: () => void;
  user: any; // Recebe o usuário da Home
}

export default function ModalAcao({ atividade, tipo, fechar, atualizar, user }: ModalAcaoProps) {
  const [motivo, setMotivo] = useState("")
  const [novoTempo, setNovoTempo] = useState("")

  const titulos = {
    resolver: "Resolver atividade",
    renovar: "Renovar atividade",
    excluir: "Excluir atividade"
  }

  const coresBotao = {
    resolver: "bg-green-600 hover:bg-green-500 text-white",
    renovar: "bg-amber-600 hover:bg-amber-500 text-white",
    excluir: "bg-red-600 hover:bg-red-500 text-white"
  }

  async function confirmar() {
    if (!motivo.trim()) return alert("Preencha o motivo!");
    if (tipo === "renovar" && !novoTempo) return alert("Selecione o prazo!");

    const novoStatus = 
      tipo === "excluir" ? "excluido" : 
      tipo === "resolver" ? "resolvido" : 
      "renovado";
    
    try {
      // Verifique se atividade.id existe antes de disparar
      if (!atividade?.id) {
          console.error("ID da atividade não encontrado", atividade);
          return alert("Erro interno: ID não localizado.");
      }

      const response = await fetch(`/api/atividades/${atividade.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: novoStatus, // Usando a variável dinâmica
          motivo: motivo.trim(),
          user: user, // Certifique-se que o 'user' da sua Home é {nome, matricula}
          hora_entrega: tipo === "renovar" ? novoTempo : undefined
        })
      });

      if (!response.ok) {
          // Isso vai nos ajudar a ver o erro real no console do navegador
          const erroTexto = await response.text();
          console.error("Detalhes do erro no servidor:", erroTexto);
          throw new Error("Erro na resposta do servidor");
      }

      atualizar();
      fechar();
    } catch (error) {
      console.error("Erro ao processar ação:", error);
      alert("Houve um problema ao salvar. Verifique o console do navegador.");
    }
  }

  const isFormInvalido = !motivo.trim() || (tipo === "renovar" && !novoTempo);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
      <div className="bg-[#161B26] border border-white/10 rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-white/5 px-8 py-4 flex justify-between items-center border-b border-white/5">
          <h2 className="text-gray-200 text-sm font-black uppercase tracking-widest">{titulos[tipo]}</h2>
          <button onClick={fechar} className="bg-white/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          {tipo === "renovar" && (
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase ml-1 flex items-center gap-2">
                <Clock size={12} /> Novo Prazo de Entrega <span className="text-red-500">*</span>
              </label>
              <input 
                type="datetime-local" 
                className="w-full bg-white/5 border border-white/10 p-3.5 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
                onChange={(e) => setNovoTempo(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase ml-1 flex items-center gap-2">
              <MessageSquare size={12} /> {tipo === "resolver" ? "Descrição da Solução" : "Motivo da Alteração"}
            </label>
            <textarea 
              rows={5}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-lg text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              placeholder="Descreva aqui os detalhes da ação..."
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        </div>

        <div className="p-8 pt-0 flex justify-end">
          <button 
            onClick={confirmar}
            disabled={isFormInvalido}
            className={`px-12 py-3 rounded-lg font-black uppercase text-[12px] transition-all active:scale-95 ${isFormInvalido ? "bg-gray-700 text-gray-500 cursor-not-allowed" : coresBotao[tipo]}`}
          >
            {tipo === "renovar" ? "Atualizar" : "Finalizar"}
          </button>
        </div>
      </div>
    </div>
  )
}