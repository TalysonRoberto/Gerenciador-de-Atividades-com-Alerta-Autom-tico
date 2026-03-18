"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftFromLine, Loader2, FileDown } from "lucide-react";
import EvolucaoChart from "@/components/EvolucaoChart";
import { gerarRelatorioPDF } from "./pdf"; // Importa a lógica separada
import { checkIsAuthorized } from "@/lib/auth"; // Importe a função

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false); // Estado local de auth

  async function fetchStats() {
    try {
      // O parâmetro 't' evita cache do navegador
      const res = await fetch(`/api/stats?t=${Date.now()}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas");
    } finally {
      setLoading(false);
    }
  }

 useEffect(() => {
  const inicializarDashboard = async () => {
    setLoading(true); // Garante que começa carregando
    
    const savedUser = localStorage.getItem("task_user");
    
      try {
        // Executa as duas buscas em paralelo para ganhar tempo
        const [statsRes, authRes] = await Promise.all([
          fetch(`/api/stats?t=${Date.now()}`),
          fetch('/api/auth/register')
        ]);

        const statsData = await statsRes.json();
        const listaAdms = await authRes.json();

        setStats(statsData);

        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          // Validamos se o usuário está na lista vinda do servidor
          const authStatus = checkIsAuthorized(parsed.nome, listaAdms);
          setIsAuth(authStatus.isAuthorized);
        }
      } catch (err) {
        console.error("Erro ao inicializar dashboard:", err);
      } finally {
        setLoading(false); // Só libera a tela após validar TUDO
      }
    };

    inicializarDashboard();

    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <main className="flex-1 px-8 py-4 overflow-y-auto h-full bg-[#0B0F1A] custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between">
          <Link href="/" className="text-blue-500 text-xs font-black uppercase flex items-center gap-2 hover:underline">
            <ArrowLeftFromLine className="h-3 w-3" /> Voltar para as Atividades
          </Link>
          {/* BOTÃO DE DOWNLOAD */}
          {(!loading && isAuth) && (
            <button 
              onClick={() => gerarRelatorioPDF(stats)} // Chama a função passando os dados
              className="flex items-center gap-2 bg-green-600/50 hover:bg-green-700 text-white text-[10px] font-black uppercase px-4 py-2.5 rounded-lg transition-all shadow-lg"
            >
              <FileDown size={16} />
              Baixar Relatório PDF
          </button>)}
          
        </header>

        {/* Grid Adaptável: 1 col (base), 2 col (sm), 4 col (lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          
          {/* Total */}
          <div className="bg-[#161B26] border border-white/30 p-6 rounded-lg">
            <p className="text-gray-500 text-[12px] font-normal uppercase">Total de Atividades</p>
            <p className="text-3xl font-mono mt-2 text-gray-400">{stats?.total}</p>
          </div>

          {/* Em Andamento */}
          <div className="bg-blue-400/10 border border-blue-400 p-6 rounded-lg">
            <p className="text-blue-500 text-[12px] font-normal uppercase">Em Andamento</p>
            <p className="text-3xl font-mono mt-2 text-blue-400">{stats?.emAndamento}</p>
          </div>

          {/* Renovadas */}
          <div className="bg-yellow-400/10 border border-yellow-400 p-6 rounded-lg">
            <p className="text-yellow-500 text-[12px] font-normal uppercase">Atividades Renovadas</p>
            <p className="text-3xl font-mono mt-2 text-yellow-400">{stats?.renovadas}</p>
          </div>
          
          {/* Produtividade */}
          <div className="bg-gray-400/10 border border-gray-100 p-6 rounded-lg">
            <p className="text-gray-100 text-[12px] font-normal uppercase">Produtividade (SLA)</p>
            <p className="text-3xl font-mono mt-2 text-gray-100">{stats?.produtividade}</p>
          </div>

          {/* Resolvidas no Tempo */}
          <div className="bg-green-400/10 border border-green-400 p-6 rounded-lg">
            <p className="text-green-500 text-[12px] font-normal uppercase">Resolvidas no Tempo</p>
            <p className="text-3xl font-mono mt-2 text-green-400">{stats?.resolvidosNoTempo}</p>
          </div>

          {/* Resolvidas Estouradas */}
          <div className="bg-orange-400/10 border border-orange-500 p-6 rounded-lg">
            <p className="text-orange-500 text-[12px] font-normal uppercase">Resolvidas Estouradas</p>
            <p className="text-3xl font-mono mt-2 text-orange-400">{stats?.resolvidosEstourados}</p>
          </div>

          {/* Estouradas (Sem solução) */}
          <div className="bg-red-400/10 border border-red-400 p-6 rounded-lg">
            <p className="text-red-500 text-[12px] font-normal uppercase">Atividades Estouradas</p>
            <p className="text-3xl font-mono mt-2 text-red-400">{stats?.estouradasSemSolucao}</p>
          </div>

          {/* Encerrados */}
          <div className="bg-slate-400/10 border border-slate-400 p-6 rounded-lg">
            <p className="text-slate-500 text-[12px] font-normal uppercase">Atividades Excluidas</p>
            <p className="text-3xl font-mono mt-2 text-slate-400">{stats?.excluidas}</p>
          </div>

        </div>

        <h1 className="mt-8 mb-2 text-gray-500 font-black uppercase text-xs tracking-widest">
          Top Técnicos (Resolvidos):
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
          {stats?.tecnicos?.length > 0 ? (
            stats.tecnicos.map((tecnico: any, index: number) => (
              <div 
                key={index} 
                className="bg-purple-400/5 border border-white/10 p-4 rounded-lg flex justify-between items-center group hover:border-blue-500/50 transition-colors"
              >
                <p className="text-purple-300 text-[11px] font-bold uppercase truncate pr-2">
                  {tecnico.nome.split(" ")[0]} {tecnico.nome.split(" ").slice(-1)[0]}
                </p>
                <span className="text-blue-500 font-mono font-black text-sm group-hover:scale-110 transition-transform">
                  {tecnico.total}
                </span>
              </div>
            ))
          ) : (
            <p className="text-purple-600 text-xs italic">Nenhum chamado resolvido ainda.</p>
          )}
        </div>

        {/* Área para Gráficos */}
        <div className="mt-8">
          <h1 className="mb-4 text-gray-500 font-black uppercase text-xs tracking-widest">Fluxo de Atividades (7 Dias)</h1>
          <div className="bg-[#161B26] border border-white/5 h-64 rounded-lg overflow-hidden">
            {stats?.evolucao ? (
              <EvolucaoChart data={stats.evolucao} />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-700 text-[10px] uppercase font-bold">
                Processando dados...
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Sub-componente para limpar o código do grid
function Card({ title, value, color, bg = "bg-[#161B26]", border }: any) {
  return (
    <div className={`${bg} ${border} border p-6 rounded-lg transition-all duration-500`}>
      <p className="text-gray-500 text-[12px] font-normal uppercase">{title}</p>
      <p className={`text-3xl font-mono mt-2 ${color}`}>{value || 0}</p>
    </div>
  );
}