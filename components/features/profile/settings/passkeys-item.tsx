"use client"

import React from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import PasskeysPanel, { AddPasskeyInline } from '@/components/features/auth/passkeys-panel'
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaBody,
  CredenzaTitle,
  CredenzaDescription,
} from "../../../ui/credenza";
import { LuFingerprint as Fingerprint } from "react-icons/lu";

export default function PasskeysItem() {
  return (
    <Credenza>
      <CredenzaTrigger className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
        <Fingerprint />
        <span>Manage Passkeys</span>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Passkeys</CredenzaTitle>
          <CredenzaDescription>Manage registered passkeys for your account.</CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          <div className="flex items-center justify-between mb-4">
            <AddPasskeyInline />
          </div>
          <PasskeysPanel />
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  )
}
