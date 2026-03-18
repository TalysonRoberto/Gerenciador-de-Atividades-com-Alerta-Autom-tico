import Image from 'next/image';
import taskLogo from '../img/icon.png';
import { LogOut,User } from "lucide-react";

export default function Header({ user }: { user: any }) {
  return (
    <header className="h-14 bg-gradient-to-r from-[#000] to-[#054048] border-b border-blue-900/30 flex items-center px-8 shrink-0 shadow-sm justify-between">
      {/* Lado Esquerdo: Logo e Título */}
      <div className="flex items-center gap-4">
         <h1 className="text-3xl font-bold tracking-tight text-gray-200 uppercase">
          Task
        </h1>
        <div className="w-8 h-8 relative">
          <Image 
            src={taskLogo} 
            alt="Task Logo" 
            className="object-contain"
            priority 
          />
        </div>
      </div>
      
      {/* Lado Direito: User e Exit */}
      <div className="flex items-center">
        <div className="flex border-r pr-4 border-gray-100/20">
            <div className="text-right border-white/10 pr-4">
              <h2 className="text-[13px] font-bold text-gray-200 uppercase">
                {user?.nome}
              </h2>
              <p className="text-[11px] text-blue-400 font-mono">
                MAT: {user?.login}
              </p>
            </div>
            <User className="h-8 w-8 text-blue-500" />
        </div>
        <a 
          href="/login" 
          className="text-ls font-normal text-gray-400 px-4  hover:text-red-400 transition-colors flex items-center gap-2"
        >
          Sair <span className="text-lg"><LogOut className="h-5 w-5" /></span>
        </a>
      </div>
    </header>
  );
}