# Ritmo

Gerenciador Kanban responsivo construído com Next.js 16, React 19 e Supabase.

## Desenvolvimento

Requer Node.js 22 ou superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sem variáveis de ambiente, `/board` funciona em modo demonstração. Com Supabase configurado, autenticação, isolamento por usuário e persistência ficam ativos.

## Supabase

1. Crie um projeto e ative Google em **Authentication > Providers**.
2. Adicione `http://localhost:3000/auth/callback` e a URL da Vercel às URLs de redirecionamento.
3. Vincule o CLI e aplique a migration:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

A migration em `supabase/migrations` cria perfis, workspaces, membros, quadros, colunas, cartões, etiquetas, índices, triggers e políticas RLS. Cada usuário Google recebe automaticamente um workspace e um quadro privados.

## Vercel

Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no projeto da Vercel. O runtime está fixado em Node.js 22+ pelo campo `engines`.

## Qualidade

```bash
npm test
npm run lint
npm run typecheck
npm run build
```
