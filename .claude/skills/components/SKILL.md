---
name: components
description: Use when using any existing UI component, building a new UI component, or understanding component patterns and conventions.
---

# Skill: UI Components

---

## Location & Conventions

All UI primitives live in `src/shared/components/ui/`.

- **Naming:** camelCase folders and files (e.g., `fileUpload/fileUpload.tsx`)
- **Styles:** Co-located SCSS module (e.g., `fileUpload/fileUpload.module.scss`)
- **Size:** Never exceed 300–350 lines per file
- **Types:** TypeScript interface for all props
- **Theme:** Dark mode via CSS variables + `:global(.dark) &` in SCSS

---

## Available Components

### Layout & Navigation

| Component    | Import path                | Key props                                   |
| ------------ | -------------------------- | ------------------------------------------- |
| `Accordion`  | `ui/accordion/accordion`   | `defaultExpanded`, `allowMultiple`          |
| `Modal`      | `ui/modal/modal`           | `isOpen`, `onClose`, `size`                 |
| `Tabs`       | `ui/tabs/tabs`             | `defaultTab`                                |
| `Pagination` | `ui/pagination/pagination` | `currentPage`, `totalPages`, `onPageChange` |

### Forms & Inputs

| Component      | Import path                    | Key props                                                                          |
| -------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| `Button`       | `ui/button/button`             | `variant`, `size`, `loading`, `disabled`                                           |
| `DatePicker`   | `ui/datePicker/datePicker`     | `label`, `value`, `onChange`, `minDate`, `maxDate`                                 |
| `TimePicker`   | `ui/timePicker/timePicker`     | `label`, `value`, `onChange`, `minTime`, `maxTime`, `minuteStep`                   |
| `Input`        | `ui/input/input`               | `label`, `error`, `helpText`, `leftIcon`, `rightIcon`                              |
| `TextArea`     | `ui/textArea/textArea`         | `label`, `rows`, `maxLength`, `showCount`, `resize`                                |
| `Checkbox`     | `ui/checkbox/checkbox`         | `label`, `checked`, `indeterminate`, `onChange`                                    |
| `ToggleSwitch` | `ui/toggleSwitch/toggleSwitch` | `label`, `checked`, `onChange`                                                     |
| `PhoneInput`   | `ui/phoneInput/phoneInput`     | `value`, `onChange`, `defaultCountry`, `label`                                     |
| `FileUpload`   | `ui/fileUpload/fileUpload`     | `multiple`, `maxFiles`, `maxSize`, `accept`, `onFilesChange`                       |
| `Dropdown`     | `ui/dropdown/dropdown`         | `label`, `items` or `loadOptions` + `queryKey`, `selectedItem`, `onSelect`, `mode` |

### Feedback & Display

| Component       | Import path                      | Key props                                |
| --------------- | -------------------------------- | ---------------------------------------- |
| `Alert`         | `ui/alert/alert`                 | `variant`, `title`, `onClose`            |
| `Badge`         | `ui/badge/badge`                 | `variant`, `size`, `pill`                |
| `Tooltip`       | `ui/tooltip/tooltip`             | `content`, `position`                    |
| `Spinner`       | `ui/spinner/spinner`             | `size`, `variant`                        |
| `NoContentCard` | `ui/noContentCard/noContentCard` | `title`, `description`, `action`, `icon` |
| `Toast`         | `ui/toast/toast`                 | via `useToast()` hook + `ToastProvider`  |

---

## Usage Examples

### Accordion

```typescript
import { Accordion } from '@/shared/components/ui/accordion/accordion';

<Accordion defaultExpanded={['item-1']} allowMultiple>
  <Accordion.Item id="item-1">
    <Accordion.Trigger>Section 1</Accordion.Trigger>
    <Accordion.Content>Content 1</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item id="item-2">
    <Accordion.Trigger>Section 2</Accordion.Trigger>
    <Accordion.Content>Content 2</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Modal

```typescript
import { Modal } from '@/shared/components/ui/modal/modal';
import { Button } from '@/shared/components/ui/button/button';

const [isOpen, setIsOpen] = useState(false);

// Full modal with header + footer
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
  <Modal.Header
    title="Confirm Action"
    showBack={false}
    showClose={true}
    onClose={() => setIsOpen(false)}
  />
  <Modal.Content>
    <p>Are you sure you want to proceed?</p>
  </Modal.Content>
  <Modal.Footer>
    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </Modal.Footer>
</Modal>

// Content-only modal (no header/footer)
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
  <Modal.Content>
    <p>Simple content only...</p>
  </Modal.Content>
