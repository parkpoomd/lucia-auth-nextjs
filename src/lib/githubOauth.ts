import { GitHub } from 'arctic'

export const githubOauth = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  {
    redirectURI: 'http://localhost:3000/api/auth/github/callback',
  }
)
