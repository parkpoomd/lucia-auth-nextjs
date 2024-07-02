import TabSwitcher from '@/components/TabSwitcher'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'
import { getUser } from '@/lib/lucia'
import { redirect } from 'next/navigation'
import GithubOAuthButton from '@/components/GithubOAuthButton'

const AuthenticatePage = async () => {
  const user = await getUser()
  if (user) {
    redirect('dashboard')
  }

  return (
    <div className="relative flex w-full h-screen bg-background">
      <div className="max-w-3xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <GithubOAuthButton />
        <TabSwitcher SignInTab={<SignInForm />} SignUpTab={<SignUpForm />} />
      </div>
    </div>
  )
}

export default AuthenticatePage
