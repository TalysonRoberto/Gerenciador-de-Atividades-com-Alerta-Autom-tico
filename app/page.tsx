"use client"
import { useEffect, useState } from "react"
import FilterBadges from "@/components/FilterBadges"
import SelectedBadges from "@/components/SelectedBadges" // O componente de badges no topo
import AtividadeItem from "@/components/AtividadeItem"
import ModalNovoAdm  from "@/components/ModalNovoAdm"
import ModalCriarAtividade from "@/components/ModalCriarAtividade"
import ModalAcao from "@/components/ModalAcao"
import ModalDetalhes from "@/components/ModalDetalhes"
import { LayoutDashboard } from "lucide-react";
import { FileUser } from "lucide-react";
import Link from "next/link";
import { checkIsAuthorized, AuthResult } from "@/lib/auth"; // Importe o TIPO também

export default function Home() {
  const [atividades, setAtividades] = useState<any[]>([])
  const [filtrosAtivos, setFiltrosAtivos] = useState<string[]>(["andamento", "estourado","renovado"])
  const [modalNovoAdm, setModalNovoAdm] = useState(false);
  const [modalCriar, setModalCriar] = useState(false)
  const [detalheAtividade, setDetalheAtividade] = useState<any>(null)
  const [modalAcao, setModalAcao] = useState<{aberto: boolean, tipo: any, atividade: any}>({
    aberto: false, tipo: 'resolver', atividade: null
  })
  const [user, setUser] = useState<{ matricula: string; nome: string } | null>(null);
  const [auth, setAuth] = useState<AuthResult>({ isAuthorized: false, perfil: null });
  

  const verificarPermissoes = async (nomeUsuario: string) => {
    try {
      const res = await fetch('/api/auth/register'); 
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const lista = await res.json();
      
      // Verifique se a lista é realmente um array
      if (Array.isArray(lista)) {
        const status = checkIsAuthorized(nomeUsuario, lista);
        setAuth(status);
      }
    } catch (error) {
    console.error("Erro ao validar permissões:", error); // Adicione o 'error' aqui
  }
  };

  // Carrega as atividades 
  async function carregarAtividades() {
    const res = await fetch("/api/atividades")
    const data = await res.json()
    setAtividades(data)
  }

  // Carregameio inicial (Usuário e atividade)
  useEffect(() => {
    const savedUser = localStorage.getItem("task_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      verificarPermissoes(parsed.nome); // Busca a permissão atualizada do JSON
    }
    carregarAtividades();
  }, []);

  // Rotina de verificação
  useEffect(() => {
    const rotinaDeVerificacao = async () => {
      try {
        // 1. O GET chama o monitor no backend
        const res = await fetch('/api/atividades'); 
        const data = await res.json();
        
        // 2. ATUALIZAÇÃO CRÍTICA: 
        // Seta o estado com os dados que o monitor acabou de processar.
        // Se o monitor mudou para 'estourado' no JSON, seu painel ficará vermelho agora.
        setAtividades(data); 

      } catch (e) {
        console.error("Falha na rotina de monitoramento");
      }
    };

    // Roda ao carregar
    rotinaDeVerificacao();

    // Roda a cada 10 segundos para precisão
    const interval = setInterval(rotinaDeVerificacao, 10000); 
    
    return () => clearInterval(interval);
  }, []);

  const alternarFiltro = (id: string) => {
    setFiltrosAtivos(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }

  // --- LÓGICA CORRIGIDA DE FILTRAGEM ---
  const atividadesFiltradas = atividades.filter(a => {
    // Agora confiamos apenas no status que veio do servidor
  return filtrosAtivos.length === 0 || filtrosAtivos.includes(a.status);
  });
  return (
  <div className="flex flex-col h-screen bg-[#0B0F1A] text-gray-100 overflow-hidden">
    
    <div className="flex flex-1 overflow-hidden items-start">
      <div>
        <FilterBadges 
          filtrosAtivos={filtrosAtivos} 
          alternarFiltro={alternarFiltro} 
          limpar={() => setFiltrosAtivos([])} 
          atividades={atividades}
        />
         {/* BOTÕES DE RELATÓRIO FORA DA CAIXA */}
          <div className="px-5 mb-6">
            <Link href="/dashboard">
              <div className="flex justify-between items-center bg-[#161B26] rounded-lg shadow-2xl border border-white/5 p-6 hover:bg-green-800/30 transition-all cursor-pointer group">
                <span className="text-gray-200 font-bold uppercase text-xs tracking-widest">
                  Dashboard
                </span>
                <LayoutDashboard className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
            </Link>
          </div>
          {/* BOTÃO NOVO ADM*/}
          {auth.isAuthorized && auth.perfil === "JEDI" && (
            <div className="px-5 mb-6" onClick={() => setModalNovoAdm(true)}>
              <div className="flex justify-between items-center bg-[#161B26] rounded-lg shadow-2xl border border-white/5 p-6 hover:bg-yellow-800/30 transition-all cursor-pointer group">
                <span className="text-gray-200 font-bold uppercase text-xs tracking-widest">
                  Cadastrar Adm             
                </span>
                <FileUser className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          )}

              
    </div>
    
      {/* O main agora NÃO deve ter overflow-y-auto para não rolar tudo */}
      <main className="flex-1 pr-8 py-5 flex flex-col h-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
          
          {/* CABEÇALHO FIXO: Badges e Botão */}
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <SelectedBadges filtrosAtivos={filtrosAtivos} alternarFiltro={alternarFiltro} />
            
            {auth.isAuthorized && (<button 
              onClick={() => setModalCriar(true)}
              className="bg-blue-600/20 border border-blue-500 text-white px-5 py-2.5 rounded-lg text-[12px] font-black uppercase hover:bg-blue-700/50 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              Adicionar Atividade +
            </button>)}
          </div>

          {/* CONTAINER DA TABELA: Este é o único que rola */}
          <div className="bg-[#161B26] rounded-lg shadow-2xl border border-white/5 flex flex-col overflow-hidden flex-1 mb-10">
            
            {/* Cabeçalho da Tabela (Fixo no topo da tabela) */}
            <div className="grid grid-cols-[1fr_150px_140px_180px_230px] gap-4 p-5 px-8 bg-white/5 border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest flex-shrink-0">
              <div>Tarefa</div>
              <div className="text-center">Status</div>
              <div className="text-center">Início</div>
              <div className="text-center">Prazo / Progresso</div>
              <div className="text-right pr-4">Ações</div>
            </div>

            {/* LISTA DE ITENS: A rolagem acontece aqui */}
            <div className="divide-y divide-white/5 overflow-y-auto flex-1 custom-scrollbar">
              {atividadesFiltradas.length > 0 ? (
                atividadesFiltradas.map((a) => (
                  <AtividadeItem 
                    key={a.id} 
                    atividade={a} 
                    auth={auth}
                    onVerDetalhes={(ativ) => setDetalheAtividade(ativ)}
                    onResolver={(ativ) => setModalAcao({ aberto: true, tipo: 'resolver', atividade: ativ })}
                    onRenovar={(ativ) => setModalAcao({ aberto: true, tipo: 'renovar', atividade: ativ })}
                    onExcluir={(ativ) => setModalAcao({ aberto: true, tipo: 'excluir', atividade: ativ })}
                  />
                ))
              ) : (
                <div className="p-20 text-center text-gray-600 text-xs uppercase font-bold tracking-widest">
                  Nenhuma atividade encontrada
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>

      {detalheAtividade && (
        <ModalDetalhes atividade={detalheAtividade} fechar={() => setDetalheAtividade(null)} />
      )}

      {modalCriar && <ModalCriarAtividade fechar={() => setModalCriar(false)} atualizar={carregarAtividades} user={user}/>}
      
      {modalNovoAdm && <ModalNovoAdm fechar={() => setModalNovoAdm(false)} />}

      {modalAcao.aberto && (
        <ModalAcao 
          atividade={modalAcao.atividade} 
          tipo={modalAcao.tipo} 
          fechar={() => setModalAcao({ ...modalAcao, aberto: false })} 
          atualizar={carregarAtividades} 
          user={user}
        />
      )}
    </div>
  )
}