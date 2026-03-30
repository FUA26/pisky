# Brand Design System

**Version**: 1.0.0
**Style**: Modern
**Primary**: #1B53D9 (Blue)
**Secondary**: #E07A5F (Coral)

---

## Design Tokens

```json
{
  "meta": {
    "version": "1.0.0",
    "style": "modern",
    "generated": "auto-generated"
  },
  "colors": {
    "primary": {
      "50": "#e8f0fe",
      "100": "#d2e1fc",
      "200": "#a6c4f8",
      "300": "#7aa7f4",
      "400": "#4e89f0",
      "500": "#1b53d9",
      "600": "#1644b3",
      "700": "#11358c",
      "800": "#0d2666",
      "900": "#081840",
      "DEFAULT": "#1b53d9"
    },
    "secondary": {
      "50": "#fef6f4",
      "100": "#fce9e4",
      "200": "#f8d3c9",
      "300": "#f0a08f",
      "400": "#e07a5f",
      "500": "#d45d4a",
      "600": "#b8463e",
      "700": "#923635",
      "800": "#722f33",
      "900": "#5a2b31",
      "DEFAULT": "#e07a5f"
    },
    "neutral": {
      "50": "#F9FAFB",
      "100": "#F3F4F6",
      "200": "#E5E7EB",
      "300": "#D1D5DB",
      "400": "#9CA3AF",
      "500": "#6B7280",
      "600": "#4B5563",
      "700": "#374151",
      "800": "#1F2937",
      "900": "#111827",
      "DEFAULT": "#6B7280"
    },
    "semantic": {
      "success": {
        "base": "#10B981",
        "light": "#34D399",
        "dark": "#059669",
        "contrast": "#FFFFFF"
      },
      "warning": {
        "base": "#F59E0B",
        "light": "#FCD34D",
        "dark": "#D97706",
        "contrast": "#FFFFFF"
      },
      "error": {
        "base": "#EF4444",
        "light": "#F87171",
        "dark": "#DC2626",
        "contrast": "#FFFFFF"
      },
      "info": {
        "base": "#3B82F6",
        "light": "#60A5FA",
        "dark": "#2563EB",
        "contrast": "#FFFFFF"
      }
    },
    "surface": {
      "background": "#FFFFFF",
      "foreground": "#111827",
      "card": "#FFFFFF",
      "overlay": "rgba(0, 0, 0, 0.5)",
      "divider": "#E5E7EB"
    }
  },
  "typography": {
    "fontFamily": {
      "sans": "Inter, system-ui, -apple-system, sans-serif",
      "serif": "Merriweather, Georgia, serif",
      "mono": "Fira Code, Monaco, monospace"
    },
    "fontSize": {
      "xs": "10px",
      "sm": "13px",
      "base": "16px",
      "lg": "20px",
      "xl": "25px",
      "2xl": "31px",
      "3xl": "39px",
      "4xl": "49px",
      "5xl": "61px"
    },
    "fontWeight": {
      "thin": 100,
      "light": 300,
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700,
      "extrabold": 800,
      "black": 900
    },
    "lineHeight": {
      "none": 1,
      "tight": 1.25,
      "snug": 1.375,
      "normal": 1.5,
      "relaxed": 1.625,
      "loose": 2
    },
    "letterSpacing": {
      "tighter": "-0.05em",
      "tight": "-0.025em",
      "normal": "0",
      "wide": "0.025em",
      "wider": "0.05em",
      "widest": "0.1em"
    },
    "textStyles": {
      "h1": {
        "fontSize": "48px",
        "fontWeight": 700,
        "lineHeight": 1.2,
        "letterSpacing": "-0.02em"
      },
      "h2": {
        "fontSize": "36px",
        "fontWeight": 700,
        "lineHeight": 1.3,
        "letterSpacing": "-0.01em"
      },
      "h3": {
        "fontSize": "28px",
        "fontWeight": 600,
        "lineHeight": 1.4,
        "letterSpacing": "0"
      },
      "h4": {
        "fontSize": "24px",
        "fontWeight": 600,
        "lineHeight": 1.4,
        "letterSpacing": "0"
      },
      "h5": {
        "fontSize": "20px",
        "fontWeight": 600,
        "lineHeight": 1.5,
        "letterSpacing": "0"
      },
      "h6": {
        "fontSize": "16px",
        "fontWeight": 600,
        "lineHeight": 1.5,
        "letterSpacing": "0.01em"
      },
      "body": {
        "fontSize": "16px",
        "fontWeight": 400,
        "lineHeight": 1.5,
        "letterSpacing": "0"
      },
      "small": {
        "fontSize": "14px",
        "fontWeight": 400,
        "lineHeight": 1.5,
        "letterSpacing": "0"
      },
      "caption": {
        "fontSize": "12px",
        "fontWeight": 400,
        "lineHeight": 1.5,
        "letterSpacing": "0.01em"
      }
    }
  },
  "spacing": {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "7": "32px",
    "8": "40px",
    "9": "48px",
    "10": "56px",
    "11": "64px",
    "12": "72px",
    "13": "80px",
    "14": "96px",
    "15": "112px",
    "16": "128px",
    "17": "160px",
    "18": "192px",
    "19": "256px",
    "20": "320px",
    "21": "384px",
    "22": "448px",
    "23": "512px",
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "40px",
    "2xl": "72px",
    "3xl": "128px"
  },
  "sizing": {
    "container": {
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px"
    },
    "components": {
      "button": {
        "sm": {
          "height": "32px",
          "paddingX": "12px"
        },
        "md": {
          "height": "40px",
          "paddingX": "16px"
        },
        "lg": {
          "height": "48px",
          "paddingX": "20px"
        }
      },
      "input": {
        "sm": {
          "height": "32px",
          "paddingX": "12px"
        },
        "md": {
          "height": "40px",
          "paddingX": "16px"
        },
        "lg": {
          "height": "48px",
          "paddingX": "20px"
        }
      },
      "icon": {
        "sm": "16px",
        "md": "20px",
        "lg": "24px",
        "xl": "32px"
      }
    }
  },
  "borders": {
    "radius": {
      "none": "0",
      "sm": "4px",
      "DEFAULT": "8px",
      "md": "12px",
      "lg": "16px",
      "xl": "24px",
      "full": "9999px"
    },
    "width": {
      "none": "0",
      "thin": "1px",
      "DEFAULT": "1px",
      "medium": "2px",
      "thick": "4px"
    }
  },
  "shadows": {
    "none": "none",
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "DEFAULT": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)"
  },
  "animation": {
    "duration": {
      "instant": "0ms",
      "fast": "150ms",
      "DEFAULT": "250ms",
      "slow": "350ms",
      "slower": "500ms"
    },
    "easing": {
      "linear": "linear",
      "ease": "ease",
      "easeIn": "ease-in",
      "easeOut": "ease-out",
      "easeInOut": "ease-in-out",
      "spring": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    },
    "keyframes": {
      "fadeIn": {
        "from": {
          "opacity": 0
        },
        "to": {
          "opacity": 1
        }
      },
      "slideUp": {
        "from": {
          "transform": "translateY(10px)",
          "opacity": 0
        },
        "to": {
          "transform": "translateY(0)",
          "opacity": 1
        }
      },
      "scale": {
        "from": {
          "transform": "scale(0.95)"
        },
        "to": {
          "transform": "scale(1)"
        }
      }
    }
  },
  "breakpoints": {
    "xs": "480px",
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1536px"
  },
  "z-index": {
    "hide": -1,
    "base": 0,
    "dropdown": 1000,
    "sticky": 1020,
    "overlay": 1030,
    "modal": 1040,
    "popover": 1050,
    "tooltip": 1060,
    "notification": 1070
  }
}
```

