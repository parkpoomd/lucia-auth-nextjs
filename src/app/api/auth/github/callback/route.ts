import { githubOauth } from '@/lib/githubOauth'
import { lucia } from '@/lib/lucia'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, res: NextResponse) {
  const url = req.nextUrl
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) {
    console.error('no code or state')
    return new Response('Invalid request', { status: 400 })
  }

  const codeVerifier = cookies().get('codeVerifier')?.value
  const savedState = cookies().get('state')?.value

  if (!codeVerifier || !savedState) {
    console.error('no code verifier or state')
    return new Response('Invalid request', { status: 400 })
  }

  if (state !== savedState) {
    console.error('state mismatch')
    return new Response('Invalid request', { status: 400 })
  }

  const tokens = await githubOauth.validateAuthorizationCode(code)

  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  })

  const user = (await response.json()) as {
    id: string
    email?: string
    name: string
  }
  console.log(user)

  let userId: string = ''

  const existingUser = await prisma.user.findUnique({
    where: {
      email: 'parkpoom@test.com',
    },
  })
  if (existingUser) {
    userId = existingUser.id
  } else {
    const newUser = await prisma.user.create({
      data: {
        email: 'parkpoom@test.com',
        name: user.name,
      },
    })
    userId = newUser.id
  }

  const session = await lucia.createSession(userId, {})
  const sessionCookie = await lucia.createSessionCookie(session.id)
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  )

  return redirect('/dashboard')
}
