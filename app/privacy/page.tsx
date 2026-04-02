'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#08080f] text-white p-6 md:p-20 font-sans">
      <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-12 transition-colors">
        <ArrowLeft size={16} /> Back to Home
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-black mb-12 tracking-tight">Privacy Policy</h1>
        
        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Information Collection</h2>
            <p>We collect information you provide to us directly through the service. This may include your name, email, and social media handles.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Use of Information</h2>
            <p>We use your information to provide and improve the service and to communicate with you about your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Data Security</h2>
            <p>We take reasonable measures to protect your information from unauthorized access, use, or disclosure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Sharing Information</h2>
            <p>We do not share your information with third parties except as required by law or to provide the service.</p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
