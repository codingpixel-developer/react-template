---
name: error-handling
description: Use when adding error boundaries, catching render errors, customizing the error fallback UI, or wiring error reporting in this React app.
---

# Skill: Error Handling

## What exists

- `src/shared/components/providers/ErrorBoundary.tsx` — reusable class boundary. Wraps the whole app in `main.tsx`.
- `src/shared/components/ui/errorFallback/errorFallback.tsx` — the default fallback UI (icon, message, Try again / Go home). Shows the error stack in dev only.

## What boundaries catch

Error boundaries catch errors thrown during **render, in lifecycle methods, and in constructors** of the tree below them. They do **NOT** catch:

- Event-handler errors (`onClick`, etc.)
- Async errors (`setTimeout`, `fetch`, promises)
- Errors in the boundary itself

For those, catch locally and surface via the toast pattern (`useToast` from `src/shared/components/ui/toast/toast`).

## Wrap a subtree

```tsx
import { ErrorBoundary } from '@/shared/components/providers/ErrorBoundary';

<ErrorBoundary>
  <RiskyWidget />
</ErrorBoundary>;
```

## Custom fallback

```tsx
<ErrorBoundary fallback={<InlineOops />}>
  <RiskyWidget />
</ErrorBoundary>;
```

Or reuse `ErrorFallback` directly with your own copy:

```tsx
import { ErrorFallback } from '@/shared/components/ui/errorFallback/errorFallback';

<ErrorBoundary
  fallback={<ErrorFallback title="Chart failed" message="Try reloading." />}
>
  <Chart />
</ErrorBoundary>;
```

## Error reporting hook

`onError` runs in `componentDidCatch`. Default logs to `console.error`. Wire a service here:

```tsx
<ErrorBoundary onError={(error, info) => reportToSentry(error, info)}>
  <App />
</ErrorBoundary>;
```
