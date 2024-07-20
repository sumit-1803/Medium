import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'
import { signupInput } from "@sumit-1803/medium-common";


export const userRouter = new Hono<
{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>();

// SignUp post request 
  
userRouter.post('/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());
	const body = await c.req.json();
  const {success} = signupInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ message: 'Invalid input' });
  }
	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password,
        name: body.name
			}
		});
    
		const token = await sign({ id: user.id}, c.env.JWT_SECRET);
    return c.json({ token });

	} catch(e) {
    return c.json({ "message" : " Internal server error" }, 500);
	}
})

// SignIn post request

userRouter.post('/signin', async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const body = await c.req.json()
    const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  })
  if (!user) {
    c.status(403);
    return c.json({ message: 'User not found' })
  }
  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
  return c.json({ jwt })
  } catch (error) {
    c.status(403);
    return c.json({ message: 'Internal server error' },500)
  }
})
