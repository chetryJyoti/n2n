import prisma from '@/lib/db'

const Home = async () => {
  // ===== 1. BASIC QUERIES =====

  // Get all users
  const allUsers = await prisma.user.findMany()

  // Get all posts
  const allPosts = await prisma.post.findMany()

  // Get single user by unique field (id or email)
  const singleUser = await prisma.user.findUnique({
    where: { email: 'alice@prisma.io' }
  })

  // Get first user that matches condition
  const firstPublishedPost = await prisma.post.findFirst({
    where: { published: true }
  })

  // ===== 2. FILTERING =====

  // Find users with specific name
  const aliceUsers = await prisma.user.findMany({
    where: { name: 'Alice' }
  })

  // Find published posts
  const publishedPosts = await prisma.post.findMany({
    where: { published: true }
  })

  // Multiple conditions (AND)
  const publishedPostsWithContent = await prisma.post.findMany({
    where: {
      published: true,
      content: { not: null }
    }
  })

  // OR conditions
  const aliceOrBob = await prisma.user.findMany({
    where: {
      OR: [
        { name: 'Alice' },
        { name: 'Bob' }
      ]
    }
  })

  // Text search (contains, startsWith, endsWith)
  const postsWithPrisma = await prisma.post.findMany({
    where: {
      title: { contains: 'Prisma' }
    }
  })

  // ===== 3. RELATIONS (INCLUDES) =====

  // Get users WITH their posts
  const usersWithPosts = await prisma.user.findMany({
    include: {
      posts: true  // Include all posts for each user
    }
  })

  // Get posts WITH author information
  const postsWithAuthor = await prisma.post.findMany({
    include: {
      author: true  // Include the user who wrote the post
    }
  })

  // Nested filtering - Users with at least one published post
  const usersWithPublishedPosts = await prisma.user.findMany({
    where: {
      posts: {
        some: { published: true }  // 'some' means at least one
      }
    },
    include: {
      posts: {
        where: { published: true }  // Only include published posts
      }
    }
  })

  // ===== 4. SELECT (Choose specific fields) =====

  // Only get specific fields
  const userNamesAndEmails = await prisma.user.findMany({
    select: {
      name: true,
      email: true
      // id is NOT included
    }
  })

  // Select with relations
  const userWithPostTitles = await prisma.user.findMany({
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

  // ===== 5. ORDERING =====

  // Order by name ascending
  const usersByName = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  })

  // Order by multiple fields
  const orderedPosts = await prisma.post.findMany({
    orderBy: [
      { published: 'desc' },  // Published first
      { title: 'asc' }        // Then alphabetically
    ]
  })

  // ===== 6. PAGINATION =====

  // Skip and take (limit)
  const paginatedUsers = await prisma.user.findMany({
    skip: 0,    // Skip first 0 records
    take: 10    // Take 10 records
  })

  // Cursor-based pagination
  const cursorPagination = await prisma.post.findMany({
    take: 5,
    cursor: { id: 3 },  // Start from post id 3
    skip: 1             // Skip the cursor itself
  })

  // ===== 7. AGGREGATIONS & COUNTING =====

  // Count all users
  const userCount = await prisma.user.count()

  // Count with conditions
  const publishedPostCount = await prisma.post.count({
    where: { published: true }
  })

  // Count posts per user (groupBy)
  const postCountPerUser = await prisma.post.groupBy({
    by: ['authorId'],
    _count: { id: true }
  })

  // ===== 8. CREATE OPERATIONS =====

  // Create a new user
  // const newUser = await prisma.user.create({
  //   data: {
  //     email: 'new@example.com',
  //     name: 'New User'
  //   }
  // })

  // Create user with posts
  // const userWithPosts = await prisma.user.create({
  //   data: {
  //     email: 'author@example.com',
  //     name: 'Author',
  //     posts: {
  //       create: [
  //         { title: 'First Post', content: 'Hello World' },
  //         { title: 'Second Post', published: true }
  //       ]
  //     }
  //   },
  //   include: { posts: true }
  // })

  // ===== 9. UPDATE OPERATIONS =====

  // Update single record
  // const updatedUser = await prisma.user.update({
  //   where: { email: 'alice@prisma.io' },
  //   data: { name: 'Alice Updated' }
  // })

  // Update many records
  // const publishAllPosts = await prisma.post.updateMany({
  //   where: { published: false },
  //   data: { published: true }
  // })

  // ===== 10. DELETE OPERATIONS =====

  // Delete single record
  // const deletedPost = await prisma.post.delete({
  //   where: { id: 1 }
  // })

  // Delete many records
  // const deleteUnpublished = await prisma.post.deleteMany({
  //   where: { published: false }
  // })

  // ===== 11. TRANSACTIONS =====

  // Execute multiple operations atomically
  // const [deletedPosts, createdUser] = await prisma.$transaction([
  //   prisma.post.deleteMany({ where: { published: false } }),
  //   prisma.user.create({ data: { email: 'test@test.com', name: 'Test' } })
  // ])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Prisma Query Examples</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. All Users</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(allUsers, null, 2)}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Users with Posts (Include)</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(usersWithPosts, null, 2)}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Posts with Author</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(postsWithAuthor, null, 2)}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Select Specific Fields</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(userNamesAndEmails, null, 2)}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Published Posts Count</h2>
        <p className="text-xl">Total: {publishedPostCount}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Users with Published Posts Only</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(usersWithPublishedPosts, null, 2)}
        </pre>
      </section>
    </div>
  )
}

export default Home