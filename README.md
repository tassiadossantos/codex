# CODEX — Corporate Website

Plataforma corporativa de alta performance desenvolvida por **Tassia dos Santos**.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=flat-square&logo=supabase)

---

## Visão Geral

O CodeX é um site institucional construído com foco em performance, design premium e experiência do usuário. A plataforma integra formulário de captação de leads com backend serverless via Supabase.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Estilo** | Tailwind CSS 4, Radix UI |
| **Animações** | Framer Motion |
| **Ícones** | Lucide React |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **CI/CD** | GitHub Actions |
| **Build** | pnpm, Turborepo |

## Funcionalidades

- Layout responsivo com design sistema proprietário
- Formulário de captação de leads com validação
- Integração em tempo real com Supabase PostgreSQL
- Animações de scroll e transições suaves
- Terminal boot interativo com efeito de máquina de escrever
- Carrossel de tecnologias com efeito marquee
- Paleta de cores customizada com suporte a dark mode

## Estrutura do Projeto

```
codex/
├── src/
│   ├── app/
│   │   ├── App.tsx              # Componente principal
│   │   └── components/
│   │       ├── figma/           # Componentes Figma
│   │       └── ui/              # Componentes UI (shadcn)
│   ├── lib/
│   │   ├── supabase.ts          # Cliente Supabase
│   │   └── types.ts             # Tipos TypeScript
│   ├── styles/                  # Estilos globais
│   └── main.tsx                 # Entry point
├── .env.local                   # Variáveis de ambiente (não commitar)
├── vite.config.ts               # Configuração Vite
├── tailwind.config.ts           # Configuração Tailwind
└── package.json
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18.0.0
- [pnpm](https://pnpm.io/) >= 9.0.0
- Conta no [Supabase](https://supabase.com/)

## Instalação

```bash
# Clone o repositório
git clone https://github.com/tassiadossantos/Codex.git

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais Supabase

# Inicie o servidor de desenvolvimento
pnpm dev
```

Acesse http://localhost:5173

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |

## Build para Produção

```bash
pnpm build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## Licença

Este projeto é de propriedade exclusiva de **Tassia dos Santos**. Qualquer uso, reprodução, modificação ou distribuição não autorizada é estritamente proibida. Consulte o arquivo [LICENSE](LICENSE) para detalhes completos.

---

<p align="center">
  <strong>CODEX</strong> &mdash; Desenvolvido por <a href="https://github.com/tassiadossantos">Tassia dos Santos</a>
</p>