</Modal>
```

**Modal sizes:** `sm` | `md` | `lg` | `xl` | `full`
**Modal.Header props:** `title?`, `showBack?`, `showClose?`, `onBack?`, `onClose?`

### Alert

```typescript
import { Alert } from '@/shared/components/ui/alert/alert';

<Alert variant="success" title="Saved!" onClose={() => setVisible(false)}>
  Your changes have been saved successfully.
</Alert>
// variants: info | success | warning | error
```

### Badge

```typescript
import { Badge } from '@/shared/components/ui/badge/badge';

<Badge variant="primary" pill>New</Badge>
<Badge variant="success" size="sm">Active</Badge>
// variants: primary | secondary | success | warning | error | info
```

### Button

```typescript
import { Button } from '@/shared/components/ui/button/button';

<Button variant="primary" size="md" onClick={handleClick}>Save</Button>
<Button variant="outline" loading={isLoading} disabled={isLoading}>Submit</Button>
// variants: primary | secondary | outline | ghost | danger
// sizes: sm | md | lg
```

### Checkbox

```typescript
import { Checkbox } from '@/shared/components/ui/checkbox/checkbox';

<Checkbox
  label="Accept terms and conditions"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>
```

### Dropdown

Use this single component for all selection dropdowns and action menus. Do not create separate searchable selects or page-specific menus.

**Required for paginated APIs:** Use remote mode (`loadOptions` + `queryKey`) and infinite scrolling to load subsequent pages with the API's normal page size. Never use oversized limits such as `limit: 100` or `limit: 200` to avoid pagination, and never eagerly fetch every page into static `items`. Supply an existing selection through `selectedItem`; do not increase the limit to find it. Determine `hasMore` from the API's pagination metadata so every available page remains reachable.

```tsx
import { Dropdown } from '@/shared/components/ui/dropdown/dropdown';

<Dropdown
  label="Assignee"
  items={people}
  selectedItem={assignee}
  onSelect={setAssignee}
/>

<Dropdown
  label="Assignee"
  queryKey={['people', organizationId]}
  loadOptions={async ({ search, page, signal }) => {
    const response = await peopleApi.list({ search, page, signal });
    return { items: response.items, hasMore: response.hasMore };
  }}
  selectedItem={assignee}
  onSelect={setAssignee}
/>

<Dropdown
  mode="action"
  label="Actions"
  searchable={false}
  items={[
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete', destructive: true, dividerBefore: true },
  ]}
  onSelect={handleAction}
/>
```

Items require a stable `id` (string or number) and a text `label`; additional fields are preserved in `onSelect`. Optional flags: `disabled`, `destructive`, `dividerBefore`; optional content: `leftIcon`, `rightIcon`.

- `mode="select"` is the default. `selectedItem` is controlled by the caller and may be null. Action mode does not accept a selection.
- A selection absent from page one is prepended and filtered from subsequent pages. Other duplicate IDs are also removed. A selection present on page one keeps its position. The current selection stays visible during search.
- Search is enabled by default. Static items filter locally. Remote search is debounced by 300 ms, resets to page one and handles composition and stale requests.
- Remote mode requires the existing QueryClientProvider. Include dataset/filter/permission scope in `queryKey`, and pass `signal` to the request. Convert API records to `{ id, label, ... }` in `loadOptions`; map pagination metadata to `hasMore`.
- Infinite scrolling and a keyboard-accessible Load more fallback fetch additional pages. Failure retains loaded options and offers Retry.
- `trigger` is optional non-interactive content inside the component's own button. Do not pass a Button, link or other interactive child. The former `Dropdown.Item`, `Dropdown.Divider` and `Dropdown.Header` API is replaced by items.
- User-visible search, loading, empty, retry and error messages can be supplied through props. Styling uses existing theme variables and SCSS modules.

### FileUpload

```typescript
import { FileUpload } from '@/shared/components/ui/fileUpload/fileUpload';

<FileUpload
  multiple
  maxFiles={5}
  maxSize={5 * 1024 * 1024}  // 5MB
  accept="image/*,.pdf"
  onFilesChange={(files) => setFiles(files)}
/>
```

### Pagination

```typescript
import { Pagination } from '@/shared/components/ui/pagination/pagination';

<Pagination
  currentPage={currentPage}
  totalPages={20}
  onPageChange={(page) => setCurrentPage(page)}
/>
```

### PhoneInput

```typescript
import { PhoneInput } from '@/shared/components/ui/phoneInput/phoneInput';

