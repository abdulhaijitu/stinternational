# Global Design Token Map

This document defines the single source of truth for spacing, border radius, and colors across the entire project.

## Spacing Tokens (8px System)

All spacing follows the 8px grid system. Use these tokens instead of arbitrary values.

| Token | Value | Tailwind Class | Use Case |
|-------|-------|----------------|----------|
| `--space-1` | 4px | `p-space-1`, `gap-space-1` | Icon gaps, tight elements |
| `--space-2` | 8px | `p-space-2`, `gap-space-2` | Small padding, inline gaps |
| `--space-3` | 12px | `p-space-3`, `gap-space-3` | Form field spacing |
| `--space-4` | 16px | `p-space-4`, `gap-space-4` | Card padding, button padding |
| `--space-5` | 20px | `p-space-5`, `gap-space-5` | Section inner spacing |
| `--space-6` | 24px | `p-space-6`, `gap-space-6` | Section separation |
| `--space-8` | 32px | `p-space-8`, `gap-space-8` | Large section gaps |
| `--space-10` | 40px | `p-space-10`, `gap-space-10` | Page-level blocks |
| `--space-12` | 48px | `p-space-12`, `gap-space-12` | Major section breaks |
| `--space-16` | 64px | `p-space-16`, `gap-space-16` | Page section spacing |

### Usage Examples
```tsx
// Card padding
<div className="p-space-4">...</div>

// Button gap
<div className="flex gap-space-2">...</div>

// Section margin
<section className="mt-space-8">...</section>
```

## Border Radius Tokens

| Token | Value | Tailwind Class | Use Case |
|-------|-------|----------------|----------|
| `--radius-sm` | 4px | `rounded-radius-sm` | Inputs, badges |
| `--radius-md` | 6px | `rounded-radius-md` | Buttons |
| `--radius-lg` | 8px | `rounded-radius-lg` | Cards |
| `--radius-xl` | 12px | `rounded-radius-xl` | Modals, drawers |
| `--radius-2xl` | 16px | `rounded-radius-2xl` | Large containers |
| `--radius-full` | 9999px | `rounded-radius-full` | Pills, circular buttons |

### Usage Examples
```tsx
// Button
<button className="rounded-radius-md">...</button>

// Card
<div className="rounded-radius-lg">...</div>

// Modal
<Dialog className="rounded-radius-xl">...</Dialog>
```

## Color Tokens

### Primary (Brand)
| Token | Tailwind Class | Use Case |
|-------|----------------|----------|
| `--primary` | `bg-primary`, `text-primary` | CTAs, links, highlights |
| `--primary-foreground` | `text-primary-foreground` | Text on primary background |

### Secondary (Neutral)
| Token | Tailwind Class | Use Case |
|-------|----------------|----------|
| `--secondary` | `bg-secondary`, `text-secondary` | Neutral backgrounds |
| `--secondary-foreground` | `text-secondary-foreground` | Dark text on neutral |

### Status Colors
| Token | Tailwind Class | Use Case |
|-------|----------------|----------|
| `--success` | `bg-success`, `text-success` | Success, active states |
| `--warning` | `bg-warning`, `text-warning` | Pending, attention |
| `--destructive` | `bg-destructive`, `text-destructive` | Error, danger, delete |
| `--info` | `bg-info`, `text-info` | Information, help |
| `--muted` | `bg-muted`, `text-muted-foreground` | Disabled, helper text |

### Accent Colors (Limited Use - B2B Enterprise)
| Token | Tailwind Class | Use Case |
|-------|----------------|----------|
| `--accent-blue` | `text-accent-blue`, `bg-accent-blue` | Measurement / tech |
| `--accent-teal` | `text-accent-teal`, `bg-accent-teal` | Health / safety |
| `--accent-amber` | `text-accent-amber`, `bg-accent-amber` | Lab / education |

⚠️ **Important**: Accent colors should be used sparingly. Red is ONLY for destructive/error states.

## Enforcement Rules

### ✅ DO
- Use spacing tokens for all padding, margin, and gap values
- Use radius tokens for all border-radius values
- Use semantic color tokens (primary, secondary, etc.)
- Apply same tokens to both frontend and admin panel

### ❌ DON'T
- Use arbitrary spacing values (`p-[17px]`, `m-[23px]`)
- Use arbitrary radius values (`rounded-[7px]`)
- Use random colors outside the token system
- Mix different design patterns between frontend and admin

## Migration Guide

### Before
```tsx
<div className="p-4 rounded-lg bg-orange-500">
  <button className="px-6 py-2 rounded-md">Save</button>
</div>
```

### After
```tsx
<div className="p-space-4 rounded-radius-lg bg-primary">
  <button className="px-space-6 py-space-2 rounded-radius-md">Save</button>
</div>
```

## Files Modified

- `src/index.css` - CSS custom properties (source of truth)
- `tailwind.config.ts` - Tailwind token configuration
- All component files should consume these tokens

## Quality Checklist

- [ ] No inline hardcoded spacing values
- [ ] No inconsistent radius usage
- [ ] No random colors outside token system
- [ ] UI feels unified and intentional
- [ ] Same tokens used in frontend + admin
- [ ] Sufficient contrast (AA minimum)
- [ ] Works across mobile, tablet, desktop
