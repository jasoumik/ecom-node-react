# COPILOT RULES

These rules must be followed whenever Copilot is generating code for this project.

## 1. General Rules
- Use **TypeScript everywhere**
- Follow **clean architecture principles**
- Components should be **reusable and composable**
- No inline business logic inside React components
- Use **server actions** or API routes for all database operations
- Always keep performance and SEO in mind
- All code must be **tenant-aware** (multi-schema PostgreSQL)
- Do not hardcode tenant schema names

## 2. Frontend Rules
- Next.js App Router should be used
- Use **shared UI components** from `packages/ui`
- Fetch data from APIs, do not hardcode
- Optimize images using `next/image`
- Metadata API must be used for SEO

## 3. Backend Rules
- Prisma Client must be created per tenant (multi-schema support)
- NestJS for backend structure
- API endpoints must be secure and validate all input
- Use Redis for caching where needed (cart, session, pages)
- Follow proper folder structure (modules, controllers, services)

## 4. Payment Rules
- Use a **PaymentProvider interface** for all payment gateways
- Implement bkash and COD initially
- Future gateways should be plug-and-play
- Payments should store transactional data safely per tenant

## 5. Landing Page Builder Rules
- Landing pages should be stored as JSON layouts
- Server-side rendering (SSG or ISR) should be used for pages
- Admin panel should allow preview and publish
- All landing pages must be tenant-aware

## 6. Admin Panel Rules
- Role-based access control (admin, user)
- Audit logs must be created for critical actions
- Pagination must be applied for lists
- All admin operations must respect tenant isolation

## 7. Commit Rules
- Generate **one feature at a time**
- Avoid generating everything in a single prompt
- Refactor and commit code before moving to the next prompt