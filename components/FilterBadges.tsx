"use client"
import React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";

const DICIONARIO_FILAS: Record<string, { label: string, color: string, dot: string }> = {
  andamento: { label: "Em andamento", color: "text-blue-600", dot: "bg-blue-500" },
  renovado: { label: "Renovados", color: "text-amber-600", dot: "bg-amber-500" },
  estourado: { label: "Estourados", color: "text-red-600", dot: "bg-red-600" },
  resolvido: { label: "Resolvidos", color: "text-green-600", dot: "bg-green-500" },
  excluido: { label: "Excluídos", color: "text-gray-600", dot: "bg-gray-400" },
};

export default function FilterBadges({ 
  filtrosAtivos = [], 
  alternarFiltro, 
  limpar, 
  atividades = [] // <-- Valor padrão garantido
}: any) {
  
  // Função para gerar o CSV
  const exportarCSV = () => {
    // Trava de segurança extra
    if (!atividades || atividades.length === 0) {
      return alert("Não há dados para exportar!");
    }

    const cabecalho = "Nome;Descricao;Status;Inicio;Prazo;Recorrente\n";
    const linhas = atividades.map((a: any) => 
      `${a.nome};${a.descricao || ""};${a.status};${a.hora_registro};${a.hora_entrega};${a.recorrente ? 'Sim' : 'Não'}`
    ).join("\n");
    
    const blob = new Blob(["\ufeff" + cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_atividades_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para abrir o diálogo de PDF
//   const exportarPDF = () => {
//     window.print();
//   };

  return (
    <aside className="w-70 p-6 sticky top-0 self-start">
      <div className="bg-[#161B26] rounded-lg shadow-2xl border border-white/5 p-6 space-y-5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-gray-300 uppercase tracking-tight">Filtros</h3>
          <button onClick={limpar} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase">Limpar</button>
        </div>

        <div className="flex flex-col gap-4">
          {Object.entries(DICIONARIO_FILAS).map(([id, info]) => (
            <label key={id} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox"
                checked={filtrosAtivos.includes(id)}
                onChange={() => alternarFiltro(id)}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className={`text-[13px] transition-colors ${filtrosAtivos.includes(id) ? 'font-black text-gray-100' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {info.label}
              </span>
              <div className={`w-2 h-2 rounded-full ml-auto ${info.dot} shadow-[0_0_5px_currentColor]`} />
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}