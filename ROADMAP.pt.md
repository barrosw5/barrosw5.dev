# Roadmap — Site Pessoal

[English](ROADMAP.md) | **Português**

Site pessoal que serve de portfólio/CV e é útil no dia a dia. Todo o conteúdo é gerido por uma área de admin, sem mexer em código.

## Funcionalidades

### Público
- **Sobre** — sobre mim, o que estou a fazer agora, experiência, stack, formação e certificados, contactos e o CV (ver e transferir o PDF)
- **Projetos** — repos do GitHub (via API), com seleção, ordem e descrições escolhidas no admin
- **Wishlist** — itens com link, preço atual, prioridade e histórico de preço; os visitantes podem reservar um item ("vou oferecer isto")

### Admin (`/admin`, acesso restrito)
- Login com GitHub, restrito ao meu ID
- Editar o conteúdo do Sobre com campos de formulário: sobre mim, /now, experiência, stack, formação, certificados e contactos (também mostrados no rodapé)
- Gerir projetos: mostrar/esconder, ordem, descrição personalizada
- Upload de um CV novo
- Gerir a wishlist: adicionar/remover itens, ver reservas, ativar o tracking de preço

## Arquitetura

```
Next.js (Vercel)
 ├─ site público (Server Components + cache/revalidate)
 └─ /admin (protegido) → Server Actions → revalidatePath()
        │
    Supabase ── Postgres · Auth (GitHub) · Storage (CV, imagens)
        ▲
Worker em Rust (GitHub Actions cron, ex.: de 6 em 6 h)
 └─ vai buscar os preços → grava o histórico → (opcional) envia notificação
```

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend + backend | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| Dados | Supabase (Postgres, Auth, Storage) |
| Price tracker | Rust (`tokio`, `reqwest`, `scraper`, `sqlx`) |
| Deploy | Vercel (site), GitHub Actions (cron do worker) |
| Domínio | `*.vercel.app` por agora; domínio próprio mais tarde |

## Modelo de dados (rascunho)

- `profile` — sobre mim, conteúdo do "agora", experiência, stack, formação, certificados, contactos, onde estou, URL do CV (acrescentado na fase 4)
- `projects` — repo, visível, ordem, descrição personalizada
- `wishlist_items` — nome, URL, imagem, prioridade, preço atual, tracking ativo
- `price_history` — item, preço, data
- `reservations` — item, nome/mensagem opcional, data

## Fases

A fase 0 monta as bases. A partir daí, cada fase é **uma funcionalidade feita de ponta a ponta**, seguindo a arquitetura do [CLAUDE.md](CLAUDE.md):

```
BD → API (core/api, documentada em docs/API.md) → Service → Hook → Componentes (+ stories, en/pt) → Página → Testes
```

Uma funcionalidade só está feita quando funciona nos dois idiomas, em modo claro e escuro, no telemóvel e no computador, e com o CI verde.

### Fase 0 — Bases
- [x] Setup Next.js + TypeScript + Tailwind + shadcn/ui
- [x] Storybook + Vitest (os stories correm como testes)
- [x] CI (GitHub Actions: lint, typecheck, testes, build, CodeQL, título do PR) + `main` protegida
- [x] i18n: função `t()` + `en.json` / `pt.json` + idioma no URL (`/en`, `/pt`)
- [x] Botão para mudar de idioma
- [x] Modo escuro (botão + preferência do sistema)
- [x] Identidade visual — direção: 3 a 5 referências (o que gosto em cada uma), 3 palavras para o que o site deve transmitir, e como se adapta do telemóvel ao computador
- [x] Identidade visual — design tokens no `globals.css`: paleta de cores (claro e escuro), tipos de letra, escala tipográfica, espaçamentos, cantos e breakpoints, tudo mobile-first
- [x] Identidade visual — aplicar aos componentes que já existem (LanguageSwitcher, ThemeToggle, Welcome) e confirmá-los no telemóvel e no computador no Storybook
- [x] Layout base: cabeçalho, navegação (menu no telemóvel + navegação no computador), rodapé (+ stories), páginas "em construção" e página 404
- [x] Paleta de comandos ⌘K / Ctrl+K (computador; mostra ⌘ no Mac e Ctrl nos outros)
- [x] Setup de testes e2e com Playwright (+ job no CI)
- [x] Projeto Supabase + variáveis de ambiente (`.env.example`)
- [x] Deploy na Vercel (com deploy de preview em cada PR)

