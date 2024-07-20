import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';
import { updateBlogInput, createBlogInput } from "@sumit-1803/medium-common";



export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("*", async (c, next) => {
  const authHeader = c.req.header('Authorization') || "";
  const token = authHeader.split(" ")[1];

  try {
    const user = await verify(token, c.env.JWT_SECRET);
    if (user.id) {
      c.set('userId', user.id.toString());
      await next();
    } else {
      c.status(403);
      return c.json({ message: 'You Are Not Logged In and error while setting userid in middleware' });
    }
  } catch (error) {
    console.error('JWT verification error:', error);
    c.status(403);
    return c.json({
      message: 'You Are Not Logged In and error while setting userid in middleware',
    });
  }
});

// Create blog post request
blogRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json({ message: 'Invalid input' });
    }
    const authorId = c.get('userId');
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: authorId,
      }
    });

    return c.json({ 
      id: blog.id 
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    c.status(500);
    return c.json({ message: 'Internal Server Error while creating blog post' });
  }
});

// Update blog post request
blogRouter.put('/', async (c) => {
  try {
    const body = await c.req.json();
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json({ message: 'Invalid input' });
    }

     const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const blog = await prisma.post.update({
      where: { id: body.id },
      data: {
        title: body.title,
        content: body.content,
      }
    });

    return c.json({
      id: blog.id
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    c.status(500);
    return c.json({ message: 'Error updating blog post ' });
  }
});


// Get bulk blog posts request
blogRouter.get('/bulk', async (c) => {
  try {
    // Create a new PrismaClient instance
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    // Fetch blog posts
    const blogs = await prisma.post.findMany({
      select: {
        content: true,
        title: true,
        id: true,
        author: {
          select: {
            name: true,
          }
        }
      }
    });

    // Close the PrismaClient connection
    await prisma.$disconnect();

    // Return the fetched blogs as a JSON response
    return c.json({ blogs });
  } catch (error) {
    console.error('Error fetching bulk blog posts:', error);
    
    // Return an error response
    c.status(500);
    return c.json({ message: 'Error while fetching bulk posts' });
  }
});

// Route to get a single blog
blogRouter.get('/:id', async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
      const blog = await prisma.post.findFirst({
          where: {
              id: String(id)
          },
          select: {
              id: true,
              title: true,
              content: true,
              author: {
                  select: {
                      name: true
                  }
              }
          }
      })
  
      return c.json({
          blog
      });
  } catch(e) {
      c.status(411); // 4
      return c.json({
          message: "Error while fetching single blog post"
      });
  }
})

export default blogRouter;
