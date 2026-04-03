'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: '0',
    desc: 'For hobbyists dipping their toes.',
    features: ['5 AI Ideas / day', 'Basic Scripting', '720p Exports', 'Standard Support'],
    color: '#fff',
    bg: 'rgba(255,255,255,0.03)',
  },
  {
    name: 'Creator',
    price: '100',
    unit: '/mo',
    desc: 'For serious creators going viral.',
    features: ['20 AI Ideas / day', 'Premium Scripting + Shot List', '4K Exports', 'AI Auto-Edit + Captions', 'Priority Support'],
    color: '#7c6af5',
    bg: 'rgba(124,106,245,0.08)',
    popular: true,
  },
  {
    name: 'Pro',
    price: '350',
    unit: '/mo',
    desc: 'For teams managing multiple brands.',
    features: ['Unlimited AI Ideas', 'Advanced Multi-brand Dashboard', 'White-label Reports', 'Dedicated Manager', 'API Access'],
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
  },
]

export function PricingSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-black uppercase tracking-[0.2em] text-[#7c6af5] mb-4"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6"
          >
            Simple, transparent pricing.
          </motion.h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Choose the plan that fits your creation speed. Scale as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative p-8 rounded-[2.5rem] border border-white/10 flex flex-col ${plan.popular ? 'bg-white/[0.04]' : ''}`}
              style={{ background: plan.bg }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#7c6af5] text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-black mb-2" style={{ color: plan.color }}>{plan.name}</h3>
                <p className="text-sm text-white/40">{plan.desc}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-black">₹{plan.price}</span>
                {plan.unit && <span className="text-white/40 text-sm font-medium">{plan.unit}</span>}
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
                      <Check size={12} style={{ color: plan.color }} />
                    </div>
                    <span className="text-sm text-white/70">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-4 rounded-2xl font-black transition-all ${plan.popular
                    ? 'bg-gradient-to-br from-[#7c6af5] to-[#ec4899] text-white shadow-xl hover:scale-[1.02]'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                  }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
