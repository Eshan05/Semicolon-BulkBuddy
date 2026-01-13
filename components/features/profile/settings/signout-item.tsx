"use client"

import React, { useState } from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { LuLogOut as LogOut, LuLoader as Loader2 } from 'react-icons/lu'
import { authClient as client, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function SignOutItem() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  return (
    <DropdownMenuItem onClick={async () => {
      if (isSigningOut) return
      setIsSigningOut(true)
      try {
        await signOut({ fetchOptions: { onSuccess() { router.push('/') } } })
      } catch (e) { console.error(e) } finally { setIsSigningOut(false) }
    }}>
      {isSigningOut ? (<><Loader2 className="animate-spin" /> <span>Signing out...</span></>) : (<><LogOut /> <span>Log out</span></>)}
    </DropdownMenuItem>
  )
}
