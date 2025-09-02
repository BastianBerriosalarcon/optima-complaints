import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Colores específicos del dominio OptimaCX
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        info: "hsl(var(--info))",
        // Colores para scoring de leads
        lead: {
          hot: "hsl(var(--lead-hot))",
          warm: "hsl(var(--lead-warm))",
          cold: "hsl(var(--lead-cold))",
        },
        // Colores para estados de reclamos
        complaint: {
          urgent: "hsl(var(--complaint-urgent))",
          medium: "hsl(var(--complaint-medium))",
          low: "hsl(var(--complaint-low))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "var(--border-radius-card)",
        button: "var(--border-radius-button)",
      },
      spacing: {
        'dashboard': 'var(--dashboard-padding)',
        'card': 'var(--card-padding)',
      },
      height: {
        'stat-card': 'var(--stat-card-height)',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-success": {
          "0%, 100%": { backgroundColor: "hsl(var(--success))" },
          "50%": { backgroundColor: "hsl(var(--success) / 0.8)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-success": "pulse-success 2s ease-in-out infinite",
      },
      // Utilidades específicas para OptimaCX
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'metric-value': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'metric-label': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Plugin personalizado para utilidades de OptimaCX
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.dashboard-grid': {
          display: 'grid',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          gap: '1.5rem',
          '@media (min-width: 768px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          },
          '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          },
        },
        '.stat-card': {
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid rgb(229 231 235)',
          minHeight: 'var(--stat-card-height)',
        },
        '.status-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          paddingLeft: '0.625rem',
          paddingRight: '0.625rem',
          paddingTop: '0.125rem',
          paddingBottom: '0.125rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

export default config