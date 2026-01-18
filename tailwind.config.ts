import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      /* 
       * SPACING TOKENS (8px System)
       * Usage: gap-space-2, p-space-4, m-space-6, etc.
       */
      spacing: {
        'space-1': 'var(--space-1)',   // 4px
        'space-2': 'var(--space-2)',   // 8px
        'space-3': 'var(--space-3)',   // 12px
        'space-4': 'var(--space-4)',   // 16px
        'space-5': 'var(--space-5)',   // 20px
        'space-6': 'var(--space-6)',   // 24px
        'space-8': 'var(--space-8)',   // 32px
        'space-10': 'var(--space-10)', // 40px
        'space-12': 'var(--space-12)', // 48px
        'space-16': 'var(--space-16)', // 64px
      },
      fontFamily: {
        sans: [
          'Roboto',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif'
        ],
        serif: [
          'Libre Caslon Text',
          'ui-serif',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'Times',
          'serif'
        ],
        mono: [
          'Roboto Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace'
        ]
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          // B2B Enterprise Accent Colors
          blue: 'hsl(var(--accent-blue))',
          teal: 'hsl(var(--accent-teal))',
          amber: 'hsl(var(--accent-amber))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))'
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      /* 
       * BORDER RADIUS TOKENS
       * Usage: rounded-radius-sm, rounded-radius-lg, etc.
       */
      borderRadius: {
        'radius-sm': 'var(--radius-sm)',   // 4px - inputs, badges
        'radius-md': 'var(--radius-md)',   // 6px - buttons
        'radius-lg': 'var(--radius-lg)',   // 8px - cards
        'radius-xl': 'var(--radius-xl)',   // 12px - modals, drawers
        'radius-2xl': 'var(--radius-2xl)', // 16px - large containers
        'radius-full': 'var(--radius-full)', // full - pills, circular
        // Legacy (for shadcn compatibility)
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        'card-hover': 'var(--shadow-card-hover)',
        '2xs': 'var(--shadow-2xs)',
        xs: 'var(--shadow-xs)',
        '2xl': 'var(--shadow-2xl)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'fade-in': {
          from: {
            opacity: '0'
          },
          to: {
            opacity: '1'
          }
        },
        'fade-up': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'slide-in-right': {
          from: {
            opacity: '0',
            transform: 'translateX(10px)'
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-up': 'fade-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
