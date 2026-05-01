"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Leaf01Icon } from "@hugeicons/core-free-icons"

export function LandingNavbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      isScrolled ? "bg-background/80 backdrop-blur-md border-border py-3" : "bg-transparent border-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
           <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Leaf01Icon} strokeWidth={2} className="size-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-foreground">
            TrackIt
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button asChild className="rounded-xl px-6 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:flex rounded-xl font-semibold">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="rounded-xl px-6 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
