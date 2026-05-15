# SocialCanvas — Editor Visual IA para Instagram

Editor visual completo para crear contenido de Instagram: carruseles, posts estáticos y reels con IA.

## Stack
- **Frontend**: React 18 + Vite 5 + TailwindCSS 3
- **Canvas**: Fabric.js 7
- **Auth & DB**: Supabase
- **Estado**: Zustand (persistido en localStorage)
- **i18n**: i18next (ES/EN)
- **Deploy**: GitHub Pages via `gh-pages`

## Funcionalidades

### Editor Visual
- Formatos: 1:1 · 4:5 · 9:16 · 16:9 (resolución real 1080px+)
- Texto: fuente, tamaño, peso, color, alineación, espaciado
- Imágenes: local, URL, IA generada
- Capas, carrusel multi-slide, export PNG/JPG/PDF

### IA — Imágenes
| Proveedor | Tipo |
|---|---|
| Stability AI (SDXL) | Fotorrealista |
| Google Imagen 3 | Hiperrealista |
| Unsplash | Banco real |
| Midjourney (proxy) | Artístico |

### IA — Video / Reels
| Proveedor | Duración |
|---|---|
| RunwayML Gen-3 | 4–16s |
| Higgsfield AI | 4s |

### API Keys propias
Panel para generar keys `sc_...` con docs tipo Swagger integrados.

## Deploy en GitHub Pages

```bash
npm install
# Edita vite.config.js: cambia base a '/<tu-repo>/'
npm run deploy
```

## Setup Supabase

1. Crea proyecto en supabase.com
2. Ve a Configuración → Supabase en la app y pega URL + anon key
3. Ejecuta el SQL del panel de Configuración

> Todas las API keys se guardan SOLO en el navegador. Ninguna key queda en el código.

## Desarrollo

```bash
npm run dev      # Desarrollo
npm run build    # Build
npm run deploy   # Deploy GH Pages
```

## Licencia: MIT
