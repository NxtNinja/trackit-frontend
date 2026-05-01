"use client"

import * as React from "react"
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion"
import Link from "next/link"
import { 
  Leaf, 
  Wallet, 
  PieChart,
  PlusCircle,
  Utensils,
  CheckCircle2,
  BarChart3,
  Plus,
  Folder,
  LayoutDashboard,
  ArrowRight
} from "lucide-react"
import { Button } from "../ui/button"

export function VisualDemo({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [step, setStep] = React.useState(0)
  const [showToast, setShowToast] = React.useState(false)
  
  const springValue = useSpring(12450, { stiffness: 40, damping: 20 })
  const displayAmount = useTransform(springValue, (latest) => 
    Math.floor(latest).toLocaleString('en-IN', { minimumFractionDigits: 0 })
  )

  React.useEffect(() => {
    const sequence = async () => {
      setStep(0)
      springValue.set(12450)
      await new Promise(r => setTimeout(r, 1000))

      setStep(1) // Capture
      await new Promise(r => setTimeout(r, 2000))
      
      setStep(2) // Classify
      setShowToast(true)
      await new Promise(r => setTimeout(r, 1000))
      
      setStep(3) // Update
      springValue.set(12950)
      await new Promise(r => setTimeout(r, 3000))
      
      setShowToast(false)
    }

    const timer = setInterval(sequence, 8000)
    sequence()
    return () => clearInterval(timer)
  }, [springValue])

  const features = [
    { 
      id: 1, 
      icon: Plus, 
      title: "Effortless Logging", 
      desc: "Log transactions in seconds." 
    },
    { 
      id: 2, 
      icon: Folder, 
      title: "Total Organization", 
      desc: "Group spending into categories." 
    },
    { 
      id: 3, 
      icon: LayoutDashboard, 
      title: "Instant Visibility", 
      desc: "Live updates as you spend." 
    }
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Column: Hero Narrative & Simulation Sync */}
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <BarChart3 className="size-3" />
              <span>Personal Ledger</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Simplicity in every <br />
              <span className="text-primary italic">transaction.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-md">
              A high-fidelity financial ecosystem designed for total control. Track, organize, and grow with a private ledger.
            </p>
          </div>

          {/* Mini-steps (Sync with animation) */}
          <div className="grid grid-cols-1 gap-6 pt-8 border-t border-slate-100">
            {features.map((feature) => (
              <motion.div 
                key={feature.id}
                animate={{ 
                  opacity: step === feature.id || (step === 0 && feature.id === 1) ? 1 : 0.3,
                  x: step === feature.id || (step === 0 && feature.id === 1) ? 10 : 0
                }}
                className="flex items-center gap-4"
              >
                <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${step === feature.id || (step === 0 && feature.id === 1) ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-400"}`}>
                  <feature.icon strokeWidth={2.5} className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{feature.title}</h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: The Simulation */}
        <div className="lg:col-span-7 relative">
          <div className="absolute -top-20 -right-20 size-[500px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 size-[300px] bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

          <div className="relative bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden flex flex-col md:flex-row h-[480px] z-10">
            
            <div className="absolute top-6 left-8 flex gap-2 z-50">
              <div className="size-2.5 rounded-full bg-slate-200" />
              <div className="size-2.5 rounded-full bg-slate-200" />
              <div className="size-2.5 rounded-full bg-slate-200" />
            </div>

            <div className="w-full md:w-[45%] p-10 border-r border-slate-50 flex flex-col justify-between pt-16">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                   <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                      <Leaf className="size-5" />
                   </div>
                   <div className="space-y-0.5">
                      <span className="block text-xs font-black text-slate-900 tracking-tight">TrackIt</span>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Main Account</span>
                   </div>
                </div>
                
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Recent Activity</h4>
                  <div className="space-y-4">
                     {[1, 2].map(i => (
                       <div key={i} className="h-14 w-full bg-slate-50/50 rounded-2xl border border-dashed border-slate-100" />
                     ))}
                     
                     <AnimatePresence>
                       {step >= 1 && (
                         <motion.div
                           initial={{ opacity: 0, x: -10, scale: 0.95 }}
                           animate={{ opacity: 1, x: 0, scale: 1 }}
                           exit={{ opacity: 0, x: -10 }}
                           className="h-16 w-full bg-white border border-slate-100 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.04)] rounded-2xl p-4 flex items-center justify-between"
                         >
                           <div className="flex items-center gap-4">
                             <div className="size-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                               <Utensils className="size-5" />
                             </div>
                             <div>
                                <span className="block text-sm font-bold text-slate-800">Lunch at Cafe</span>
                                <span className="block text-[10px] font-medium text-slate-400">Today, 1:42 PM</span>
                             </div>
                           </div>
                           <span className="text-sm font-black text-slate-900">-₹500.00</span>
                         </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
                </div>
              </div>
              <Button disabled className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold gap-3 shadow-xl shadow-slate-200">
                 <PlusCircle className="size-5" />
                 New Transaction
              </Button>
            </div>

            <div className="flex-1 p-10 bg-slate-50/30 space-y-10 pt-16 relative">
               <AnimatePresence>
                  {step === 2 && (
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 pointer-events-none"
                    />
                  )}
               </AnimatePresence>

               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Live Analytics</h4>
               </div>
               
               <div className="grid grid-cols-1 gap-8">
                  <motion.div 
                    animate={{ scale: step === 3 ? 1.02 : 1 }}
                    className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-3 shadow-sm"
                  >
                     <div className="flex items-center gap-2.5 text-slate-400">
                        <Wallet className="size-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Total Outflow</span>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-400 italic">₹</span>
                        <motion.span className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">
                          {displayAmount}
                        </motion.span>
                     </div>
                  </motion.div>

                  <div className="bg-white p-8 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-5">
                        <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary relative">
                           <PieChart className="size-6" />
                           {step === 2 && (
                             <motion.div 
                               className="absolute inset-0 rounded-2xl border-2 border-primary"
                               animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                               transition={{ duration: 1.5, repeat: Infinity }}
                             />
                           )}
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Top Category</p>
                           <p className="text-base font-bold text-slate-900">Food & Dining</p>
                        </div>
                     </div>
                  </div>
               </div>

               <AnimatePresence>
                  {showToast && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-10 left-10 right-10 bg-slate-950 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-50 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                         <div className="size-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="size-3" />
                         </div>
                         <span className="text-xs font-bold tracking-tight">Categorized</span>
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
