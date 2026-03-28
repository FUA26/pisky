# 🎨 Design System - Brand Color Guide

## Customizing Brand Colors

All brand colors are defined in **`src/app/globals.css`** at the top of the `:root` block. Simply update the hex values to match your project's brand identity.

### Brand Identity Colors

```css
:root {
  /* Main brand color - Ubah sesuai brand Anda */
  --color-primary: #f59e0b;        /* Gold/Amber */
  --color-primary-hover: #d97706;  /* Darker shade untuk hover */
  --color-primary-active: #b45309; /* Even darker untuk active */
  --color-primary-light: #fffbeb;   /* Light untuk backgrounds */

  /* Secondary brand color */
  --color-secondary: #d97706;
  --color-secondary-hover: #b45309;

  /* Accent color */
  --color-accent: #fbbf24;

  /* Focus rings */
  --color-ring: #f59e0b;
}
```

### Cara Ganti Warna Brand

**Contoh 1: Brand Biru (Blue)**
```css
:root {
  --color-primary: #3b82f6;        /* Blue 500 */
  --color-primary-hover: #2563eb;  /* Blue 600 */
  --color-primary-active: #1d4ed8; /* Blue 700 */
  --color-primary-light: #eff6ff;   /* Blue 50 */

  --color-secondary: #2563eb;
  --color-secondary-hover: #1d4ed8;
  --color-accent: #60a5fa;
  --color-ring: #3b82f6;
}
```

**Contoh 2: Brand Ungu (Purple)**
```css
:root {
  --color-primary: #8b5cf6;        /* Violet 500 */
  --color-primary-hover: #7c3aed;  /* Violet 600 */
  --color-primary-active: #6d28d9; /* Violet 700 */
  --color-primary-light: #f5f3ff;   /* Violet 50 */

  --color-secondary: #7c3aed;
  --color-secondary-hover: #6d28d9;
  --color-accent: #a78bfa;
  --color-ring: #8b5cf6;
}
```

**Contoh 3: Brand Merah (Red)**
```css
:root {
  --color-primary: #ef4444;        /* Red 500 */
  --color-primary-hover: #dc2626;  /* Red 600 */
  --color-primary-active: #b91c1c; /* Red 700 */
  --color-primary-light: #fef2f2;   /* Red 50 */

  --color-secondary: #dc2626;
  --color-secondary-hover: #b91c1c;
  --color-accent: #f87171;
  --color-ring: #ef4444;
}
```

### Dark Mode

Dark mode **otomatis mengadaptasi** warna light shade untuk dark mode. Tidak perlu konfigurasi manual - cukup ubah warna di `:root` dan dark mode akan otomatis menggunakan `--color-primary-light-dark`.

### Penggunaan di Komponen

Setelah mengubah warna di `globals.css`, **semua komponen otomatis berubah**:

```tsx
<Button>Click Me</Button>              // Menggunakan --color-primary
<Button variant="secondary">Cancel</Button>  // Menggunakan --color-secondary
<Badge>New</Badge>                     // Menggunakan --color-primary
```

### Keuntungan Pendekatan Ini

✅ **Mudah diganti** - Ubah di satu tempat (`globals.css`)
✅ **Semantic names** - Pakai `bg-primary`, `text-primary`, bukan `bg-amber-500`
✅ **Dark mode support** - Otomatis adapt untuk dark mode
✅ **Hover & Active states** - Terdefinisi dengan proper shades
✅ **Focus rings** - Warna focus otomatis mengikuti primary color

### Komponen yang Menggunakan Brand Colors

- **Buttons**: Default, secondary, outline, ghost, link variants
- **Badges**: Default, secondary, success variants
- **Links**: Text links
- **Focus states**: Input, button, dan interactive elements
- **Hover states**: Background hover pada tombol dan links
- **Selection**: Text selection color
- **Gradients**: Subtle background gradient

---

**Pro Tip**: Cukup update hex values di `:root` block, dan seluruh aplikasi akan otomatis menggunakan brand colors baru! 🎨
