"use client"
import React, { useState, useEffect } from "react";
import { Trash2 } from 'lucide-react'; 

interface AtividadeItemProps {
  atividade: any;
  onResolver: (ativ: any) => void;
  onRenovar: (ativ: any) => void;
  onExcluir: (ativ: any) => void;
  onVerDetalhes: (ativ: any) => void;
  auth: any;
}

const DIAS_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function AtividadeItem({ atividade, onResolver, onRenovar, onExcluir, onVerDetalhes,auth }: AtividadeItemProps) {
  // O relógio aqui serve APENAS para atualizar a barra de progresso visualmente a cada minuto
  const [agoraRelogio, setAgoraRelogio] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setAgoraRelogio(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fonte da verdade: O status que vem do backend/JSON
  const statusAtual = atividade.status;

  const progresso = (() => {
    if (statusAtual === 'resolvido') return 100;
    if (statusAtual === 'excluido') return 0;

    const inicio = new Date(atividade.hora_registro).getTime();
    const fim = new Date(atividade.hora_entrega).getTime();
    const agora = agoraRelogio.getTime();
    
    if (agora >= fim) return 100;
    const total = fim - inicio;
    const decorrido = agora - inicio;
    return Math.min(Math.max((decorrido / total) * 100, 0), 100);
  })();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'estourado': return { label: 'ESTOURADO', color: 'text-red-400 border-red-500/30 bg-red-500/10' };
      case 'andamento': return { label: 'EM ANDAMENTO', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' };
      case 'resolvido': return { label: 'RESOLVIDO', color: 'text-green-400 border-green-500/30 bg-green-500/10' };
      case 'renovado': return { label: 'RENOVADO', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
      case 'excluido': return { label: 'EXCLUÍDO', color: 'text-gray-400 border-white/10 bg-white/5' };
      default: return { label: status?.toUpperCase(), color: 'text-gray-400 border-white/10 bg-white/5' };
    }
  };

  const formatarDataBR = (data: string) => {
    if (!data) return "---";
    return new Date(data).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
  };

  const style = getStatusStyle(statusAtual);
  const isAtivo = statusAtual === 'andamento' || statusAtual === 'renovado' || statusAtual === 'estourado';

  return (
    <div 
      onClick={() => onVerDetalhes && onVerDetalhes(atividade)}
      className="grid grid-cols-[1fr_150px_140px_180px_230px] items-center gap-4 px-8 bg-transparent border-b border-white/5 min-h-[70px] cursor-pointer hover:bg-white/[0.02] transition-colors group"
    >
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-blue-500/70">{atividade.referencia}</span>
          <h4 className="text-[13px] font-black text-gray-200 uppercase truncate group-hover:text-blue-400">
            {atividade.nome}
          </h4>
        </div>
        <p className="text-[11px] text-gray-500 italic truncate">{atividade.descricao}</p>
      </div>

      <div className="flex justify-center">
        <span className={`w-[130px] py-1.5 text-center rounded text-[10px] font-black border ${style.color}`}>
          {style.label}
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-[11px] font-mono font-bold text-gray-400">
          {formatarDataBR(atividade.hora_registro)}
        </p>
        
        {atividade.recorrente && (
          <div className="flex gap-1">
            {DIAS_LABELS.map((label, idx) => {
              const checkAtivo = atividade.dias_semana?.includes(idx);
              return (
                <div 
                  key={idx}
                  className={`w-4 h-4 rounded-[4px] flex items-center justify-center text-[8px] font-black border transition-all ${
                    checkAtivo 
                      ? "bg-green-500 border-green-400 text-[#0B0F1A] shadow-[0_0_5px_rgba(34,197,94,0.5)]" 
                      : "bg-white/5 border-white/10 text-gray-600"
                  }`}
                >
                  {label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 px-2 text-center">
        <p className={`text-[11px] font-mono font-bold ${statusAtual === 'estourado' ? 'text-red-400' : 'text-gray-300'}`}>
          {formatarDataBR(atividade.hora_entrega)}
        </p>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full transition-all duration-500 ${
                statusAtual === 'estourado' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                statusAtual === 'resolvido' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
              }`} 
              style={{ width: `${progresso}%` }} 
            />
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
        {isAtivo ? (
          <>
            <button onClick={() => onResolver(atividade)} className="w-[95px] py-2 bg-green-600/20 text-green-400 border border-green-500/30 text-[10px] font-black uppercase rounded hover:bg-green-600 hover:text-white transition-all">Resolver</button>
            <button onClick={() => onRenovar(atividade)} className="w-[95px] py-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase rounded hover:bg-amber-600 hover:text-white transition-all">Renovar</button>
          </>
        ) : <div className="w-[198px]"></div>}

        {/*Verifica se o status é diferente de excluido e se o auth esta com permissão*/}
        {atividade.status !== 'excluido' && auth.isAuthorized && auth.perfil === "JEDI" && (
          <button onClick={() => onExcluir(atividade)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full ml-2 transition-all">
            <Trash2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
}