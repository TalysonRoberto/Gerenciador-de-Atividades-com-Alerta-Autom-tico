"use client"
import React from "react";
import { X, Clock, Calendar, AlignLeft, Tag, Repeat, User } from "lucide-react";

const DIAS_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function ModalDetalhes({ atividade, fechar }: { atividade: any, fechar: () => void }) {
  if (!atividade) return null;

  const formatarData = (d: string) => new Date(d).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#161B26] border border-white/10 rounded-lg shadow-2xl h-[90vh] w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho */}
        <div className="bg-white/5 px-8 py-4 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-mono text-white-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {atividade.referencia || "#0000"}
            </span>
            <h2 className="text-gray-200 text-sm font-black uppercase tracking-widest">
              Detalhe da atividade
            </h2>
          </div>
          <button onClick={fechar} className="bg-white/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>
        
        <div className="px-8 py-4 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Título e Criador */}
          <div className="flex justify-between md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase flex items-center gap-2">
                <Tag size={12} /> Titulo
              </label>
              <p className="text-lg font-bold text-gray-200 leading-tight">{atividade.nome}</p>
              
              {/* CORREÇÃO: Acessando .nome do objeto criado_por */}
              <div className="flex items-center gap-2 text-[10px] text-blue-400 font-mono uppercase">
                <User size={10} />
                Aberto por: {atividade.criado_por?.nome} 
              </div>
            </div>

            {/* Recorrência */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase flex items-center gap-2">
                <Repeat size={12} /> Recorrência
              </label>
              <div className="flex gap-1.5">
                {DIAS_LABELS.map((label, idx) => {
                  const isAtivo = atividade.recorrente && atividade.dias_semana?.includes(idx);
                  return (
                    <div key={idx} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${isAtivo ? "bg-green-500 border-green-400 text-[#161B26]" : "bg-white/5 border-white/10 text-gray-600"}`}>
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase flex items-center gap-2">
              <AlignLeft size={12} /> Descrição
            </label>
            <div className="bg-white/5 border border-white/10 p-5 rounded-sm text-gray-300 leading-relaxed max-h-[150px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
              {atividade.descricao || "Nenhuma descrição detalhada."}
            </div>
          </div>

          {/* Histórico com autor dinâmico */}
          {atividade.registros && atividade.registros.length > 0 && (
            <div className="space-y-3">
              <label className="text-[11px] font-black text-orange-600 uppercase flex items-center gap-2">
                Histórico de Alterações
              </label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {atividade.registros.map((reg: any) => (
                  <div key={reg.id} className="bg-orange-600/5 p-4 rounded-sm border border-orange-600/20 text-[12px] flex flex-col gap-3">
                    <p className="text-gray-300 italic">"{reg.infor}"</p>
                    <div className="flex justify-between items-center border-t border-white/5 pt-2">
                      {/* CORREÇÃO: Acessando reg.autor.nome */}
                      <span className="text-[12px] text-orange-800 tracking-tighter">
                        Atualizado: {reg.autor?.nome}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {new Date(reg.data).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Desfecho Final */}
          {atividade.motivo && (atividade.status === 'resolvido' || atividade.status === 'excluido') && (
            <div className="space-y-2">
              <label className="text-[11px] font-black text-green-500 uppercase flex items-center gap-2">
                Desfecho Final
              </label>
              <div className="bg-green-500/5 border border-green-500/20 p-5 rounded-sm text-gray-300 flex flex-col gap-3">
                <p>{atividade.motivo}</p>
                <div className="flex justify-between items-center border-t border-white/5 pt-2">
                  {/* Buscamos o último autor do log para exibir aqui */}
                  <span className="text-[12px] text-green-500 tracking-tighter">
                    Resolvido por: {atividade.registros?.[atividade.registros.length - 1]?.autor?.nome}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {formatarData(atividade.ultima_atualizacao)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rodapé: Datas */}
          <div className="grid grid-cols-3 gap-6 border-t border-white/5 pt-6 mb-5">
            {/* Data de Início */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 tracking-wider">
                <Calendar size={12} className="text-blue-500/50" /> Início
              </label>
              <p className="font-mono text-sm text-gray-300">
                {formatarData(atividade.hora_registro)}
              </p>
            </div>

            {/* Prazo Inicial (O Marco Zero) */}
            <div className="space-y-1.5 border-l border-white/5 pl-6">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 tracking-wider">
                <Calendar size={12} className="text-gray-600" /> Prazo Inicial
              </label>
              <p className="font-mono text-sm text-gray-500">
                {/* Fallback para atividades criadas antes da atualização do sistema */}
                {formatarData(atividade.hora_entrega_inicial || atividade.hora_entrega)}
              </p>
            </div>

            {/* Prazo Atualizado (Informação Crítica) */}
            <div className="space-y-1.5 border-l border-white/5 pl-6 text-right">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 justify-end tracking-wider">
                <Clock size={12} className={atividade.hora_entrega !== atividade.hora_entrega_inicial ? "text-amber-500/70" : "text-gray-600"} /> 
                Prazo Atual
              </label>
              
              <div className="flex flex-col items-end">
                <p className={`font-mono text-sm font-bold ${
                  new Date() > new Date(atividade.hora_entrega) && atividade.status !== 'resolvido' 
                    ? 'text-red-400' 
                    : 'text-blue-400'
                }`}>
                  {formatarData(atividade.hora_entrega)}
                </p>
                
                {/* Badge discreto se houve mudança de prazo */}
                {atividade.hora_entrega_inicial && atividade.hora_entrega !== atividade.hora_entrega_inicial && (
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded mt-1 font-black uppercase tracking-tighter">
                    Prorrogado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}