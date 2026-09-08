# AI Orbit Companies Module

A public AI company directory inspired by AI Orbit. The module includes a searchable Companies listing page, filters, pagination, company detail pages, related tools and models, loading states, empty states, and error handling.

**Author:** Vivek Singh

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma Next 8
- PostgreSQL / Neon
- Tailwind CSS

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/companies](http://localhost:3000/companies).

## Environment

Create a `.env` file with a PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

## Database Commands

The data contract is defined in [prisma/schema.prisma](prisma/schema.prisma).

```bash
npm run db:emit
npm run db:init
npm run db:seed
npm run db:inspect
```

`db:seed` inserts the public demo companies, categories, tools, models, and relationships.

## Companies Module

Public pages:

```text
/companies
/companies/[slug]
```

Public API endpoints:

```text
GET /api/companies
GET /api/companies/[slug]
```

The listing API supports search, industry, company type, sorting, and pagination:

```text
/api/companies?search=ai&type=STARTUP&sort=name&page=1&pageSize=12
```

## Validation

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Author

Vivek Singh