---

## Color Palette Preview

### Primary (Blue)
```
50   100  200  300  400  500  600  700  800  900
🔷  📘  🟦  🔵  🟦  🟦  🔹  🔹  🥎  🎱
```

| Step | Hex | Usage |
|------|-----|-------|
| 50 | `#e8f0fe` | Light backgrounds |
| 100 | `#d2e1fc` | Subtle backgrounds |
| 200 | `#a6c4f8` | Hover states |
| 300 | `#7aa7f4` | Active states |
| 400 | `#4e89f0` | Links, highlights |
| **500** | **`#1b53d9`** | **Primary brand** |
| 600 | `#1644b3` | Darker primary |
| 700 | `#11358c` | Dark mode primary |
| 800 | `#0d2666` | Deep backgrounds |
| 900 | `#081840` | Deepest backgrounds |

### Secondary (Coral)
```
50   100  200  300  400  500  600  700  800  900
🌸  🌸  🌺  🌺  🟥  🧱  🧱  🧱  🧱  🧱
```

| Step | Hex | Usage |
|------|-----|-------|
| 50 | `#fef6f4` | Light tint backgrounds |
| 100 | `#fce9e4` | Subtle coral tint |
| 200 | `#f8d3c9` | Light coral backgrounds |
| 300 | `#f0a08f` | Soft coral accents |
| 400 | `#e07a5f` | Secondary brand |
| **500** | **`#d45d4a`** | **Secondary action** |
| 600 | `#b8463e` | Darker secondary |
| 700 | `#923635` | Dark mode secondary |
| 800 | `#722f33` | Deep secondary |
| 900 | `#5a2b31` | Deepest secondary |

### Color Harmony

- **Primary Blue** (#1B53D9) - Trust, professionalism, stability
- **Secondary Coral** (#E07A5F) - Warmth, energy, creativity
- **Combination** - Sophisticated contrast, modern tech aesthetic

---

## Token Overview

| Category | Count |
|----------|-------|
| Colors | Primary (11), Secondary (11), Neutral (11), Semantic (4), Surface (5) |
| Typography | 3 fonts, 9 sizes, 8 weights, 6 line-heights, 5 spacing, 9 text styles |
| Spacing | 24 values (8pt grid) |
| Borders | 7 radius, 5 width |
| Shadows | 8 modern styles |
| Animation | 5 durations, 6 easings, 3 keyframes |
| Breakpoints | 6 responsive sizes |
| Z-Index | 9 depth layers |

---

*Generated by UI Design System Toolkit*
