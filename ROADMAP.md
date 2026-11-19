# Roadmap — Site Pessoal

Site pessoal que serve de portfólio/CV e é útil no dia a dia. Todo o conteúdo é gerido por uma área de admin, sem mexer em código.

## Funcionalidades

### Público
- **Sobre mim** — apresentação, competências, contactos
- **Projetos** — repos do GitHub (via API), com seleção, ordem e descrições escolhidas no admin
- **CV** — visualização e download do PDF
- **/now** — o que estou a fazer neste momento
- **Wishlist** — itens com link, preço atual, prioridade e histórico de preço; os visitantes podem reservar um item ("vou oferecer isto")

### Admin (`/admin`, acesso restrito)
- Login com GitHub, restrito ao meu ID
- Editar "sobre mim" e /now (markdown)
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

- `profile` — sobre mim, conteúdo do /now, links, URL do CV
- `projects` — repo, visível, ordem, descrição personalizada
- `wishlist_items` — nome, URL, imagem, prioridade, preço atual, tracking ativo
- `price_history` — item, preço, data
- `reservations` — item, nome/mensagem opcional, data

## Fases

### v1 — Base + admin
- [ ] Setup Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Projeto Supabase + esquema inicial das tabelas
- [ ] Login com GitHub (Supabase Auth) restrito ao meu ID
- [ ] Middleware a proteger `/admin`
- [ ] Páginas públicas: sobre mim, projetos, CV, /now, wishlist (só leitura)
- [ ] Integração com a API do GitHub (com cache/revalidate)
- [ ] Admin: editar perfil e /now
- [ ] Admin: gerir projetos
- [ ] Admin: upload do CV (Supabase Storage)
- [ ] Admin: CRUD da wishlist
- [ ] Deploy na Vercel

### v2 — Reservas na wishlist
- [ ] Botão "vou oferecer isto" com nome/mensagem opcional
- [ ] Item reservado fica marcado para os outros visitantes
- [ ] Anti-spam básico (rate limit / captcha)
- [ ] Ver e gerir reservas no admin

### v3 — Price tracker em Rust
- [ ] Worker Rust: ler os itens com tracking ativo
- [ ] Scraping dos preços (por loja)
- [ ] Gravar em `price_history` e atualizar o preço atual
- [ ] GitHub Actions com cron
- [ ] Gráfico do histórico de preço na página de cada item
- [ ] (Opcional) Alerta quando o preço baixa (email/Telegram)

### Obrigatórios
- [ ] Modo escuro
- [ ] Versão PT/EN
- [ ] Testes (unitários + e2e) e CI

### Extras (depois)
- [ ] Domínio próprio
