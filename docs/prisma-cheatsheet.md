# Prisma Cheatsheet

## Table of Contents
- [CLI Commands](#cli-commands)
- [Query Operations](#query-operations)
- [Filtering](#filtering)
- [Relations](#relations)
- [Ordering & Pagination](#ordering--pagination)
- [Aggregations](#aggregations)
- [Mutations](#mutations)
- [Transactions](#transactions)

---

## CLI Commands

### Setup & Generation
```bash
# Initialize Prisma in your project
npx prisma init

# Generate Prisma Client (after schema changes)
npx prisma generate

# Format schema file
npx prisma format
```

### Database Migrations
```bash
# Create a migration from schema changes
npx prisma migrate dev --name migration_name

# Apply pending migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Create migration without applying
npx prisma migrate dev --create-only
```

### Database Operations
```bash
# Push schema changes without migrations (prototyping)
npx prisma db push

# Pull schema from existing database
npx prisma db pull

# Seed the database
npx prisma db seed

# Execute raw SQL
npx prisma db execute --file script.sql
```

### Studio & Debugging
```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# Validate schema
npx prisma validate

# Show Prisma info
npx prisma version
```

---

## Query Operations

### Finding Records

```typescript
// Get all records
const users = await prisma.user.findMany()

// Get single record by unique field (id, email, etc.)
const user = await prisma.user.findUnique({
  where: { id: 1 }
})

// Get first matching record
const post = await prisma.post.findFirst({
  where: { published: true }
})

// Get first or throw error if not found
const user = await prisma.user.findUniqueOrThrow({
  where: { id: 1 }
})

// Get first or throw error
const post = await prisma.post.findFirstOrThrow({
  where: { published: true }
})
```

---

## Filtering

### Basic Filters

```typescript
// Exact match
const users = await prisma.user.findMany({
  where: { name: 'Alice' }
})

// Multiple conditions (AND by default)
const posts = await prisma.post.findMany({
  where: {
    published: true,
    title: 'Hello World'
  }
})

// OR conditions
const users = await prisma.user.findMany({
  where: {
    OR: [
      { name: 'Alice' },
      { email: 'bob@prisma.io' }
    ]
  }
})

// NOT condition
const posts = await prisma.post.findMany({
  where: {
    NOT: { published: false }
  }
})

// Combine AND, OR, NOT
const users = await prisma.user.findMany({
  where: {
    OR: [
      { name: 'Alice' },
      { name: 'Bob' }
    ],
    NOT: {
      email: { contains: 'spam' }
    }
  }
})
```

### Comparison Operators

```typescript
// Equals / Not equals
where: { age: { equals: 25 } }
where: { age: { not: 25 } }

// Greater than / Less than
where: { age: { gt: 18 } }        // >
where: { age: { gte: 18 } }       // >=
where: { age: { lt: 65 } }        // <
where: { age: { lte: 65 } }       // <=

// In / Not in array
where: { id: { in: [1, 2, 3] } }
where: { id: { notIn: [4, 5] } }

// Null checks
where: { name: { isNull: true } }
where: { name: { isNull: false } }
```

### String Filters

```typescript
// Contains substring
where: { title: { contains: 'Prisma' } }

// Starts with
where: { title: { startsWith: 'Hello' } }

// Ends with
where: { title: { endsWith: 'World' } }

// Case-insensitive search
where: {
  title: {
    contains: 'prisma',
    mode: 'insensitive'
  }
}

// Not contains
where: { title: { not: { contains: 'spam' } } }
```

### List Filters

```typescript
// Check if list is empty
where: { tags: { isEmpty: true } }

// Check if list contains value
where: { tags: { has: 'typescript' } }

// Check if list contains all values
where: { tags: { hasEvery: ['typescript', 'prisma'] } }

// Check if list contains some values
where: { tags: { hasSome: ['typescript', 'javascript'] } }
```

---

## Relations

### Include Relations

```typescript
// Include all posts for each user
const users = await prisma.user.findMany({
  include: {
    posts: true
  }
})

// Include author for each post
const posts = await prisma.post.findMany({
  include: {
    author: true
  }
})

// Nested includes
const users = await prisma.user.findMany({
  include: {
    posts: {
      include: {
        comments: true
      }
    }
  }
})

// Include with filters
const users = await prisma.user.findMany({
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }
  }
})
```

### Select Specific Fields

```typescript
// Select only specific fields
const users = await prisma.user.findMany({
  select: {
    name: true,
    email: true
    // id is NOT included
  }
})

// Select with relations
const users = await prisma.user.findMany({
  select: {
    name: true,
    posts: {
      select: {
        title: true,
        published: true
      }
    }
  }
})

// Note: You can't use `include` and `select` together!
```

### Relation Filters

```typescript
// Users who have at least one published post
const users = await prisma.user.findMany({
  where: {
    posts: {
      some: { published: true }
    }
  }
})

// Users where ALL posts are published
const users = await prisma.user.findMany({
  where: {
    posts: {
      every: { published: true }
    }
  }
})

// Users with NO published posts
const users = await prisma.user.findMany({
  where: {
    posts: {
      none: { published: true }
    }
  }
})

// Users with no posts at all
const users = await prisma.user.findMany({
  where: {
    posts: { none: {} }
  }
})

// Nested relation filters
const posts = await prisma.post.findMany({
  where: {
    author: {
      name: { contains: 'Alice' }
    }
  }
})
```

---

## Ordering & Pagination

### Ordering

```typescript
// Order by single field
const users = await prisma.user.findMany({
  orderBy: { name: 'asc' }  // or 'desc'
})

// Order by multiple fields
const posts = await prisma.post.findMany({
  orderBy: [
    { published: 'desc' },
    { title: 'asc' }
  ]
})

// Order by relation
const posts = await prisma.post.findMany({
  orderBy: {
    author: {
      name: 'asc'
    }
  }
})

// Order by aggregation
const users = await prisma.user.findMany({
  orderBy: {
    posts: {
      _count: 'desc'  // Users with most posts first
    }
  }
})
```

### Pagination

```typescript
// Offset pagination (skip & take)
const users = await prisma.user.findMany({
  skip: 10,     // Skip first 10 records
  take: 5       // Take 5 records
})

// Cursor-based pagination (recommended for large datasets)
const posts = await prisma.post.findMany({
  take: 10,
  cursor: { id: 20 },  // Start from post id 20
  skip: 1              // Skip the cursor itself
})

// Get next page
const nextPage = await prisma.post.findMany({
  take: 10,
  cursor: { id: lastPostId },
  skip: 1
})
```

---

## Aggregations

### Counting

```typescript
// Count all records
const count = await prisma.user.count()

// Count with filter
const publishedCount = await prisma.post.count({
  where: { published: true }
})

// Count distinct values
const uniqueAuthors = await prisma.post.count({
  where: { published: true },
  _count: { authorId: true }
})
```

### Aggregate Functions

```typescript
// Multiple aggregations
const result = await prisma.post.aggregate({
  _count: { id: true },
  _avg: { viewCount: true },
  _sum: { viewCount: true },
  _min: { viewCount: true },
  _max: { viewCount: true }
})

// With filter
const stats = await prisma.post.aggregate({
  where: { published: true },
  _avg: { viewCount: true }
})
```

### Group By

```typescript
// Group posts by authorId
const postsByAuthor = await prisma.post.groupBy({
  by: ['authorId'],
  _count: { id: true },
  _sum: { viewCount: true }
})

// Group with filter
const stats = await prisma.post.groupBy({
  by: ['authorId', 'published'],
  where: { createdAt: { gte: new Date('2024-01-01') } },
  _count: { id: true },
  having: {
    id: { _count: { gt: 5 } }  // Only authors with >5 posts
  }
})
```

---

## Mutations

### Create

```typescript
// Create single record
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    name: 'Alice'
  }
})

// Create with relations (nested create)
const user = await prisma.user.create({
  data: {
    email: 'bob@prisma.io',
    name: 'Bob',
    posts: {
      create: [
        { title: 'First Post', published: true },
        { title: 'Second Post' }
      ]
    }
  }
})

// Create many records
const result = await prisma.user.createMany({
  data: [
    { email: 'user1@test.com', name: 'User 1' },
    { email: 'user2@test.com', name: 'User 2' }
  ],
  skipDuplicates: true  // Skip if unique constraint fails
})

// Create and return the record
const user = await prisma.user.create({
  data: { email: 'test@test.com' },
  include: { posts: true }  // Return with posts
})
```

### Update

```typescript
// Update single record
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Alice Updated' }
})

// Update many records
const result = await prisma.post.updateMany({
  where: { published: false },
  data: { published: true }
})

// Update with relations
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      create: { title: 'New Post' },
      update: {
        where: { id: 5 },
        data: { title: 'Updated Title' }
      },
      delete: { id: 3 }
    }
  }
})

// Increment/Decrement numbers
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    viewCount: { increment: 1 }  // or { decrement: 1 }
  }
})

// Upsert (update or create)
const user = await prisma.user.upsert({
  where: { email: 'alice@prisma.io' },
  update: { name: 'Alice Updated' },
  create: { email: 'alice@prisma.io', name: 'Alice' }
})
```

### Delete

```typescript
// Delete single record
const user = await prisma.user.delete({
  where: { id: 1 }
})

// Delete many records
const result = await prisma.post.deleteMany({
  where: { published: false }
})

// Delete all records
const result = await prisma.user.deleteMany()
```

### Connect/Disconnect Relations

```typescript
// Connect existing records
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    author: {
      connect: { id: 5 }  // Connect to user with id 5
    }
  }
})

// Disconnect relation
const post = await prisma.post.update({
  where: { id: 1 },
  data: {
    author: {
      disconnect: true
    }
  }
})
```

---

## Transactions

### Sequential Operations (Array)

```typescript
// All operations succeed or all fail
const [deletedPosts, newUser] = await prisma.$transaction([
  prisma.post.deleteMany({ where: { published: false } }),
  prisma.user.create({ data: { email: 'new@test.com' } })
])
```

### Interactive Transactions

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Transfer money between accounts
  const user1 = await tx.user.update({
    where: { id: 1 },
    data: { balance: { decrement: 100 } }
  })

  const user2 = await tx.user.update({
    where: { id: 2 },
    data: { balance: { increment: 100 } }
  })

  return { user1, user2 }
})
```

### Transaction Options

```typescript
await prisma.$transaction(
  [
    prisma.user.create({ data: { email: 'test@test.com' } }),
    prisma.post.create({ data: { title: 'Test' } })
  ],
  {
    maxWait: 5000,      // Max time to wait for transaction to start
    timeout: 10000,     // Max time transaction can run
    isolationLevel: 'ReadCommitted'
  }
)
```

---

## Raw Queries

### Execute Raw SQL

```typescript
// Raw query (SELECT)
const users = await prisma.$queryRaw`
  SELECT * FROM User WHERE name = ${name}
`

// Unsafe raw query (use with caution)
const users = await prisma.$queryRawUnsafe(
  'SELECT * FROM User WHERE name = $1',
  name
)

// Execute raw SQL (INSERT, UPDATE, DELETE)
const result = await prisma.$executeRaw`
  UPDATE User SET name = ${newName} WHERE id = ${id}
`

// Unsafe execute
const result = await prisma.$executeRawUnsafe(
  'DELETE FROM User WHERE id = $1',
  id
)
```

---

## Middleware & Extensions

### Middleware

```typescript
// Add middleware (runs on all queries)
prisma.$use(async (params, next) => {
  console.log('Query:', params.model, params.action)
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  console.log(`Query took ${after - before}ms`)
  return result
})
```

### Client Extensions

```typescript
// Extend Prisma Client with custom methods
const xprisma = prisma.$extends({
  model: {
    user: {
      async findByEmail(email: string) {
        return await prisma.user.findUnique({
          where: { email }
        })
      }
    }
  }
})

// Use the extended client
const user = await xprisma.user.findByEmail('test@test.com')
```

---

## Best Practices

### 1. Connection Management

```typescript
// Singleton pattern for Next.js
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

### 2. Type Safety

```typescript
// Use Prisma.validator for type-safe reusable queries
const userWithPosts = Prisma.validator<Prisma.UserArgs>()({
  include: { posts: true }
})

// Get the type
type UserWithPosts = Prisma.UserGetPayload<typeof userWithPosts>

// Use it
const users: UserWithPosts[] = await prisma.user.findMany(userWithPosts)
```

### 3. Selective Field Loading

```typescript
// Only load what you need
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true
    // Don't load heavy fields you don't need
  }
})
```

### 4. Use Indexes

```prisma
// In schema.prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  published Boolean  @default(false)

  @@index([published])  // Add index for frequently queried fields
}
```

---

## Common Patterns

### Soft Delete

```typescript
// Add deletedAt field to schema
model User {
  id        Int       @id @default(autoincrement())
  email     String
  deletedAt DateTime?
}

// Middleware for automatic soft delete
prisma.$use(async (params, next) => {
  if (params.model && params.action === 'delete') {
    params.action = 'update'
    params.args['data'] = { deletedAt: new Date() }
  }
  if (params.action === 'findMany' || params.action === 'findFirst') {
    params.args.where = {
      ...params.args.where,
      deletedAt: null
    }
  }
  return next(params)
})
```

### Full-Text Search (PostgreSQL)

```typescript
// Raw query for full-text search
const posts = await prisma.$queryRaw`
  SELECT * FROM "Post"
  WHERE to_tsvector('english', title || ' ' || content)
  @@ to_tsquery('english', ${searchTerm})
`
```

### Optimistic Concurrency Control

```prisma
model Post {
  id      Int    @id @default(autoincrement())
  version Int    @default(0)
}
```

```typescript
// Update with version check
const post = await prisma.post.update({
  where: {
    id: 1,
    version: currentVersion  // Fails if version changed
  },
  data: {
    title: 'Updated',
    version: { increment: 1 }
  }
})
```

---

## Debugging

### Enable Query Logging

```typescript
// In prisma initialization
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

// Or specific events
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' }
  ]
})

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Duration: ' + e.duration + 'ms')
})
```

---

## Environment Variables

```env
# .env file
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# For connection pooling (recommended for serverless)
DATABASE_URL="postgres://user:password@host:5432/db?pgbouncer=true"
DIRECT_URL="postgres://user:password@host:5432/db"
```

```prisma
// schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Quick Reference

| Operation | Method |
|-----------|--------|
| Find all | `findMany()` |
| Find one by unique | `findUnique()` |
| Find first match | `findFirst()` |
| Create one | `create()` |
| Create many | `createMany()` |
| Update one | `update()` |
| Update many | `updateMany()` |
| Delete one | `delete()` |
| Delete many | `deleteMany()` |
| Upsert | `upsert()` |
| Count | `count()` |
| Aggregate | `aggregate()` |
| Group | `groupBy()` |

---

**For more information, visit the [official Prisma documentation](https://www.prisma.io/docs)**
