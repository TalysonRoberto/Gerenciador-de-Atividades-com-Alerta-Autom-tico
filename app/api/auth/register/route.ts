import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dirPath = path.join(process.cwd(), 'data');
const filePath = path.join(dirPath, 'usuarios.json');

// --- FUNÇÃO PARA GARANTIR QUE O ARQUIVO EXISTE ---
function inicializarBanco() {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8').trim() === "") {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
}

// --- MÉTODO GET: Usado pela Home para validar permissões ---
export async function GET() {
  try {
    inicializarBanco();
    const fileData = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(fileData));
  } catch (error) {
    return NextResponse.json({ message: "Erro ao ler usuários" }, { status: 500 });
  }
}

// --- MÉTODO POST: Usado pelo Modal para cadastrar novos ---
export async function POST(request: Request) {
  try {
    inicializarBanco();
    const body = await request.json();
    const { nome, perfil } = body;

    const fileData = fs.readFileSync(filePath, 'utf8');
    const usuarios = JSON.parse(fileData);

    if (usuarios.find((u: any) => u.nome === nome)) {
      return NextResponse.json({ message: "Usuário já cadastrado" }, { status: 400 });
    }

    usuarios.push({ nome, perfil });
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2));

    return NextResponse.json({ message: "Sucesso" });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao salvar" }, { status: 500 });
  }
}