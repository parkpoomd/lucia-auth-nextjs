'use server'

import { z } from 'zod'
import { signUpFormSchema } from './SignUpForm'
import { prisma } from '@/lib/prisma'
import { Argon2id } from 'oslo/password'
import { lucia } from '@/lib/lucia'
import { cookies } from 'next/headers'
import { signInFormSchema } from './SignInForm'

export const signUp = async (values: z.infer<typeof signUpFormSchema>) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: values.email,
      },
    })

    if (existingUser) {
      return { error: 'User already exists', success: false }
    }

    const hashedPassword = await new Argon2id().hash(values.password)

    const user = await prisma.user.create({
      data: {
        name: values.name,
        email: values.email.toLowerCase(),
        hashedPassword,
      },
    })

    const session = await lucia.createSession(user.id, {})
    const sessionCookie = await lucia.createSessionCookie(session.id)
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    )
    return { success: true }
  } catch (error) {
    return { error: 'An error occurred', success: false }
  }
}

export const signIn = async (values: z.infer<typeof signInFormSchema>) => {
  const user = await prisma.user.findUnique({
    where: {
      email: values.email,
    },
  })

  if (!user || !user.hashedPassword) {
    return { error: 'Invalid credentials', success: false }
  }

  const passwordMatch = await new Argon2id().verify(
    user.hashedPassword,
    values.password
  )

  if (!passwordMatch) {
    return { error: 'Invalid credentials', success: false }
  }

  const session = await lucia.createSession(user.id, {})
  const sessionCookie = await lucia.createSessionCookie(session.id)
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  )

  return { success: true }
}
