# Skill: Asset Management

**Read this when:** adding images, icons, or fonts to the project, displaying images in components, or referencing any file from the `public/` folder.

---

## Rule: All Assets Go Through `index.ts`

**CRITICAL:** Never reference asset paths directly as strings in components. Every asset in `public/` must be exported from its folder's `index.ts` first.

---

## Folder Structure

```
public/
├── icons/
│   ├── index.ts      ← export all icons here
│   └── *.svg
├── images/
│   ├── index.ts      ← export all images here
│   └── *.*
└── fonts/
    ├── index.ts      ← export all fonts here
    └── *.*
```

---

## Workflow: Adding a New Asset

### Adding an Image

```typescript
// Step 1: Place file at public/images/hero-banner.jpg

// Step 2: Add to public/images/index.ts
export const images = {
  heroBanner: '/images/hero-banner.jpg',
  profileAvatar: '/images/profile-avatar.png',
  // ... all other images
} as const;

// Step 3: Use in component
import { images } from '@/public/images';

<img src={images.heroBanner} alt="Hero" width={800} height={400} />
```

### Adding an Icon

```typescript
// Step 1: Place file at public/icons/close.svg

// Step 2: Add to public/icons/index.ts
export const icons = {
  close: '/icons/close.svg',
  search: '/icons/search.svg',
  // ... all other icons
} as const;

// Step 3: Use in component
import { icons } from '@/public/icons';

<img src={icons.close} alt="Close" width={24} height={24} />
```

---

## Using Images in Components

Use standard HTML `<img>` or create a custom Image component if you need additional features:

```typescript
// ✅ Standard HTML img
import { images } from '@/public/images';
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

Vite provides several features for asset handling:

```typescript
// Import asset URL (for dynamic usage)
import logoUrl from '@/public/images/logo.png';

// Import as string (for inline SVG)
import logoSvg from '@/public/icons/logo.svg?raw';

// Vite automatically handles:
// - Hashing for cache busting
// - Base64 inlining for small assets (< 4KB)
// - Proper MIME types
```

---

## Anti-Patterns

```typescript
// ❌ Hardcoded path in JSX
<img src="/images/hero.jpg" />

// ❌ Path string directly without index.ts export
<img src="/images/hero.jpg" alt="Hero" width={800} height={400} />

// ✅ Correct pattern
import { images } from '@/public/images';
<img src={images.hero} alt="Hero" width={800} height={400} />
```
