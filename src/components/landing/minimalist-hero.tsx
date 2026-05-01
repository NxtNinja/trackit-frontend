"use client"

import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  ZapIcon,
  ArrowRight01Icon,
  Wallet01Icon,
  Analytics01Icon,
  TrendingUp
} from "@hugeicons/core-free-icons"
import { Button } from "../ui/button"

export function MinimalistHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="max-w-5xl mx-auto text-center py-16 md:py-24 relative overflow-visible">
      
      {/* Background Radiant Pulse (To fill whitespace) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px] -z-10" />

      <div className="flex flex-col items-center gap-10">
        
        {/* Authoritative Content */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <HugeiconsIcon icon={ZapIcon} className="size-3" />
              <span>Financial Intelligence v2.0</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            Track wealth <br /> 
            <span className="text-primary italic">in real-time.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto tracking-tight">
            The high-fidelity command center for every transaction. <br className="hidden md:block" /> Secure, fast, and built for total privacy.
          </p>
        </div>

        {/* Action Center */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          {isLoggedIn ? (
            <Button size="lg" className="rounded-2xl px-12 h-16 text-base font-bold bg-slate-900 text-white shadow-2xl shadow-slate-200 transition-all hover:scale-[1.05]" asChild>
              <Link href="/dashboard">
                Open Dashboard
                <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" className="rounded-2xl px-12 h-16 text-base font-bold bg-slate-900 text-white shadow-2xl shadow-slate-200 transition-all hover:scale-[1.05]" asChild>
                <Link href="/signup">
                  Get Started
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="rounded-2xl px-12 h-16 text-base font-bold text-slate-500 hover:bg-slate-50 transition-colors" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            </>
          )}
        </div>

        {/* Upgraded Data Strip (Larger & More Detailed) */}
        <div className="pt-12 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="flex items-center gap-5 p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                 <HugeiconsIcon icon={Wallet01Icon} className="size-6" />
              </div>
              <div className="text-left space-y-0.5">
                 <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Balance</span>
                 <span className="block text-xl font-black text-slate-900 tabular-nums tracking-tighter">₹2,42,850</span>
              </div>
           </div>
           
           <div className="flex items-center gap-5 p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                 <HugeiconsIcon icon={TrendingUp} className="size-6" />
              </div>
              <div className="text-left space-y-0.5">
                 <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Performance</span>
                 <span className="block text-xl font-black text-emerald-600 tracking-tighter">+12.4%</span>
              </div>
           </div>

           <div className="flex items-center gap-5 p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                 <HugeiconsIcon icon={Analytics01Icon} className="size-6" />
              </div>
              <div className="text-left space-y-0.5">
                 <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">Status</span>
                 <span className="block text-xl font-black text-slate-900 tracking-tighter uppercase">Live</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
