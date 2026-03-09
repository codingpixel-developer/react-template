# Skill: Route Management

**Read this when:** navigating programmatically, linking between pages, adding new routes, updating access control, or working with route protection.

---

## Rule: Never Hardcode Route Strings

**CRITICAL:** Routes must never be written as string literals in components or pages. Always import from `ROUTES`.

```typescript
// ❌ NEVER
navigate('/dashboard');
navigate('/login');
<Link to="/profile">Profile</Link>

// ✅ ALWAYS
import { ROUTES } from '@/shared/lib/config/routes';
navigate(ROUTES.DASHBOARD);
navigate(ROUTES.LOGIN);
<Link to={ROUTES.PROFILE}>Profile</Link>
```

---

## Route Configuration (`src/shared/lib/config/routes.ts`)

```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  // ... all routes defined here
} as const;

// Route group arrays (used by ProtectedRoute for access control)
export const PUBLIC_ROUTES = [ROUTES.HOME] as const;
export const PROTECTED_ROUTES = [ROUTES.DASHBOARD, ROUTES.PROFILE] as const;
export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;

// O(1) lookup helpers
export const isPublicRoute = (path: string): boolean => ...
export const isProtectedRoute = (path: string): boolean => ...
export const isAuthRoute = (path: string): boolean => ...
```

---

## Adding a New Route

1. Add the constant to `ROUTES`:

```typescript
export const ROUTES = {
  // ...existing routes
  SETTINGS: '/settings',
} as const;
```

2. Create the page component:
   - Protected page → `src/pages/dashboard/settings/settings.tsx`
   - Auth page → `src/pages/auth/register/register.tsx`
   - Public page → `src/pages/about/about.tsx`

3. Register in `src/App.tsx`:

```tsx
import { Settings } from '@/pages/dashboard/settings/settings';

<Route path={ROUTES.SETTINGS} element={
  <ProtectedRoute>
    <Settings />
  </ProtectedRoute>
} />
```

4. Add to the correct route group array:
   - `PROTECTED_ROUTES` — requires authentication
   - `AUTH_ROUTES` — redirects away if already authenticated
   - `PUBLIC_ROUTES` — accessible to everyone

---

## Navigation in Components

```typescript
// Client-side navigation
import { useNavigate, Link } from 'react-router';
import { ROUTES } from '@/shared/lib/config/routes';

const navigate = useNavigate();
navigate(ROUTES.DASHBOARD);
navigate(ROUTES.LOGIN, { replace: true });

// Link component
<Link to={ROUTES.DASHBOARD}>Go to Dashboard</Link>

// Navigate with state
navigate(ROUTES.LOGIN, { state: { from: location.pathname } });
```

---

## Route Protection

Use the `ProtectedRoute` component for authentication-based access control:

```tsx
// src/App.tsx
import { ProtectedRoute } from '@/shared/components/providers/ProtectedRoute';

<Route path={ROUTES.DASHBOARD} element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// For auth-only routes (redirect logged-in users)
<Route path={ROUTES.LOGIN} element={
  <ProtectedRoute requireAuth={false} redirectTo={ROUTES.DASHBOARD}>
    <Login />
  </ProtectedRoute>
} />
```

---

## Why This Pattern?

| Benefit | Explanation |
|---|---|
| Refactoring safety | Change a URL in one place — all usages update automatically |
| Type safety | TypeScript catches `ROUTES.DASHBORD` (typo) at compile time |
| IDE autocompletion | `ROUTES.` shows all valid routes |
| Access control | `PROTECTED_ROUTES` array is the single source of truth for route protection |
| No broken links | Impossible to have a mismatched path between navigation and the actual page |
