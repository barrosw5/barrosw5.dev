@AGENTS.md

# barrosw5.dev — regras do projeto

Site pessoal (portfólio/CV, /now, wishlist) com área de admin. O plano e as fases estão em [ROADMAP.md](ROADMAP.md).

Stack: Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui, Supabase, Storybook, Vitest. Gestor de pacotes: **pnpm**.

## 1. Idiomas: inglês e português de Portugal (sempre)

- O site existe sempre em **`en`** e **`pt-PT`**. Nenhuma funcionalidade fica só num idioma.
- **Nenhum texto visível ao utilizador fica escrito à mão nos componentes.** Todo o texto passa por uma função `t('chave')`, que lê a tradução do JSON do locale ativo.
- As traduções vivem em `src/i18n/messages/en.json` e `src/i18n/messages/pt-PT.json`. **Os dois ficheiros têm sempre as mesmas chaves**: quem acrescenta uma chave num acrescenta-a no outro, no mesmo commit.
- As chaves organizam-se por funcionalidade (ex.: `wishlist.reserve.button`, `admin.projects.title`).
- Português **de Portugal**, não do Brasil (ex.: "ecrã", "utilizador", "guardar", "transferir").
- Também se traduzem: `aria-label`, `alt`, `title`, placeholders, mensagens de erro e metadados da página.
- Datas, números e preços formatam-se segundo o locale (`Intl`), através de funções em `core/utils/`.

## 2. Arquitetura do frontend

Fluxo, sempre nesta direção (cada camada só chama a seguinte):

```
Page (View) → Components (UI + Hook) → Hooks (Estado/Lógica) → Services (Regras de negócio) → API (Chamadas HTTP)
```

Estrutura em `src/`:

| Pasta | Papel | Pode importar |
|---|---|---|
| `app/**/page.tsx` | **Pages (views).** Cascas vazias que só importam e montam componentes. Sem estado, sem lógica, sem chamadas. | `components/` |
| `components/` | Componentes de UI (ex.: `LoginForm`, `Dashboard`). Cada componente chama **o seu próprio hook** para o estado e a lógica, para a page ficar limpa. `components/ui/` é para os primitivos do shadcn. | `hooks/`, `core/utils/`, `core/types/`, outros componentes |
| `hooks/` | Custom hooks (ex.: `useAuth.ts`, `useDashboard.ts`). Gerem o estado (`useState`, `useEffect`), chamam os services e devolvem os dados ao componente. | `core/services/`, `core/types/` |
| `core/services/` | Lógica de negócio. Processam os dados antes de os enviar para a API e depois de os receber. | `core/api/`, `core/types/`, `core/utils/` |
| `core/api/` | Chamadas HTTP puras (`fetch`), ex.: `authApi.ts`. **Sem estado React.** | `core/types/` |
| `core/types/` | Interfaces e tipos TypeScript partilhados. | — |
| `core/utils/` | Funções puras de apresentação (ex.: `formatTime`, `formatPrice`), sem estado nem API. **É a única pasta de `core/` que os componentes podem importar diretamente.** | `core/types/` |

Regras:

- **Não usar `src/pages/`**: no Next.js essa pasta ativa o Pages Router e choca com o `app/`. A camada "Pages" são os `page.tsx` (e `layout.tsx`) dentro de `src/app/`.
- Nunca saltar camadas: um componente não chama `core/services/` nem `core/api/`; um hook não chama `core/api/`.
- Nomes: componentes em `PascalCase.tsx`, hooks `useAlgo.ts`, APIs `algoApi.ts`, services `algoService.ts`.
- Antes de escrever código Next.js, ler o guia em `node_modules/next/dist/docs/` (ver AGENTS.md).

## 3. Documentação das APIs

- Todas as funções exportadas de `core/api/` e `core/services/` têm **TSDoc**: o que fazem, parâmetros, o que devolvem e os erros que podem lançar.
- Cada endpoint HTTP do projeto (Route Handlers em `app/api/**/route.ts`, Server Actions expostas e chamadas a serviços externos como Supabase ou a API do GitHub) está documentado em `docs/API.md`: método, caminho, autenticação, corpo do pedido, respostas e códigos de erro, com um exemplo.
- Mudar um endpoint implica atualizar a documentação no mesmo PR.

## 4. Storybook para todos os componentes

- **Cada componente em `components/` tem um ficheiro `.stories.tsx` ao lado**, com os estados relevantes (por omissão, a carregar, vazio, erro, desativado...).
- As stories mostram o componente nos dois idiomas (`en` e `pt-PT`) e em modo claro e escuro.
- Os stories correm como testes (`@storybook/addon-vitest`) e o CI faz `build-storybook`: uma story partida bloqueia o PR.

## 5. Git, CI e a branch `main`

- **A `main` está protegida: nunca se faz commit nem push direto para a `main`.** Todo o trabalho entra por branch + Pull Request.
- O PR só pode ser integrado com os checks do GitHub Actions a verde (`.github/workflows/`): lint, typecheck, testes, build e build do Storybook, CodeQL e título do PR.
- Merge por **squash**: o título do PR torna-se a mensagem de commit na `main`, por isso segue **Conventional Commits** (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `perf`).
- Antes de abrir um PR, correr localmente: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
