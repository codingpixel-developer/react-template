# AGENT.md

This is the entry point for AI agents working in this repository. Read this file first, then load only the skill file relevant to your current task.

---

## Quick Commands

```bash
npm run dev       # Dev server at localhost:5173 (Vite)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
```

---

## Tech Stack (at a glance)

- **React 19** · TypeScript 5 · Vite 7
- **Tailwind CSS v4** + SCSS modules (hybrid styling)
- **Redux Toolkit** + redux-persist
- **React Router v7** · Formik + Yup · Axios

All shared code lives under `src/shared/`. Use `@/shared/` for all imports from shared folders.

---

## Skill Files

Load the appropriate skill file for your task. Each file is self-contained and focused.

| Task                                                          | Skill file                        |
| ------------------------------------------------------------- | --------------------------------- |
| Understand project structure, add pages, configure Vite       | `.agent/skills/architecture.md`   |
| Use or create UI components (Button, Modal, Input, etc.)      | `.agent/skills/components.md`     |
| Apply styles, work with CSS variables, Tailwind, SCSS         | `.agent/skills/styling.md`        |
| Implement auth, protect routes, work with tokens/API          | `.agent/skills/auth.md`           |
| Add Redux state, create slices, use hooks                     | `.agent/skills/state.md`          |
| Add images/icons/fonts, use standard image handling           | `.agent/skills/assets.md`         |
| Follow naming conventions and component size rules            | `.agent/skills/code-standards.md` |
| Navigate between pages, add new routes, update access control | `.agent/skills/routes.md`         |

---

## Prompts

The `.prompts/` folder contains detailed prompts for complex, multi-step tasks. These prompts provide structured workflows and are meant to be used when the user asks for the corresponding feature.

| Task                                           | Prompt file                   |
| ---------------------------------------------- | ----------------------------- |
| Build an admin dashboard with multiple screens | `.prompts/admin-dashboard.md` |

---

## Critical Rules (always apply, regardless of task)

1. **Routes** — Never hardcode route strings. Always use `ROUTES.*` from `src/shared/lib/config/routes.ts`.
2. **Assets** — Never reference `/public` paths directly. Export from `public/*/index.ts` first.
3. **Images** — Use standard HTML `<img>` or a custom Image component if available. Never hardcode public paths.
4. **Component size** — Files must not exceed 300–350 lines. Split into sub-components or hooks.
5. **Naming** — All component folders and files use **camelCase** (e.g., `fileUpload/fileUpload.tsx`).
6. **Imports** — Always use `@/shared/` prefix for shared code. Never use relative `../../` paths.
