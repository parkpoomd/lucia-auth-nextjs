'use client'

import React from 'react'
import { Button } from './ui/button'
import { RiGithubFill } from '@remixicon/react'
import { getGithubOauthConsentUrl } from '@/app/authenticate/auth.action'
import { toast } from 'sonner'

const GithubOAuthButton = () => {
  return (
    <Button
      onClick={async () => {
        const res = await getGithubOauthConsentUrl()
        if (res.url) {
          window.location.href = res.url
        } else {
          toast.error(res.error)
        }
      }}
    >
      <RiGithubFill className="w-4 h-4 mr-2" /> Continue with Github!
    </Button>
  )
}

export default GithubOAuthButton
