"use client"
import React from "react";

const DIAS_SEMANA = [
  { id: 0, label: "D" }, { id: 1, label: "S" }, { id: 2, label: "T" },
  { id: 3, label: "Q" }, { id: 4, label: "Q" }, { id: 5, label: "S" }, { id: 6, label: "S" }
];

export default function RecorrenciaSelector({ selecionados, onChange }: any) {
  const toggleDia = (id: number) => {
    const novos = selecionados.includes(id) 
      ? selecionados.filter((d: number) => d !== id)
      : [...selecionados, id];
    onChange(novos);
  };

  return (
    <div className="flex gap-2 mt-2">
      {DIAS_SEMANA.map((dia) => (
        <button
          key={dia.id}
          type="button"
          onClick={() => toggleDia(dia.id)}
          className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all border ${
            selecionados.includes(dia.id)
              ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]"
              : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
          }`}
        >
          {dia.label}
        </button>
      ))}
    </div>
  );
}