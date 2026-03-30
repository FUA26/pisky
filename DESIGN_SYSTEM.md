# Pisky Design System

An Attio-inspired UI component library built with Radix UI primitives, Tailwind CSS 4, and Next.js 16. This design system provides a refined, sophisticated aesthetic perfect for modern web applications.

## 🎨 Design Philosophy

This design system features a sophisticated color palette focusing on:
- **Primary Blue (#1B53D9)** - Trust, professionalism, and stability
- **Secondary Coral (#E07A5F)** - Warmth, energy, and creative contrast
- **Premium typography** - Geist Sans font family for excellent readability
- **Subtle animations** - Purposeful transitions with proper timing functions
- **Attention to detail** - Refined shadows, borders, and spacing
- **Accessibility** - WCAG AA compliant with proper focus states

## 🚀 Getting Started

### Installation

All dependencies are already included in your project:
- `@radix-ui/react-*` - Unstyled, accessible component primitives
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Component variant management
- `next/font` - Optimized font loading

### Basic Usage

```tsx
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello World</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## 🎯 Components

### Button

Interactive buttons with multiple variants and sizes.

```tsx
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button size="lg">Large</Button>
```

**Variants:**
- `default` - Primary action button with blue background
- `secondary` - Softer secondary button
- `outline` - Outlined button with transparent background
- `ghost` - Minimal ghost button
- `subtle` - Extra subtle variant
- `link` - Link-style button
- `destructive` - Red destructive action

**Sizes:** `sm`, `default` (md), `lg`, `icon`

### Input

Clean input fields with refined focus states.

```tsx
<Input placeholder="Enter text..." />
<Input disabled placeholder="Disabled" />
```

Features:
- Smooth focus ring animation
- Border color transition on hover
- Disabled state styling
- Integrated label support via `Label` component

### Textarea

Multi-line text input with resize support.

```tsx
<Textarea placeholder="Enter message..." rows={4} />
```

### Label

Accessible form labels with proper association.

```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### Badge

Status and label badges with semantic colors.

```tsx
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

**Variants:**
- `default` - Primary blue badge
- `secondary` - Gray badge
- `success` - Green success badge
- `warning` - Orange/amber warning badge
- `destructive` - Red error badge
- `outline` - Outlined badge

### Card

Versatile container component with subtle shadows.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Subcomponents:**
- `Card` - Main container with shadow and border
- `CardHeader` - Header section with title and description
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section for actions

## 🎨 Theme System

The design system includes comprehensive theming support:

### CSS Variables

All colors and design tokens are available as CSS custom properties:

```css
/* Colors */
--color-background
--color-foreground
--color-primary
--color-secondary
--color-accent
--color-muted
--color-border
--color-ring

/* Semantic Colors */
--color-destructive
--color-success
--color-warning

/* Effects */
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl

/* Border Radius */
--radius-sm
--radius-md
--radius-lg
--radius-xl
```

### Dark Mode

Built-in dark mode support with optimized colors for both themes. Toggle via the `ThemeToggle` component or system preference.

```tsx
import { ThemeProvider } from "@/shared/components/theme-provider";

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <App />
</ThemeProvider>
```

## ✨ Features

### Typography

- **Font Family:** Geist Sans (optimized for UI)
- **Fallbacks:** System UI fonts for performance
- **Features:** Proper font-feature-settings for improved rendering

### Animations

Purposeful transitions with smooth timing:
- Fade in/out effects
- Slide animations
- Scale transitions
- Hover state animations

```tsx
<div className="animate-fade-in">...</div>
<div className="transition-smooth">...</div>
```

### Utility Classes

Additional utility classes for common patterns:

```tsx
<div className="glass">Glass morphism effect</div>
<div className="gradient-subtle">Subtle gradient background</div>
<div className="text-gradient">Gradient text</div>
```

## 🧩 Customization

### Modifying Colors

Edit `src/app/globals.css` to customize the color palette:

```css
:root {
  --color-primary: 200 100% 47%; /* HSL values */
  /* ... other colors */
}
```

### Component Styling

Components use `class-variance-authority` for easy customization:

```tsx
import { buttonVariants } from "@/shared/components/ui/button";

// Extend with custom styles
<button className={buttonVariants({ variant: "default" }) + " custom-class"}>
  Custom Button
</button>
```

### Tailwind Config

Extend the design system in `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      // Add custom colors
      brand: "hsl(var(--color-brand))",
    },
  },
}
```

## 📁 File Structure

```
src/
├── app/
│   ├── globals.css          # Theme variables and global styles
│   ├── layout.tsx            # Root layout with font setup
│   └── page.tsx              # Design system showcase
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── textarea.tsx
│   │   └── layout/
│   ├── config/
│   │   └── fonts.ts         # Font configuration
│   └── utils/
│       └── cn.ts            # className utility
└── tailwind.config.ts       # Tailwind configuration
```

## 🎯 Best Practices

1. **Use semantic variants** - Choose appropriate button/badge variants for actions
2. **Maintain consistency** - Use built-in spacing and color tokens
3. **Accessibility first** - All components include proper ARIA attributes
4. **Responsive design** - Use Tailwind's responsive utilities
5. **Dark mode ready** - Test your components in both themes

## 🚧 Roadmap

Future components to add:
- [ ] Select/Dropdown
- [ ] Dialog/Modal
- [ ] Tabs
- [ ] Table
- [ ] Avatar
- [ ] Tooltip
- [ ] Toast/Notification
- [ ] Progress indicators
- [ ] Skeleton loaders
- [ ] Command palette

## 📚 Resources

- [Radix UI](https://www.radix-ui.com/) - Component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Next.js](https://nextjs.org/) - React framework
- [Class Variance Authority](https://cva.style/) - Variant management

## 📝 License

This design system is part of your project boilerplate.

---

Built with ❤️ using Next.js 16, Tailwind CSS 4, and Radix UI.
Inspired by [Attio](https://attio.com)'s refined design aesthetic.
