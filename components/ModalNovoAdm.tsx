"use client"
import { useState, useEffect } from "react"
import { X, UserSearch, ShieldCheck, UserPlus, Loader2, Check } from "lucide-react"

export default function ModalNovoAdm({ fechar }: { fechar: () => void }) {
  const [pesquisa, setPesquisa] = useState("")
  const [perfil, setPerfil] = useState("ADM")
  const [resultados, setResultados] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null)

  // Lógica de Busca com Debounce
  useEffect(() => {
    const buscarUsuarios = async () => {
      if (pesquisa.length < 3) {
        setResultados([]);
        return;
      }

      setLoading(true);
      try {
        const creds = JSON.parse(localStorage.getItem("task_user_creds") || "{}");
        
        const response = await fetch("http://204.216.132.232:3000/findUsersByName", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: "lanlink",
            userFind: pesquisa,
            userLogin: creds.userLogin,
            password: creds.password
          })
        });

        const data = await response.json();
        setResultados(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro na busca:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(buscarUsuarios, 500); // Aguarda 500ms após parar de digitar
    return () => clearTimeout(timeoutId);
  }, [pesquisa]);

 async function finalizarCadastro() {
  if (!usuarioSelecionado) return;

    try {
        const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome: usuarioSelecionado.Name,
            matricula: usuarioSelecionado.SamAccountName,
            perfil: perfil
        })
        });

        // Se a resposta for 204 (No Content) ou estiver vazia, não tenta dar .json()
        const contentType = response.headers.get("content-type");
        let data = {};
        
        if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        }

        if (response.ok) {
        alert(`${usuarioSelecionado.Name} agora é um ${perfil}!`);
        fechar();
        } else {
        alert(`Erro: ${data|| 'Falha desconhecida'}`);
        }
    } catch (error) {
        console.error("Erro ao cadastrar adm:", error);
    }
    }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
      <div className="bg-[#161B26] border border-white/10 rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* HEADER */}
        <div className="bg-white/5 px-8 py-4 flex justify-between items-center border-b border-white/5">
          <h2 className="text-gray-200 text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <UserPlus size={16} className="text-yellow-500" /> Cadastrar Administrador
          </h2>
          <button onClick={fechar} className="bg-white/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          
          {/* CAMPO DE PESQUISA DE USUÁRIO */}
          <div className="space-y-2">
            <div className="space-y-2 relative">
            <label className="text-[11px] font-black text-gray-500 uppercase flex items-center gap-2">
              <UserSearch size={12} /> Pesquisar na Lanlink
            </label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Digite o nome (min. 3 letras)..."
                className="w-full bg-white/5 border border-white/10 p-3.5 pl-10 rounded-lg text-gray-200 focus:border-yellow-500/50 outline-none"
                value={pesquisa}
                onChange={(e) => {
                setPesquisa(e.target.value);
                        setUsuarioSelecionado(null); // Limpa seleção ao digitar novo
                    }}
                />
                {loading ? (
                    <Loader2 className="absolute left-3 top-4 animate-spin text-yellow-500" size={16} />
                ) : (
                    <UserSearch className="absolute left-3 top-4 text-gray-600" size={16} />
                )}
                </div>

                {/* LISTA DE RESULTADOS (DROPDOWN) */}
                {resultados.length > 0 && !usuarioSelecionado && (
                <div className="absolute z-10 w-full mt-1 bg-[#1c222d] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                    {resultados.map((u, i) => (
                    <div 
                        key={i}
                        onClick={() => {
                            setUsuarioSelecionado(u);
                            setPesquisa(u.Name);
                            setResultados([]);
                        }}
                        className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-none"
                    >
                        <p className="text-xs font-bold text-gray-200">{u.Name}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{u.SamAccountName} • {u.Office?.split('--')[0]}</p>
                    </div>
                    ))}
                </div>
                )}
            </div>
          </div>

          {/* SELEÇÃO DE PERFIL */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 uppercase ml-1 flex items-center gap-2">
              <ShieldCheck size={12} /> Nível de Acesso
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setPerfil("ADM")}
                className={`py-3 rounded-lg text-[10px] font-black uppercase transition-all border ${perfil === "ADM" ? "bg-yellow-600/20 border-yellow-500 text-yellow-500" : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"}`}
              >
                Administrador
              </button>
              <button 
                onClick={() => setPerfil("JEDI")}
                className={`py-3 rounded-lg text-[10px] font-black uppercase transition-all border ${perfil === "JEDI" ? "bg-blue-600/20 border-blue-500 text-blue-500" : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10"}`}
              >
                Mestre Jedi
              </button>
            </div>
          </div>

          <p className="text-[10px] text-gray-600 italic text-center">
            * O perfil selecionado terá permissões de criação e exclusão de atividades.
          </p>
        </div>

        {/* RODAPÉ / AÇÃO */}
        <div className="p-8 pt-0 flex justify-end">
          <button 
            onClick={finalizarCadastro}
            disabled={!usuarioSelecionado}
            className={`w-full py-3 rounded-lg font-black uppercase text-[12px] transition-all active:scale-95 shadow-lg ${
                !usuarioSelecionado 
                ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                : "bg-yellow-600 hover:bg-yellow-500 text-white shadow-yellow-900/20"
            }`}
            >
            Finalizar Cadastro
            </button>
        </div>
      </div>
    </div>
  )
}