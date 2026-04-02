'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
        <h1 className="text-4xl md:text-6xl font-black mb-12 tracking-tight">Terms of Service</h1>
        
        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using CreaterOS, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Use of Service</h2>
            <p>CreaterOS provides AI-driven content creation tools. You are responsible for the content you create and publish using our tools.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Privacy Policy</h2>
            <p>Your use of the service is also governed by our Privacy Policy, which is incorporated into these terms by reference.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Liability</h2>
            <p>CreaterOS is provided "as is" without any warranties. We are not liable for any damages resulting from your use of the service.</p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
