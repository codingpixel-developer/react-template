# CLAUDE.md

This is the entry point for AI agents working in this repository. Read this file first, then load only the skill file relevant to your current task.

---

## Quick Commands

```bash
npm run dev       # Dev server at localhost:5173 (Vite)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
npm run format    # Format with Prettier
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
| Understand project structure, add pages, configure Vite       | `.claude/skills/architecture/SKILL.md`          |
| Use or create UI components (Button, Modal, Input, etc.)      | `.claude/skills/components/SKILL.md`            |
| Apply styles, work with CSS variables, Tailwind, SCSS         | `.claude/skills/styling/SKILL.md`               |
| Implement auth, protect routes, work with tokens/API          | `.claude/skills/auth/SKILL.md`                  |
| Add Redux state, create slices, use hooks                     | `.claude/skills/state/SKILL.md`                 |
| Navigate between pages, add new routes, update access control | `.claude/skills/routes/SKILL.md`                |
| Add error boundaries, customize error fallback UI, wire error reporting | `.claude/skills/error-handling/SKILL.md`        |
| Follow naming conventions and component size rules            | `.claude/rules/code-standards/SKILL.md`         |
| Add images/icons/fonts, use standard image handling           | `.claude/rules/assets/SKILL.md`                 |
| Create a GitHub Actions workflow to build + deploy via SSH    | `.claude/skills/github-workflow-deploy/SKILL.md` |

---

## Prompts

The `.prompts/` folder contains detailed prompts for complex, multi-step tasks. These prompts provide structured workflows and are meant to be used when the user asks for the corresponding feature.

| Task                                           | Prompt file                   |
| ---------------------------------------------- | ----------------------------- |
| Build an admin dashboard with multiple screens | `.prompts/admin-dashboard.md` |

---

## Critical Rules (always apply, regardless of task)

1. **Routes** — Never hardcode route strings. Always use `ROUTES.*` from `src/shared/lib/config/routes.ts`.
2. **Assets** — Never reference asset paths directly. All app assets (icons, images, fonts) live in `src/shared/assets/`. Export from `src/shared/assets/*/index.ts` first. Only favicons and static files served at the root go in `public/`.
3. **Images** — Use standard HTML `<img>` or a custom Image component if available. Always import from `@/shared/assets/`.
4. **Component size** — Files must not exceed 300–350 lines. Split into sub-components or hooks.
5. **Naming** — All component folders and files use **camelCase** (e.g., `fileUpload/fileUpload.tsx`).
6. **Imports** — Always use `@/shared/` prefix for shared code. Never use relative `../../` paths.
7. **Modals & Dialogs** — Always create modals and dialogs as separate, dedicated components. Never define modal JSX inline inside a page or parent component. Place them in the same feature folder (e.g., `pages/users/deleteUserModal/deleteUserModal.tsx`) or in `src/shared/components/` if reusable.
8. **Error boundaries** — The app is wrapped in `ErrorBoundary` (`src/shared/components/providers/ErrorBoundary.tsx`). Wrap risky subtrees with it; catch event-handler/async errors locally and surface via toast (boundaries don't catch those).
