"use client"
import { useEffect } from "react"

export default function MonitorGlobal() {
  useEffect(() => {
    const rotina = async () => {
      try {
        // Chama a API de atividades para processar estouros e recorrências
        await fetch("/api/atividades");
      } catch (e) {
        console.error("Monitor Global: Erro na verificação.");
      }
    };

    // Verifica a cada 30 segundos
    const interval = setInterval(rotina, 30000);
    return () => clearInterval(interval);
  }, []);

  return null;
}