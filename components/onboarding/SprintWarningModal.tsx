'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Flame, X, ArrowRight, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SprintWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function SprintWarningModal({ isOpen, onClose, onConfirm }: SprintWarningModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm overflow-hidden bg-[#0f1115] border border-white/10 rounded-[2rem] shadow-2xl"
          >
            {/* Gradient Glow */}
            <div className="absolute -top-24 -left-20 w-48 h-48 bg-accent/20 rounded-full blur-[60px]" />
            <div className="absolute -bottom-24 -right-20 w-48 h-48 bg-pink-500/10 rounded-full blur-[60px]" />

            <div className="relative p-8">
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>

              {/* Icon & Title */}
              <div className="mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mb-6 mx-auto">
                  <RefreshCcw size={28} className="animate-spin-slow" />
                </div>
                <h3 className="text-xl font-black text-white text-center leading-tight mb-2">
                  Restart your sprint?
                </h3>
                <p className="text-sm text-slate-400 text-center leading-relaxed">
                  Changing your niche will restart your 30-day <span className="text-white font-semibold">Creator Sprint</span> roadmap with new tailored ideas.
                </p>
              </div>

              {/* Warning Box */}
              <div className="flex items-start gap-3 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl mb-8">
                <AlertCircle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-200/80 leading-relaxed">
                  Your current progress and streak will be reset. This action cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={onConfirm}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-accent to-[#ec4899] text-white font-black text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20"
                >
                  <Flame size={16} />
                  Continue & Restart
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3.5 text-sm font-semibold text-slate-500 hover:text-white transition-colors"
                >
                  Go back
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
