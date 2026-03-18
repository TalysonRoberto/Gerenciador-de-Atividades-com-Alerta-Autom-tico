"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2 } from "lucide-react";
import bglogin from '../../img/bg-login.png'
import Image from 'next/image';
import taskLogo from '../../img/icon.png';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const resp = await fetch("http://204.216.132.232:3000/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          login: form.login.trim(), 
          password: form.password.trim(), 
          client: "lanlink" 
        })
      });

      const data = await resp.json();

      if (!resp.ok || data.error) {
        setErro(data.message || "Credenciais inválidas");
      } else {
        localStorage.setItem("task_user", JSON.stringify({
          nome: data.name || data.user,
          matricula: data.matricula || data.id,
          login: data.user
        }));

        localStorage.setItem("task_user_creds", JSON.stringify({
          userLogin: form.login.trim(), 
          password: form.password.trim()
        }));
        
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setErro("Erro de conexão. Verifique se a API está online.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] p-4">
      {/* Container Principal do Card */}
      <div className="w-full max-w-[700px] h-[500px] flex overflow-hidden rounded-xl bg-white shadow-2xl">
        
        {/* Lado Esquerdo: Imagem e Texto de Boas-vindas */}
        <div className="hidden md:flex md:w-1/2 relative bg-[#011627] flex-col justify-between">
          <Image 
            src={bglogin} 
            alt="Task Login Background" 
            fill
            className="object-cover opacity-80"
            priority 
          />
          {/* Overlay de texto sobre a imagem */}
          <div className="relative z-10 p-12 h-full flex flex-col justify-between">
            <h1 className="text-white font-bold text-xl tracking-widest uppercase">Task</h1>
            
            <div>
              <h2 className="text-white text-3xl font-bold mb-6">Bem vindo!</h2>
              <p className="text-gray-300 text-[11px] leading-relaxed max-w-[320px]">
                Este é o seu centro de controle de atividades. O Task foi projetado para oferecer uma visão clara, técnica e consolidada de cada pendência, permitindo que você gerencie o ciclo de vida das suas tarefas com precisão e agilidade.
              </p>
            </div>

            <p className="text-gray-400 text-[10px] ">
              @ Lanlink {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Lado Direito: Formulário de Login */}
        <div className="w-full md:w-1/2 bg-white flex flex-col p-12">
          <div className="mb-10 gap-2 flex justify-between">
            <div>
              <h3 className="text-[#011627] text-3xl font-bold mb-2">Login</h3>
              <p className="text-gray-400 text-xs font-medium leading-relaxed">
                Use suas credenciais de acesso para logar no sistema.
              </p>
            </div>
            <div className="w-20 h-20 mt-3">
                <Image 
                  src={taskLogo} 
                  alt="Task Logo" 
                  className="object-contain"
                  priority 
                />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {erro && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-[11px] font-bold uppercase text-center">
                {erro}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-gray-600 text-[11px] font-bold uppercase tracking-wider">Usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Digite seu usuário"
                  autoComplete="username"
                  className="w-full border-2 border-gray-100 p-3 pl-10 rounded-lg text-sm text-black outline-none focus:border-[#013444] transition-all placeholder:text-gray-300"
                  onChange={e => setForm({...form, login: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-600 text-[11px] font-bold uppercase tracking-wider">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input 
                  type="password"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  className="w-full border-2 border-gray-100 p-3 pl-10 rounded-lg text-sm text-black outline-none focus:border-[#013444] transition-all placeholder:text-gray-300"
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-[#0d3b4b] hover:bg-[#082a36] text-white font-bold py-4 rounded-lg text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Entrar"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}