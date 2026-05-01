import Link from "next/link"
import { cookies } from "next/headers"
import { LandingNavbar } from "@/components/landing/navbar"
import { VisualDemo } from "@/components/landing/visual-demo"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Leaf01Icon } from "@hugeicons/core-free-icons"

export default async function Home() {
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.has("token")

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      <LandingNavbar isLoggedIn={isLoggedIn} />
      
      <main className="flex-1">
        {/* Hero Section - Product-First Simulation */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-white">
          <VisualDemo isLoggedIn={isLoggedIn} />
        </section>
      </main>

      <footer className="py-12 border-t border-slate-50 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Leaf01Icon} strokeWidth={2} className="size-4" />
          </div>
            <span className="font-bold text-slate-900">TrackIt</span>
          </div>
          
          <p className="text-sm text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} TrackIt.
          </p>
        </div>
      </footer>
    </div>
  )
}
