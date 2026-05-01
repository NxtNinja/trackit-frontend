"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Leaf01Icon } from "@hugeicons/core-free-icons"

export function BrandHeroVisual() {
  return (
    <div className="relative flex justify-center py-8">
       <motion.div
         animate={{ 
           y: [0, -20, 0],
           rotate: [0, 5, -5, 0]
         }}
         transition={{ 
           duration: 8, 
           repeat: Infinity, 
           ease: "easeInOut" 
         }}
         className="relative"
       >
          {/* The 3D Leaf */}
          <div className="size-32 md:size-48 bg-primary rounded-[40px] flex items-center justify-center text-white shadow-[0_40px_80px_-20px_rgba(20,71,230,0.4)] relative z-20">
             <HugeiconsIcon icon={Leaf01Icon} className="size-16 md:size-24" />
             
             {/* Pulse Effect */}
             <motion.div 
               animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="absolute inset-0 rounded-[40px] bg-primary -z-10"
             />
          </div>
          
          {/* Floating Data Particles */}
          {[1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -40, 0],
                x: [0, i % 2 === 0 ? 30 : -30, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 4 + i, 
                repeat: Infinity, 
                delay: i * 0.5 
              }}
              className="absolute size-2 bg-primary/20 rounded-full blur-sm"
              style={{ 
                top: `${20 + i * 15}%`, 
                left: `${10 + i * 20}%` 
              }}
            />
          ))}
       </motion.div>
    </div>
  )
}
