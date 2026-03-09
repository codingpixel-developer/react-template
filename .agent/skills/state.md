# Skill: State Management

**Read this when:** adding Redux state, creating new slices, reading/dispatching from components, working with persisted state, or using global hooks.

---

## Overview

State management uses **Redux Toolkit** with **redux-persist** for cross-session persistence. The store is provided via `StoreProvider` in the root app.

---

## Store Setup (`src/shared/lib/store/store.ts`)

```typescript
import { store } from '@/shared/lib/store/store';
import type { RootState, AppDispatch } from '@/shared/lib/store/store';
```

**Persisted slices:**
| Slice | Persisted fields |
|---|---|
| `auth` | `isLoggedIn`, `token`, `refreshToken` |
| `user` | `user` (full user object) |

---

## Available Slices

### Auth Slice (`authSlice.ts`)

```typescript
import {
  setToken,
  clearAuth,
  setLoggedIn,
} from '@/shared/lib/store/slices/authSlice';

// State shape
{
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
}
```

### User Slice (`userSlice.ts`)

```typescript
import {
  setUser,
  clearUser,
} from '@/shared/lib/store/slices/userSlice';

// State shape
{
  user: User | null;
}
```

---

## Typed Redux Hooks (`src/shared/lib/hooks/useRedux.ts`)

Always use these typed wrappers instead of plain `useSelector`/`useDispatch`:

```typescript
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks/useRedux';

const dispatch = useAppDispatch();
const token = useAppSelector((state) => state.auth.token);
const user = useAppSelector((state) => state.user.user);
```

---

## Adding a New Slice

1. Create `src/shared/lib/store/slices/yourSlice.ts`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface YourState {
  data: string | null;
}

const initialState: YourState = { data: null };

const yourSlice = createSlice({
  name: 'your',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<string>) => {
      state.data = action.payload;
    },
    clearData: (state) => {
      state.data = null;
    },
  },
});

export const { setData, clearData } = yourSlice.actions;
export default yourSlice.reducer;
```

2. Register in `store.ts` — add to `combineReducers` and optionally to `persistConfig.whitelist`.

---

## Key Hooks Summary

| Hook | Import | Purpose |
|---|---|---|
| `useAuth()` | `@/shared/lib/hooks/useAuth` | Auth state + login/logout |
| `useTheme()` | `@/shared/lib/hooks/useTheme` | Theme toggle + current theme |
| `useAppDispatch()` | `@/shared/lib/hooks/useRedux` | Typed Redux dispatch |
| `useAppSelector()` | `@/shared/lib/hooks/useRedux` | Typed Redux selector |
| `useToast()` | `@/shared/components/ui/toast/toast` | Toast notifications |

---

## StoreProvider (`src/shared/components/providers/StoreProvider.tsx`)

Wraps the entire app in `src/main.tsx`. No changes needed unless adding a new persist config.

> redux-persist uses `localStorage` by default. Cookie-based auth tokens use `storage.ts` utilities instead (see `.agent/skills/auth.md`).
