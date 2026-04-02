'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  { q: "Is CreaterOS free to use?", a: "Yes, we have a generous free tier for beginners. As you grow and need more AI ideas or higher quality exports, you can upgrade to a Pro or Agency plan." },
  { q: "Do I need technical skills?", a: "Not at all. CreaterOS is built for creators, not developers. Our AI handles the scripts, editing, and scheduling so you can focus on being on camera." },
  { q: "Which platforms do you support?", a: "Currently we support YouTube (Shorts & Long-form) and Instagram. TikTok support is coming soon!" },
  { q: "How long does it take to make a video?", a: "From idea to export, it typically takes less than 3 minutes. The AI handles most of the heavy lifting." },
  { q: "Can I cancel my subscription any time?", a: "Absolutely. No hidden fees or long-term contracts. You can cancel or upgrade your plan whenever you like." },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 px-6 md:px-10 max-w-4xl mx-auto">
      <div className="text-center mb-16">
         <h2 className="text-3xl md:text-5xl font-black mb-6">Frequently asked questions.</h2>
         <p className="text-white/40">Got a question? We've got answers.</p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <div key={i} className="border border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="text-lg font-bold">{faq.q}</span>
              <motion.div
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={20} className="text-white/50" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 pt-0 text-white/50 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
