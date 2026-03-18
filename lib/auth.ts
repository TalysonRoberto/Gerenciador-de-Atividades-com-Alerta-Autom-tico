// lib/auth.ts

export type AuthResult = {
  isAuthorized: boolean;
  perfil: "ADM" | "JEDI" | null;
};

// Esta função agora serve apenas como um fallback ou validador inicial
export function checkIsAuthorized(userName: string | undefined, lista: any[]) {
  if (!userName || !Array.isArray(lista)) return { isAuthorized: false, perfil: null };
  
  const user = lista.find(u => u.nome.toLowerCase() === userName.toLowerCase());
  
  return {
    isAuthorized: !!user,
    perfil: user ? user.perfil : null
  };
}