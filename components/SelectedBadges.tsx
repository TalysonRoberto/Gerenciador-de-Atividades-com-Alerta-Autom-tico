"use client"
import React from "react";

const CORES_BADGES: Record<string, string> = {
  andamento: "bg-blue-50 text-blue-600 border-blue-200",
  resolvido: "bg-green-50 text-green-600 border-green-200",
  renovado: "bg-amber-50 text-amber-600 border-amber-200",
  estourado: "bg-red-50 text-red-600 border-red-200",
  excluido: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function SelectedBadges({ filtrosAtivos, alternarFiltro }: any) {
  if (filtrosAtivos.length === 0) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border shadow-sm bg-gray-50 text-gray-600 border-gray-200 bg-gray-100">
        Visualizando Tudo
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filtrosAtivos.map((f: string) => (
        <div key={f} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border shadow-sm ${CORES_BADGES[f] || "bg-gray-100"}`}>
          <span className="uppercase">{f}</span>
          <button onClick={() => alternarFiltro(f)} className="hover:text-black ml-1">✕</button>
        </div>
      ))}
    </div>
  );
}