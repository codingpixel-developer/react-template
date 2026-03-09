# Skill: Authentication Architecture

**Read this when:** implementing login/logout, protecting routes, working with tokens, modifying route protection, handling API auth errors, or adding new protected/public pages.

---

## Overview

Authentication is implemented across three layers:
1. **`ProtectedRoute` component** — client-side route protection
2. **Axios interceptor** — attaches tokens to requests, handles refresh
3. **Redux auth slice** — persists login state client-side

---

## ProtectedRoute Component

Located at `src/shared/components/providers/ProtectedRoute.tsx`.

**Logic:**
- Reads `token` from cookies via `storage.ts`
- Unauthenticated user on a protected route → redirect to `/login`
- Authenticated user on an auth route (e.g., `/login`) → redirect to `/dashboard`
- All other cases → render children

**To change protection rules:** modify `PROTECTED_ROUTES` and `AUTH_ROUTES` in `src/shared/lib/config/routes.ts` (see `.agent/skills/routes.md`).

```tsx
// Usage in App.tsx
<Route path={ROUTES.DASHBOARD} element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Auth-only route (redirects logged-in users)
<Route path={ROUTES.LOGIN} element={
  <ProtectedRoute requireAuth={false} redirectTo={ROUTES.DASHBOARD}>
    <Login />
  </ProtectedRoute>
} />
```

---

## Axios Interceptor (`src/shared/lib/api/axios.ts`)

```
Request → attach Bearer token from cookies
                          ↓
Response 401 → queue pending requests (max 100)
                          ↓
              POST /auth/refresh with refreshToken
                          ↙          ↘
              Success               Failure
         retry queued reqs     clear cookies + redirect /login
```

**Key behaviors:**
- Token read from cookies via `storage.ts` utilities
- A single refresh request is made even if multiple 401s occur simultaneously (queue pattern)
- On refresh success: all queued requests are retried with the new token
- On refresh failure: `isLoggedIn` and both tokens are cleared, user sent to login

---

## API Client (`src/shared/lib/api/client.ts`)

Pre-configured Axios instance. Use this for all API calls:

```typescript
import { apiClient } from '@/shared/lib/api/client';

const response = await apiClient.get('/users/me');
const response = await apiClient.post('/auth/login', { email, password });
```

---

## Auth Hook (`src/shared/lib/hooks/useAuth.ts`)

```typescript
import { useAuth } from '@/shared/lib/hooks/useAuth';

const { isLoggedIn, token, user, login, logout } = useAuth();
```

---

## Redux Auth Slice (`src/shared/lib/store/slices/authSlice.ts`)

Persisted fields: `isLoggedIn`, `token`, `refreshToken`

```typescript
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks/useRedux';
import { setToken, clearAuth } from '@/shared/lib/store/slices/authSlice';

const dispatch = useAppDispatch();
dispatch(setToken({ token: 'abc', refreshToken: 'xyz' }));
dispatch(clearAuth());
```

---

## Storage Utilities (`src/shared/lib/utils/storage.ts`)

Cookie helpers used by both the interceptor and auth slice:

```typescript
import { storage } from '@/shared/lib/utils/storage';

storage.getToken()           // Read token cookie
storage.setToken(token)      // Write token cookie
storage.clear()              // Remove all auth cookies
```

Cookie `secure` flag is set based on `NODE_ENV`.

---

## Login Flow (End-to-End)

```
1. User submits login form (Formik + loginSchema)
2. POST /auth/login via apiClient
3. On success: dispatch setToken() → persist to cookies
4. navigate(ROUTES.DASHBOARD)

ProtectedRoute redirects any visit to /login back to /dashboard
once the token cookie is present.
```

---

## Form Validation Schemas (`src/shared/lib/validations/schemas.ts`)

Pre-built Yup schemas:

| Schema | Use case |
|---|---|
| `loginSchema` | Email + password login |
| `registerSchema` | Full registration |
| `forgotPasswordSchema` | Email only |
| `resetPasswordSchema` | New + confirm password |
| `profileSchema` | Name, bio, etc. |
| `changePasswordSchema` | Current + new password |
| `contactSchema` | Name, email, message |

```typescript
import { loginSchema } from '@/shared/lib/validations/schemas';
// Use with Formik: validationSchema: loginSchema
```
