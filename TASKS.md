# Tasks & Migration Log

Tracks all work done across the monorepo (`apps/api` + `apps/web`).
Standalone deployments live in separate repos — see `ecom-node-api` and `ecom-react-web`.

---

## About `sharp` (Image Processing)

`sharp` is a Node.js image processing library powered by **libvips** (a C++ image processing system). It is used in `apps/api/src/image-processing/` to:

- Convert all uploaded images to **WebP** format at quality 85
- Composite text or image watermarks onto images in memory
- Resize watermark images before compositing

**Why it needs compilation:** `sharp` ships a prebuilt native binary for each OS and CPU architecture (macOS ARM, macOS x64, Linux x64, etc.). When you run `npm install`, the correct binary is downloaded automatically — no manual steps needed. However, if you deploy to a server, always run `npm install` on the server itself so the binary matches the server's architecture, not your local machine's.

**Key behaviour:**
- All processing happens in memory — no temp files written to disk
- Non-image files (PDF, video) bypass `sharp` entirely and are stored as-is
- If the watermark image URL is unreachable, the image is still saved as WebP — just without the watermark

---

## Phase 1 — Monorepo Structure ✅

**Status:** Completed — 2026-05-15

### Structure
- `apps/api/` — NestJS API (port 3000), Knex + PostgreSQL, local disk uploads
- `apps/web/` — Next.js storefront + admin panel (port 3001)
- Shared tooling: TypeScript, ESLint, Prettier

---

## Phase 2 — WebP Conversion + Brand Watermark ✅

**Status:** Completed — 2026-05-15

### API (`apps/api`)
- Added `src/image-processing/image-processing.service.ts` using `sharp`
- Converts every uploaded image to WebP at quality 85
- Applies configurable text or image watermark
- Switched multer to `memoryStorage()` — original never touches disk
- 7 watermark settings seeded in `settings` table on startup
- `sharp ^0.33.0` added to `package.json`

### Web (`apps/web`)
- Added Watermark Configuration card to `src/app/admin/settings/page.tsx`
- Fixed `MediaPicker.tsx` and `admin/media/page.tsx` — use `getImageUrl()` instead of `${API_URL}${file.url}` to correctly handle both local and R2 URLs

### Watermark settings

| Key | Default | Description |
|-----|---------|-------------|
| `watermark_enabled` | `false` | Master on/off switch |
| `watermark_type` | `text` | `text` or `image` |
| `watermark_text` | `Your Brand` | Text string for text watermark |
| `watermark_image` | _(empty)_ | URL of PNG/SVG logo for image watermark |
| `watermark_opacity` | `0.5` | Float 0.1–1.0 |
| `watermark_position` | `southeast` | `northwest` / `northeast` / `southwest` / `southeast` / `center` |
| `watermark_size` | `200` | Width in px for image watermark resize |

---

## Backlog

- [ ] Add Swagger/OpenAPI documentation
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add Docker + docker-compose for local dev
- [ ] Move OTP storage from in-memory Map to Redis or DB
- [ ] End-to-end tests (Playwright or Cypress)
