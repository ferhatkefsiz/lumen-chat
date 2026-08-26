# AI Chat Dashboard

A polished AI chat dashboard built with Next.js 16, React 19 and Tailwind CSS v4.

> 🚧 Work in progress — actively being built.

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **UI:** React 19 + [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Language:** TypeScript
- **Package manager:** [pnpm](https://pnpm.io)

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |

## Agent skills

This repo ships a curated set of [agent skills](https://skills.sh) — reusable,
version-pinned instruction packs that guide AI coding assistants (Claude Code,
Cursor, etc.) to follow current framework conventions instead of stale training
data.

**Layout**

- `.claude/skills/` — the skill files, vendored into the repo so Claude Code
  discovers them (no install step needed on clone).
- `skills-lock.json` — records each skill's source repo + content hash
  (provenance), so the set is traceable and updatable.

**Installed skills**

| Skill | Source | Purpose |
| --- | --- | --- |
| `next-cache-components-optimizer` | `vercel/next.js` | Optimize routes for Cache Components / instant nav |
| `next-cache-components-adoption` | `vercel/next.js` | Adopt/migrate to Cache Components |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | React/Next.js performance patterns |
| `vercel-composition-patterns` | `vercel-labs/agent-skills` | Scalable component composition |
| `web-design-guidelines` | `vercel-labs/agent-skills` | Web interface / accessibility guidelines |
| `shadcn` | `shadcn/ui` | Correct shadcn/ui usage |

Skills are picked up automatically when a task matches their triggers; no manual
step is required to benefit from them.

**Managing skills** — via the [`skills`](https://skills.sh) CLI (run with `npx`):

```bash
# List the installed skills
npx skills list

# Add a new skill from a repo
npx skills add <owner>/<repo>
```

> Note: `npx skills update` refreshes skills but reorganizes them into a shared
> `.agents/skills/` directory with symlinks. This repo keeps things simple by
> vendoring the files directly under `.claude/skills/`.
