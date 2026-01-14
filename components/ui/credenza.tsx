"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer"

interface BaseProps {
  children: React.ReactNode
}

interface RootCredenzaProps extends BaseProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface CredenzaProps extends React.ComponentPropsWithoutRef<typeof DialogTrigger> {
  className?: string
  asChild?: boolean
}

const Credenza = ({ children, ...props }: RootCredenzaProps) => {
  const isMobile = useMobile()
  const CredenzaComponent = isMobile ? Drawer : Dialog

  return <CredenzaComponent {...props}>{children}</CredenzaComponent>
}

const CredenzaTrigger = React.forwardRef<
  React.ElementRef<typeof DialogTrigger>,
  CredenzaProps
>(({ className, children, ...props }, ref) => {
  const isMobile = useMobile()
  const CredenzaTriggerComponent = isMobile ? DrawerTrigger : DialogTrigger

  return (
    <CredenzaTriggerComponent className={className} {...props} ref={ref as any}>
      {children}
    </CredenzaTriggerComponent>
  )
})
CredenzaTrigger.displayName = "CredenzaTrigger"

const CredenzaContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, children, ...props }, ref) => {
  const isMobile = useMobile()
  const CredenzaContentComponent = (isMobile ? DrawerContent : DialogContent) as any

  return (
    <CredenzaContentComponent className={className} {...props} ref={ref}>
      {children}
    </CredenzaContentComponent>
  )
})
CredenzaContent.displayName = "CredenzaContent"

const CredenzaHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useMobile()
  const CredenzaHeaderComponent = (isMobile ? DrawerHeader : DialogHeader) as any

  return (
    <CredenzaHeaderComponent className={cn("text-left", className as any)} {...props}>
      {children}
    </CredenzaHeaderComponent>
  )
}

const CredenzaFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useMobile()
  const CredenzaFooterComponent = (isMobile ? DrawerFooter : DialogFooter) as any

  return (
    <CredenzaFooterComponent className={className} {...props}>
      {children}
    </CredenzaFooterComponent>
  )
}

const CredenzaBody = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("px-4 py-4 md:px-0", className)} {...props}>
      {children}
    </div>
  )
}

const CredenzaTitle = React.forwardRef<
  React.ElementRef<typeof DialogTitle>,
  React.ComponentPropsWithoutRef<typeof DialogTitle>
>(({ className, children, ...props }, ref) => {
  const isMobile = useMobile()
  const CredenzaTitleComponent = (isMobile ? DrawerTitle : DialogTitle) as any

  return (
    <CredenzaTitleComponent className={className} {...props} ref={ref}>
      {children}
    </CredenzaTitleComponent>
  )
})
CredenzaTitle.displayName = "CredenzaTitle"

const CredenzaDescription = React.forwardRef<
  React.ElementRef<typeof DialogDescription>,
  React.ComponentPropsWithoutRef<typeof DialogDescription>
>(({ className, children, ...props }, ref) => {
  const isMobile = useMobile()
  const CredenzaDescriptionComponent = (isMobile ? DrawerDescription : DialogDescription) as any

  return (
    <CredenzaDescriptionComponent className={className} {...props} ref={ref}>
      {children}
    </CredenzaDescriptionComponent>
  )
})
CredenzaDescription.displayName = "CredenzaDescription"

const CredenzaClose = React.forwardRef<
  React.ElementRef<typeof DialogClose>,
  React.ComponentPropsWithoutRef<typeof DialogClose>
>(({ className, children, ...props }, ref) => {
  const isMobile = useMobile()
  const CredenzaCloseComponent = (isMobile ? DrawerClose : DialogClose) as any

  return (
    <CredenzaCloseComponent className={className} {...props} ref={ref}>
      {children}
    </CredenzaCloseComponent>
  )
})
CredenzaClose.displayName = "CredenzaClose"

export {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaBody,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaClose,
}
