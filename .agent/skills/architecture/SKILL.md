---
name: architecture
description: Use when setting up new pages/routes, understanding folder structure, configuring Vite, adding new path aliases, or navigating the codebase for the first time.
---

# Skill: Project Architecture

---

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Framework | React 19, TypeScript 5, Vite 7      |
| Routing   | React Router v7                     |
| Styling   | Tailwind CSS v4 + SCSS/Sass modules |
| State     | Redux Toolkit + redux-persist       |
| Theme     | Custom ThemeContext (dark/light)    |
| Forms     | Formik + Yup                        |
| HTTP      | Axios with token refresh            |

---

## Project Structure

```
src/
├── pages/                        # Page components
│   ├── auth/
│   │   ├── login/
│   │   │   └── login.tsx
│   │   └── register/
│   │       └── register.tsx
│   ├── dashboard/
│   │   └── dashboard.tsx
│   └── home/
│       └── home.tsx
├── shared/                       # All shared code lives here
│   ├── components/
│   │   ├── ui/                   # Reusable UI primitives
│   │   ├── forms/                # Form-level components
│   │   └── providers/            # StoreProvider, ThemeProvider, ToastProvider
│   └── lib/
│       ├── api/                  # Axios instance + interceptors
│       ├── config/               # routes.ts (ROUTES, PUBLIC_ROUTES, etc.)
│       ├── hooks/                # useAuth, useTheme, useRedux, useToast
│       ├── store/                # Redux slices + store config
│       ├── types/                # Global TypeScript types
│       └── validations/          # Yup schemas
├── styles/
│   └── globals.css               # Tailwind + CSS custom properties
├── App.tsx                       # Root app component with routing
├── main.tsx                      # App entry point
└── vite-env.d.ts                 # Vite environment types

public/
├── icons/index.ts
├── images/index.ts
└── fonts/index.ts

index.html                        # HTML entry point
vite.config.ts                    # Vite configuration
```

---

## Path Aliases

The `@/*` alias maps to the **src folder**.

```typescript
@/shared/lib/*           // Utilities, hooks, store, API
@/shared/components/*     // Shared components
@/shared/lib/config/routes   // Route configuration
@/shared/lib/hooks/useAuth    // Auth hook
@/shared/lib/store/store      // Redux store
@/shared/lib/utils/storage    // Cookie utilities
@/public/images              // Image asset exports
@/public/icons               // Icon asset exports
```

> Always use `@/shared/` prefix when importing from shared folders. Never use relative paths like `../../lib/`.

---

## Vite Configuration (`vite.config.ts`)

- `@` alias maps to `/src`
- TypeScript path resolution
- React plugin with Fast Refresh
- SCSS/Sass support built-in

---

## Environment Variables

Create `.env.local` with:

```
VITE_API_BASE_URL=http://localhost:3000/api
NODE_ENV=development
```

- `VITE_API_BASE_URL` — used in `src/shared/lib/api/axios.ts`
- `NODE_ENV` — affects cookie `secure` flag in `src/shared/lib/utils/storage.ts`

> **Note:** Vite requires `VITE_` prefix for env vars exposed to the client.

---

## Adding New Pages

1. Create the page component in the appropriate folder:
   - Auth pages → `src/pages/auth/yourPage/yourPage.tsx`
   - Protected pages → `src/pages/dashboard/yourPage/yourPage.tsx`
   - Public pages → `src/pages/yourPage/yourPage.tsx`

2. Add the route constant to `src/shared/lib/config/routes.ts`

3. Register the route in `src/App.tsx` within the appropriate route group

4. Update `PUBLIC_ROUTES`, `PROTECTED_ROUTES`, or `AUTH_ROUTES` in `routes.ts` as needed
