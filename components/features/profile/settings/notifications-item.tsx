"use client"
import React from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { LuBell as Bell } from 'react-icons/lu'

export default function NotificationsItem() {
  return (
    <DropdownMenuItem>
      <Bell />
      Notifications
    </DropdownMenuItem>
  )
}
