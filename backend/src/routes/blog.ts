import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from 'hono/jwt';
import { JWTPayload } from 'hono/utils/jwt/types';
import { signupInput,createBlogInput } from "@sumit-1803/medium-common";


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
  // Extract user ID and pass it to the next middleware
  const authHeader = c.req.header('Authorization') || '';
  const token = authHeader.split(' ')[1];

  try {
    const user = await verify(token, c.env.JWT_SECRET) as JWTPayload & { id: string }; // Ensure the user object has an id property

    if (user && user.id) {
      c.set('userId', user.id); // Set the userId correctly
      await next();
    } else {
      c.status(403);
      return c.json({ message: 'Unauthenticated' });
    }
  } catch (error) {
    console.error('JWT verification error:', error);
    c.status(403);
    return c.json({ message: 'Unauthenticated' });
  }
});

// Create blog post request
blogRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const {success} = createBlogInput.safeParse(body);
    if (!success) {
      c.status(411);
      return c.json({ message: 'Invalid input' });
    }
    const userId = c.get('userId');
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      }
    });

    return c.json({ id: blog.id });
  } catch (error) {
    console.error('Error creating blog post:', error);
    c.status(500);
    return c.json({ message: 'Internal Server Error' });
  }
});

// Update blog post request
blogRouter.put('/blog', async (c) => {
  try {
    const body = await c.req.json();
    const userId = c.get('userId');
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    await prisma.post.update({
      where: {
        id: body.id,
        authorId: userId,
      },
      data: {
        title: body.title,
        content: body.content,
      }
    });

    return c.text("Updated Successfully");
  } catch (error) {
    console.error('Error updating blog post:', error);
    c.status(500);
    return c.json({ message: 'Internal Server Error' });
  }
});

// Get bulk blog posts request
blogRouter.get('/bulk', async (c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const posts = await prisma.post.findMany();

    return c.json(posts);
  } catch (error) {
    console.error('Error fetching bulk blog posts:', error);
    c.status(500);
    return c.json({ message: 'Internal Server Error' });
  }
});

// Route to get a single blog
blogRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.findUnique({
      where: { id }
    });

    return c.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    c.status(500);
    return c.json({ message: 'Internal Server Error' });
  }
});


export default blogRouter;