<PhoneInput
  value={phone}
  onChange={setPhone}
  defaultCountry="US"
  label="Phone Number"
/>
```

### Tabs

```typescript
import { Tabs } from '@/shared/components/ui/tabs/tabs';

<Tabs defaultTab="overview">
  <Tabs.List>
    <Tabs.Tab id="overview">Overview</Tabs.Tab>
    <Tabs.Tab id="details">Details</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="overview">Overview content</Tabs.Panel>
  <Tabs.Panel id="details">Details content</Tabs.Panel>
</Tabs>
```

### TextArea

```typescript
import { TextArea } from '@/shared/components/ui/textArea/textArea';

<TextArea
  label="Description"
  rows={6}
  maxLength={500}
  showCount
  resize="vertical"
  placeholder="Enter description..."
/>
```

### ToggleSwitch

```typescript
import { ToggleSwitch } from '@/shared/components/ui/toggleSwitch/toggleSwitch';

<ToggleSwitch
  label="Enable notifications"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>
```

### Tooltip

```typescript
import { Tooltip } from '@/shared/components/ui/tooltip/tooltip';

<Tooltip content="More information here" position="top">
  <span>Hover me</span>
</Tooltip>
// positions: top | bottom | left | right
```

### NoContentCard

```typescript
import { NoContentCard } from '@/shared/components/ui/noContentCard/noContentCard';
import { Button } from '@/shared/components/ui/button/button';

<NoContentCard
  title="No items found"
  description="Try adjusting your search filters or create a new item."
  action={<Button onClick={handleCreate}>Create Item</Button>}
/>
```

### Spinner

```typescript
import { Spinner } from '@/shared/components/ui/spinner/spinner';

<Spinner size="md" variant="primary" />
// sizes: sm | md | lg | xl
// variants: primary | secondary | white
```

### Toast

```typescript
// 1. Wrap your app with ToastProvider in main.tsx
import { ToastProvider } from '@/shared/components/ui/toast/toast';

<ToastProvider position="top-right">
  <App />
</ToastProvider>

// 2. Use the hook in any child component
import { useToast } from '@/shared/components/ui/toast/toast';

const { addToast } = useToast();

addToast({
  title: 'Success',
  description: 'Your changes have been saved.',
  variant: 'success',   // info | success | warning | error
  duration: 4000,       // ms, optional
});
```

---

## Creating a New Component

Follow this checklist:

1. Create folder: `src/shared/components/ui/yourComponent/` (camelCase)
2. Create `yourComponent.tsx` (max 300–350 lines)
3. Create `yourComponent.module.scss` (co-located styles)
4. Define TypeScript interface for props
5. Use CSS custom properties (`var(--color-*)`) for all colors
6. Add dark mode support via `:global(.dark) &` in SCSS
7. Export the component as a named export (not default)
8. Add to this skills file under the appropriate category
9. Add demo to `src/pages/home/home.tsx` homepage showcase if applicable

### DatePicker and TimePicker — required shared components

Use these wrappers for every date or time entry. Native `<input type="date">`, `<input type="time">`, `<input type="datetime-local">`, equivalent generic Input props, and direct `react-datepicker` imports outside the wrappers are forbidden. Compose the two wrappers when both a date and a time are needed.

```tsx
import { DatePicker } from '@/shared/components/ui/datePicker/datePicker';
import { TimePicker } from '@/shared/components/ui/timePicker/timePicker';

<DatePicker label="Start date" value={date} onChange={setDate} minDate="2026-01-01" />
<TimePicker label="Start time" value={time} onChange={setTime} minTime="09:00" maxTime="17:00" minuteStep={15} />
```

- Values and bounds use `YYYY-MM-DD` or `HH:mm` respectively. `onChange` reports a string or null when cleared. Dates and times have no timezone; resolve any scheduling timezone in the application layer.
- Both support `id`, `name`, `required`, `disabled`, `readOnly`, `error`, `helpText`, `placeholder`, `onBlur`, `clearable`, `clearLabel`, `className` and the package's `locale` prop. `label` is required.
- DatePicker supports independent `minDate` and `maxDate` bounds. TimePicker supports independent same-day `minTime` and `maxTime` bounds, `minuteStep` (default 15, valid integers 1–60), and `timeCaption`.
- Time lists use 24-hour display. Typing permits any valid minute within bounds; `minuteStep` controls the suggested list intervals.
- Styles come from the shared dateTimePicker SCSS module and existing theme variables. Do not create page-specific picker implementations.
