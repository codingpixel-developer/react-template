# Skill: Asset Management

**Read this when:** adding images, icons, or fonts to the project, displaying images in components, or referencing any asset file.

---

## Rule: All Assets Go Through `index.ts`

**CRITICAL:** Never reference asset paths directly as strings in components. Every asset in `src/shared/assets/` must be exported from its folder's `index.ts` first.

---

## Folder Structure

```
src/shared/assets/
├── icons/
│   ├── index.ts      ← export all icons here
│   └── *.svg
├── images/
│   ├── index.ts      ← export all images here
│   └── *.*
└── fonts/
    ├── index.ts      ← export all fonts here
    └── *.*

public/               ← only favicons and root-served static files
└── vite.svg
```

---

## Workflow: Adding a New Asset

### Adding an Image

```typescript
// Step 1: Place file at src/shared/assets/images/hero-banner.jpg

// Step 2: Add to src/shared/assets/images/index.ts
export const images = {
  heroBanner: new URL('./hero-banner.jpg', import.meta.url).href,
  profileAvatar: new URL('./profile-avatar.png', import.meta.url).href,
} as const;

// Step 3: Use in component
import { images } from '@/shared/assets/images';

<img src={images.heroBanner} alt="Hero" width={800} height={400} />
```

### Adding an Icon

```typescript
// Step 1: Place file at src/shared/assets/icons/close.svg

// Step 2: Add to src/shared/assets/icons/index.ts
export const icons = {
  close: new URL('./close.svg', import.meta.url).href,
  search: new URL('./search.svg', import.meta.url).href,
} as const;

// Step 3: Use in component
import { icons } from '@/shared/assets/icons';

<img src={icons.close} alt="Close" width={24} height={24} />
```

---

## Using Images in Components

Use standard HTML `<img>` or create a custom Image component if you need additional features:

```typescript
// ✅ Standard HTML img
import { images } from '@/shared/assets/images';
<img src={images.hero} alt="Hero" width={800} height={400} />

// ✅ With lazy loading
<img src={images.hero} alt="Hero" width={800} height={400} loading="lazy" />

// ✅ With object-fit styling
<div style={{ position: 'relative', width: '100%', height: '300px' }}>
  <img
    src={images.banner}
    alt="Banner"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
</div>
```

---

## Vite Asset Handling

Since assets live inside `src/`, Vite processes them automatically:

```typescript
// Import asset URL directly (Vite handles hashing + cache busting)
import logoUrl from '@/shared/assets/images/logo.png';

// Import as inline SVG string
import logoSvg from '@/shared/assets/icons/logo.svg?raw';
```

---

## Anti-Patterns

```typescript
// ❌ Hardcoded path string
<img src="/images/hero.jpg" />

// ❌ Importing from public/ for app assets
import { images } from '@/public/images';

// ✅ Correct pattern
import { images } from '@/shared/assets/images';
<img src={images.hero} alt="Hero" width={800} height={400} />
```