### Fase 1 — Autenticação e admin
- [x] Login com GitHub (Supabase Auth), restrito ao meu ID
- [x] `proxy.ts` a proteger `/admin` (nome no Next 16 do antigo `middleware.ts`)
- [x] Layout e navegação do admin (+ stories)
- [x] Testes: unitários + e2e (acesso negado sem login, permitido com login)

### Fase 2 — Sobre (experiência, agora, contactos)
- [x] BD: tabela `profile`
- [x] API + service: `profileApi` / `profileService` (+ docs)
- [x] Hook: `useProfile`
- [ ] Componentes: o bento do Sobre — sobre mim com o que estou a fazer agora e a hora local, experiência, stack, formação e certificados, contactos (+ stories)
- [ ] Páginas: a apresentação no início e `/about` (substitui a página "em construção")
- [ ] Admin: editar todos os cartões do Sobre com campos de formulário, onde estou e os contactos (também mostrados no rodapé)
- [ ] Decidir o email de contacto público (pessoal, um alias ou um endereço à parte)
- [ ] Testes

### Fase 3 — Projetos
- [ ] BD: tabela `projects`
- [ ] API: repos do GitHub (com cache/revalidate) + `projectsApi` (+ docs)
- [ ] Service: juntar os dados do GitHub com as definições do admin (visível, ordem, descrição)
- [ ] Hook: `useProjects`
- [ ] Componentes: `ProjectList`, `ProjectCard` (+ stories)
- [ ] Páginas: `/projects` (substitui a página "em construção") e os projetos em destaque no início
- [ ] Admin: mostrar/esconder, ordem e descrição personalizada
- [ ] Testes

### Fase 4 — CV
- [ ] Storage: bucket para o CV no Supabase Storage
- [ ] API + service + hook do CV (+ docs)
- [ ] Componentes: `CvViewer`, botão de download (+ stories)
- [ ] Cartão do CV em `/about` (ver e transferir)
- [ ] Admin: upload de um CV novo
- [ ] Testes

### Fase 5 — Wishlist
- [ ] BD: tabela `wishlist_items`
- [ ] API + service: `wishlistApi` / `wishlistService` (+ docs)
- [ ] Hook: `useWishlist`
- [ ] Componentes: `WishlistGrid`, `WishlistCard` (+ stories)
- [ ] Página: `/wishlist`, só leitura (substitui a página "em construção")
- [ ] Admin: adicionar, editar e remover itens
- [ ] Testes

### Fase 6 — Reservas na wishlist
- [ ] BD: tabela `reservations`
- [ ] API + service + hook das reservas (+ docs)
- [ ] Botão "vou oferecer isto" com nome/mensagem opcional (+ stories)
- [ ] Item reservado fica marcado para os outros visitantes
- [ ] Anti-spam básico (rate limit / captcha)
- [ ] Admin: ver e gerir reservas
- [ ] Testes

### Fase 7 — Price tracker em Rust
- [ ] BD: tabela `price_history` + campo "tracking ativo" nos itens
- [ ] Worker Rust: ler os itens com tracking ativo
- [ ] Scraping dos preços (por loja)
- [ ] Gravar em `price_history` e atualizar o preço atual
- [ ] GitHub Actions com cron (ex.: de 6 em 6 h)
- [ ] Admin: ativar/desativar o tracking de preço por item
- [ ] Gráfico do histórico de preço na página de cada item (+ stories)
- [ ] (Opcional) Alerta quando o preço baixa (email/Telegram)
- [ ] Testes (worker + gráfico)

### Extras (depois)
- [ ] Domínio próprio
- [x] Estatísticas de visitas e de velocidade real: Vercel Web Analytics + Speed Insights (plano gratuito, sem cookies)
- [ ] Easter eggs: referências a Zelda e Undertale/Deltarune (ideias em [docs/DESIGN.md](docs/DESIGN.md))
