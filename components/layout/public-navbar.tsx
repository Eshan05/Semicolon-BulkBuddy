"use client";

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HiOutlineMenuAlt3 } from 'react-icons/hi';
import type { IconType } from 'react-icons/lib';
import { LuX as XIcon } from 'react-icons/lu';
import { TbBuildingSkyscraper, TbHome, TbMailShare, TbVideo, TbWorldQuestion } from "react-icons/tb";
import { Logo } from "../common/logo";
import { EButton } from '../derived/enhanced-button';

interface NavItem {
  label: string;
  href: string;
  icon?: IconType
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: TbHome },
  { label: 'How it works', href: '#how-it-works', icon: TbWorldQuestion },
  { label: 'Live Pools', href: '/pools', icon: TbVideo },
  { label: 'Verified Suppliers', href: '/suppliers', icon: TbBuildingSkyscraper },
  { label: 'Contact', href: '#contact', icon: TbMailShare },
];

export default function PublicNavbar() {
  const { data: session } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [applyActiveStyles, setApplyActiveStyles] = useState(false);
  const lastScrollY = useRef(0);
  const DOCK_THRESHOLD = 5;
  const HIDE_THRESHOLD = 80;

  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    const currentScrollY = window.scrollY;

    if (currentScrollY > DOCK_THRESHOLD) {
      setApplyActiveStyles(true);
    } else {
      setApplyActiveStyles(false);
    }

    if (currentScrollY > HIDE_THRESHOLD) {
      if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY <= 0 ? 0 : currentScrollY;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleNavLinkClick = (
    sectionId: string,
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    const element = document.getElementById(sectionId.substring(1));
    if (element) {
      const navbarHeight = document.querySelector('header')?.clientHeight || HIDE_THRESHOLD;
      const offset = isVisible && applyActiveStyles ? navbarHeight : 0;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    }
    setIsMobileOpen(false);
  };

  const baseNavContainerClasses = "flex h-16 md:h-11 items-center justify-between py-8 px-4 md:px-8 transition-colors duration-300";
  const activeNavContainerStyles = "bg-white/80 backdrop-blur-md border-b border-border/40";
  const inactiveNavContainerStyles = "bg-transparent";

  return (
    <header
      className={`w-full mx-auto fixed top-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className={`${baseNavContainerClasses} max-w-[1440px] mx-auto ${applyActiveStyles ? activeNavContainerStyles : inactiveNavContainerStyles}`}>
        <div className="w-full flex items-center">
          {/* Left: logo */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-bold text-xl tracking-tight text-foreground">BulkBuddy</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-[2] justify-center">
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <EButton
                  effect={'hoverUnderline'}
                  variant={'link'}
                  className={'flex items-center px-0 font-medium cursor-pointer'}
                  key={item.label}
                  render={<Link href={item.href} className="lg:!text-sm text-foreground/60 hover:text-foreground transition-colors" />}
                >
                  {item.label}
                </EButton>
              ))}
            </nav>
          </div>

          {/* Right: actions */}
          <div className="flex-1 items-center justify-end gap-3 hidden md:flex">
            {session ? (
              <Button render={<Link href="/dashboard" className="text-sm font-medium" />}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant={'ghost'} className="text-sm font-medium" render={<Link href="/sign-in" />}>
                  Login
                </Button>
                <Button className="rounded-full px-6" render={<Link href="/sign-up" />}>
                  Join Now
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden ml-2">
            <Drawer open={isMobileOpen} onOpenChange={setIsMobileOpen} shouldScaleBackground setBackgroundColorOnScale={false}>
              <DrawerTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
                <HiOutlineMenuAlt3 className="h-6 w-6" />
              </DrawerTrigger>
              <DrawerContent className=''>
                <div className="mx-auto w-full max-w-sm py-4">
                  <DrawerHeader className='sr-only'>
                    <DrawerTitle>Menu</DrawerTitle>
                    <DrawerDescription>Navigation Links</DrawerDescription>
                  </DrawerHeader>
                  <header className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <Logo />
                      <span className="font-bold text-foreground text-2xl tracking-tight">BulkBuddy</span>
                    </div>
                    <DrawerClose render={<Button className="p-2 rounded-md" size={'icon'} variant={'ghost'} />}>
                      <XIcon />
                    </DrawerClose>
                  </header>
                  <div className="mt-8 px-4 space-y-4">
                    {navItems.map((item) => (
                      <Link key={item.label} href={item.href} onClick={() => setIsMobileOpen(false)} className="block text-foreground/70 hover:text-foreground flex items-center gap-3 text-lg font-medium transition-colors">
                        {item.icon && <item.icon className="h-5 w-5" />}
                        {item.label}
                      </Link>
                    ))}

                    <footer className="pt-6 mt-6 border-t border-border">
                      <div className="flex flex-col gap-3">
                          {session ? (
                            <Button render={<Link href="/dashboard" className="w-full text-center" />}>
                              Dashboard
                            </Button>
                          ) : (
                            <>
                              <Button variant={'outline'} className="w-full rounded-xl" render={<Link href="/sign-in" />}>
                                Sign in
                              </Button>

                              <Button className="w-full rounded-xl" render={<Link href="/sign-up" />}>
                                Join BulkBuddy
                              </Button>
                            </>
                          )}
                      </div>
                    </footer>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header >
  );
}
