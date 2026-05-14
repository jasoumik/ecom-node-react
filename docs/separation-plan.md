# Ecom Project — Separation & Cloud Storage Migration Plan

## Overview

Three sequential phases:

1. **Phase 1** — Separate monorepo into standalone backend and frontend repos
2. **Phase 2** — Migrate file storage from local disk to Cloudflare R2
3. **Phase 3** — Migrate existing uploaded files from server to Cloudflare R2

---

## Phase 1 — Monorepo Separation

### Goal
Two independent, deployable repositories:
- `ecom-api` — NestJS backend
- `ecom-web` — Next.js frontend (storefront)

Admin app (`apps/admin`) stays in the monorepo or gets its own repo later — defer this decision.

---

### Step 1.1 — Create `ecom-api` repo from `apps/api`

**Actions:**
1. Create new GitHub repo: `ecom-api`
2. Copy `apps/api/` contents into the new repo root
3. Update `package.json`:
   - Remove any workspace (`@repo/*`) references
   - Ensure all scripts work standalone: `dev`, `build`, `start`, `test`
4. Create standalone `.env.example`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=ecom
   DB_USERNAME=ecom_user
   DB_PASSWORD=
   JWT_SECRET=
   MAIL_HOST=
   MAIL_USER=
   MAIL_PASS=
   ```
5. Fix hardcoded `JWT_SECRET` in `auth.module.ts` → use `process.env.JWT_SECRET`
6. Add CORS config in `main.ts` to allow frontend domain:
   ```typescript
   app.enableCors({
     origin: process.env.FRONTEND_URL,
     credentials: true,
   });
   ```
7. Remove Turbo/pnpm workspace references from `tsconfig.json` if any
8. Verify `npm run build` and `npm run start:prod` work cleanly
9. Add `.gitignore` (node_modules, dist, .env, uploads/)
10. Initial commit and push

**Acceptance criteria:**
- [ ] `npm run dev` starts NestJS on port 3000
- [ ] `npm run build` produces `/dist` without errors
- [ ] All 138 API endpoints respond correctly
- [ ] JWT auth works with env-based secret

**Estimated time: 4–6 hours**

---

### Step 1.2 — Create `ecom-web` repo from `apps/web`

**Actions:**
1. Create new GitHub repo: `ecom-web`
2. Copy `apps/web/` contents into the new repo root
3. Handle `@repo/ui` shared package dependency — two options:

   **Option A (Recommended for now): Inline components**
   - Copy `packages/ui/src/` components directly into `src/components/ui/`
   - Replace all `import { X } from "@repo/ui"` with `import { X } from "@/components/ui"`
   - Run find/replace across all files

   **Option B (Long-term clean): Publish as npm package**
   - Publish `@repo/ui` to npm or GitHub Packages
   - Update imports to use published package
   - Add to CI pipeline

4. Update `tsconfig.json` — remove `@repo/ui` path alias, ensure `@/*` maps to `./src/*`
5. Create `.env.local.example`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```
6. Verify `npm run build` passes with no missing import errors
7. Initial commit and push

**Acceptance criteria:**
- [ ] `npm run dev` starts Next.js with no import errors
- [ ] All 79 routes load correctly
- [ ] Images render (getImageUrl resolves against NEXT_PUBLIC_API_URL)
- [ ] Auth flow (login, OTP) works against local API

**Estimated time: 4–6 hours**

---

### Step 1.3 — Update local dev workflow

**Actions:**
1. Run both repos side by side in development:
   ```bash
   # Terminal 1 — API
   cd ecom-api && npm run dev

   # Terminal 2 — Frontend
   cd ecom-web && npm run dev
   ```
2. Confirm `NEXT_PUBLIC_API_URL=http://localhost:3000/api` connects correctly
3. Test full user flow: browse products → add to cart → checkout → order

**Estimated time: 1–2 hours**

---

### Phase 1 Total Estimate: 1–2 days

---

## Phase 2 — Cloudflare R2 Integration (New Uploads)

### Goal
All new file uploads go to Cloudflare R2. Existing files stay on disk until Phase 3.

---

### Step 2.1 — Set up Cloudflare R2 bucket

**Actions:**
1. Log in to Cloudflare dashboard → R2 → Create bucket: `ecom-media`
2. Set bucket access: **Public** (for direct image URL access)
3. (Optional but recommended) Add custom domain: `cdn.yourdomain.com` → bucket
4. Generate R2 API credentials:
   - Go to R2 → Manage R2 API Tokens
   - Create token with **Object Read & Write** permissions
   - Copy: Account ID, Access Key ID, Secret Access Key
5. Note your public bucket URL: `https://pub-xxx.r2.dev` or custom domain

---

### Step 2.2 — Install AWS S3 SDK in `ecom-api`

```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

R2 is S3-compatible — same SDK, different endpoint.

---

### Step 2.3 — Add R2 environment variables

Add to `.env`:
```env
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_BUCKET=ecom-media
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_REGION=auto
S3_PUBLIC_URL=https://cdn.yourdomain.com
```

---

### Step 2.4 — Create `StorageService`

Create `src/storage/storage.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { randomBytes } from 'crypto';
import { extname } from 'path';

@Injectable()
export class StorageService {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
    this.bucket = process.env.S3_BUCKET;
    this.publicUrl = process.env.S3_PUBLIC_URL;
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const key = `${randomBytes(16).toString('hex')}${extname(file.originalname)}`;

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    await upload.done();
    return `${this.publicUrl}/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = url.replace(`${this.publicUrl}/`, '');
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }
}
```

Create `src/storage/storage.module.ts`:
```typescript
import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
```

Register `StorageModule` in `app.module.ts`.

---

### Step 2.5 — Update `MediaModule` to use R2

**`media.module.ts`** — switch multer to memory storage:
```typescript
MulterModule.register({ storage: memoryStorage() })
```

**`media.controller.ts`** — inject `StorageService`, replace disk save:
```typescript
constructor(
  private readonly mediaService: MediaService,
  private readonly storageService: StorageService,
) {}

@Post('upload')
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Body() body: UploadFileDto,
) {
  const url = await this.storageService.upload(file);
  return this.mediaService.saveFile(file, url, body.folder_id);
}
```

**`media.service.ts`** — `saveFile()` now receives full R2 URL instead of building `/uploads/` path. Remove the `/uploads/${file.filename}` line.

**`media.controller.ts` delete endpoint** — call `storageService.delete(file.url)` before removing DB record.

---

### Step 2.6 — Remove `ServeStaticModule`

In `app.module.ts`, remove:
```typescript
ServeStaticModule.forRoot({
  rootPath: join(process.cwd(), 'uploads'),
  serveRoot: '/uploads',
})
```

Remove `@nestjs/serve-static` from dependencies once existing files are migrated (Phase 3). Keep it until then so old `/uploads/` URLs still work.

---

### Step 2.7 — Test new upload flow

1. Upload a file via the media picker in the admin
2. Verify the returned URL is `https://cdn.yourdomain.com/abc123.jpg`
3. Verify the image displays in the frontend
4. Verify the file appears in the R2 bucket in Cloudflare dashboard
5. Delete the file — verify it's removed from R2

**Acceptance criteria:**
- [ ] New uploads return full R2 URL
- [ ] Images render in frontend via R2 URL
- [ ] Delete removes file from R2 bucket
- [ ] Old `/uploads/` files still serve (ServeStaticModule still active)

**Phase 2 Total Estimate: 6–8 hours**

---

## Phase 3 — Migrate Existing Files to Cloudflare R2

### Goal
Move all existing files from server `/uploads/` directory to R2 and update all database references.

> **Do this on a maintenance window or low-traffic period. Back up the database before running any SQL.**

---

### Step 3.1 — Install AWS CLI (on the server)

```bash
# On the API server
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install
```

Configure for R2:
```bash
aws configure set aws_access_key_id YOUR_ACCESS_KEY
aws configure set aws_secret_access_key YOUR_SECRET_KEY
aws configure set default.region auto
```

---

### Step 3.2 — Sync `/uploads/` to R2 bucket

```bash
aws s3 sync ./uploads/ s3://ecom-media/ \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --no-sign-request
```

Verify file count matches:
```bash
# Local count
ls uploads/ | wc -l

# R2 count (via AWS CLI)
aws s3 ls s3://ecom-media/ \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --recursive | wc -l
```

---

### Step 3.3 — Update database URLs

**Back up first:**
```bash
pg_dump -U ecom_user ecom > backup_before_migration.sql
```

**Run SQL migration** — replace all `/uploads/` paths with full R2 URL:

```sql
-- Set your R2 public URL
DO $$
DECLARE
  r2_url TEXT := 'https://cdn.yourdomain.com';
BEGIN

  -- media_files table (source of truth)
  UPDATE media_files
  SET url = r2_url || REPLACE(url, '/uploads', '')
  WHERE url LIKE '/uploads/%';

  -- products (images is a JSONB array)
  UPDATE products
  SET images = (
    SELECT jsonb_agg(
      CASE
        WHEN img::text LIKE '"/uploads/%'
        THEN to_jsonb(r2_url || REPLACE(img#>>'{}', '/uploads', ''))
        ELSE img
      END
    )
    FROM jsonb_array_elements(images) img
  )
  WHERE images::text LIKE '%/uploads/%';

  -- categories
  UPDATE categories
  SET image = r2_url || REPLACE(image, '/uploads', '')
  WHERE image LIKE '/uploads/%';

  UPDATE categories
  SET banner_image = r2_url || REPLACE(banner_image, '/uploads', '')
  WHERE banner_image LIKE '/uploads/%';

  -- banners
  UPDATE banners
  SET image = r2_url || REPLACE(image, '/uploads', '')
  WHERE image LIKE '/uploads/%';

  -- users
  UPDATE users
  SET avatar = r2_url || REPLACE(avatar, '/uploads', '')
  WHERE avatar LIKE '/uploads/%';

  -- bundles
  UPDATE bundles
  SET image = r2_url || REPLACE(image, '/uploads', '')
  WHERE image LIKE '/uploads/%';

  -- brands
  UPDATE brands
  SET logo = r2_url || REPLACE(logo, '/uploads', '')
  WHERE logo LIKE '/uploads/%';

  -- countries
  UPDATE countries
  SET flag = r2_url || REPLACE(flag, '/uploads', '')
  WHERE flag LIKE '/uploads/%';

  -- age_groups
  UPDATE age_groups
  SET icon = r2_url || REPLACE(icon, '/uploads', '')
  WHERE icon LIKE '/uploads/%';

  -- mother_categories
  UPDATE mother_categories
  SET image = r2_url || REPLACE(image, '/uploads', '')
  WHERE image LIKE '/uploads/%';

END $$;
```

---

### Step 3.4 — Verify database migration

Spot-check that URLs updated correctly:
```sql
SELECT url FROM media_files LIMIT 10;
SELECT images FROM products LIMIT 5;
SELECT image FROM categories LIMIT 5;
SELECT logo FROM brands LIMIT 5;
```

All values should now start with `https://cdn.yourdomain.com/...`

---

### Step 3.5 — Remove `ServeStaticModule` and clean up

Now that all files are on R2 and all DB references updated:

1. Remove `ServeStaticModule` from `app.module.ts`
2. Remove `@nestjs/serve-static` from `package.json`
3. Delete `/uploads/` from the server (keep backup for 30 days just in case):
   ```bash
   mv uploads/ uploads_backup_$(date +%Y%m%d)/
   ```
4. Deploy updated API

---

### Step 3.6 — Smoke test production

- [ ] Homepage loads — all banner/product images display
- [ ] Product detail page — product images load from R2 URL
- [ ] Category pages — category images display
- [ ] Brand logos display
- [ ] Upload a new file via admin media picker — goes to R2
- [ ] Old images (migrated) still load correctly
- [ ] No `/uploads/` URLs remain in the frontend network tab

**Phase 3 Total Estimate: 3–4 hours**

---

## Full Timeline Summary

| Phase | Task | Estimate |
|-------|------|----------|
| 1 | Separate backend into `ecom-api` repo | 4–6 hours |
| 1 | Separate frontend into `ecom-web` repo | 4–6 hours |
| 1 | Dev workflow verification | 1–2 hours |
| 2 | R2 bucket setup + credentials | 1 hour |
| 2 | StorageService + MediaModule refactor | 4–5 hours |
| 2 | Test new upload flow | 1–2 hours |
| 3 | Sync existing files to R2 | 1 hour |
| 3 | DB migration SQL | 1 hour |
| 3 | Verification + cleanup | 1 hour |
| **Total** | | **~18–24 hours (3 days)** |

---

## Risk Register

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `@repo/ui` import breakage during frontend separation | High | Inline components before cutting the repo |
| Missing image URLs after DB migration | Medium | Run spot-check SQL queries before removing ServeStaticModule |
| File count mismatch after R2 sync | Low | Compare counts before and after sync |
| CORS errors after separation | Medium | Configure `FRONTEND_URL` env var in API before going live |
| Hardcoded JWT secret exposure | High | Fix in Phase 1 before first commit to new repo |

---

## Prerequisites

- [ ] Cloudflare account with R2 enabled (free tier: 10GB storage, 0 egress)
- [ ] Custom domain configured in Cloudflare DNS (optional but recommended)
- [ ] PostgreSQL backup taken before Phase 3
- [ ] Maintenance window agreed for Phase 3 DB migration
- [ ] Both new GitHub repos created and access granted
