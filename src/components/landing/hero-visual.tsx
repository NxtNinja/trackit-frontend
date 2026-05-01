"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Wallet01Icon, 
  ChartRingIcon, 
  Analytics01Icon, 
  ZapIcon,
  CreditCardIcon 
} from "@hugeicons/core-free-icons"

export function HeroVisual() {
  return (
    <div className="lg:col-span-6 relative flex justify-center lg:justify-end py-12 lg:py-0">
      <div className="relative w-full max-w-[500px] aspect-[4/3] perspective-[2000px]">
        
        {/* Main Dashboard Prism */}
        <motion.div 
          initial={{ rotateY: 20, rotateX: 10, x: 20, opacity: 0 }}
          animate={{ rotateY: -15, rotateX: 5, x: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative w-full h-full transform-style-3d"
        >
          {/* Card 1: The Base Analytics (Bottom Left) */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[10%] left-0 w-[240px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-2xl z-10"
          >
             <div className="flex items-center justify-between mb-6">
                <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                   <HugeiconsIcon icon={Analytics01Icon} className="size-5" />
                </div>
                <div className="h-1.5 w-12 bg-white/10 rounded-full" />
             </div>
             <div className="space-y-3">
                <div className="h-2 w-full bg-white/5 rounded-full" />
                <div className="h-2 w-2/3 bg-white/5 rounded-full" />
             </div>
          </motion.div>

          {/* Card 2: Total Balance (Top Right) */}
          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-[5%] right-0 w-[280px] bg-white p-8 rounded-[40px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] z-30"
          >
             <div className="flex items-center gap-3 text-slate-400 mb-4">
                <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center">
                   <HugeiconsIcon icon={Wallet01Icon} className="size-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Global Balance</span>
             </div>
             <div className="text-3xl font-black text-slate-900 tracking-tighter">₹1,24,850.00</div>
             <div className="mt-6 flex gap-2">
                <div className="h-1.5 flex-1 bg-emerald-500/20 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "70%" }}
                     transition={{ duration: 2, delay: 1 }}
                     className="h-full bg-emerald-500"
                   />
                </div>
                <div className="h-1.5 w-12 bg-slate-100 rounded-full" />
             </div>
          </motion.div>

          {/* Card 3: Recent Transaction (Middle) */}
          <motion.div 
            animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-2xl z-20 flex items-center gap-4"
          >
             <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <HugeiconsIcon icon={CreditCardIcon} className="size-5" />
             </div>
             <div>
                <span className="block text-[10px] font-black text-white/40 uppercase tracking-widest">Latest</span>
                <span className="block text-sm font-bold text-white tracking-tight">Apple Store</span>
             </div>
          </motion.div>

          {/* Floating Accents */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-10 -right-10 size-32 bg-primary/20 rounded-full blur-3xl"
          />
        </motion.div>

        {/* Ambient Floor Shadow */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-slate-950/50 rounded-full blur-3xl -z-10" />
      </div>
    </div>
  )
}
