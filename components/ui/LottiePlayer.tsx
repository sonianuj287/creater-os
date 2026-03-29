'use client'

import dynamic from 'next/dynamic'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

// ── Inline Lottie JSON data (lightweight, no external CDN) ────────────────────

// Pulsing brain/AI thinking animation
const LOADING_AI_LOTTIE = {
  "v": "5.7.4", "fr": 30, "ip": 0, "op": 60, "w": 200, "h": 200,
  "assets": [],
  "layers": [{
    "ddd": 0, "ind": 1, "ty": 4, "nm": "circle",
    "sr": 1, "ks": {
      "o": { "a": 1, "k": [{ "t": 0, "s": [100] }, { "t": 30, "s": [30] }, { "t": 60, "s": [100] }] },
      "r": { "a": 0, "k": 0 }, "p": { "a": 0, "k": [100, 100, 0] },
      "a": { "a": 0, "k": [0, 0, 0] }, "s": { "a": 1, "k": [{ "t": 0, "s": [100, 100, 100] }, { "t": 30, "s": [130, 130, 100] }, { "t": 60, "s": [100, 100, 100] }] }
    },
    "ao": 0, "ip": 0, "op": 60, "st": 0, "bm": 0,
    "shapes": [{
      "ty": "gr", "it": [
        { "ty": "el", "s": { "a": 0, "k": [80, 80] }, "p": { "a": 0, "k": [0, 0] } },
        { "ty": "st", "c": { "a": 0, "k": [0.486, 0.416, 0.961, 1] }, "o": { "a": 0, "k": 100 }, "w": { "a": 0, "k": 6 } },
        { "ty": "tr", "p": { "a": 0, "k": [0, 0] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
      ]
    }]
  }]
}

// Sparkle / idea burst animation
const IDEA_SPARKLE_LOTTIE = {
  "v": "5.7.4", "fr": 30, "ip": 0, "op": 90, "w": 200, "h": 200,
  "assets": [],
  "layers": [
    {
      "ddd": 0, "ind": 1, "ty": 4, "nm": "star1",
      "sr": 1, "ks": {
        "o": { "a": 1, "k": [{ "t": 0, "s": [0] }, { "t": 15, "s": [100] }, { "t": 45, "s": [100] }, { "t": 60, "s": [0] }] },
        "r": { "a": 1, "k": [{ "t": 0, "s": [0] }, { "t": 90, "s": [360] }] },
        "p": { "a": 1, "k": [{ "t": 0, "s": [100, 100, 0] }, { "t": 45, "s": [130, 70, 0] }] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 1, "k": [{ "t": 0, "s": [0, 0, 100] }, { "t": 15, "s": [100, 100, 100] }, { "t": 45, "s": [80, 80, 100] }, { "t": 60, "s": [0, 0, 100] }] }
      },
      "ao": 0, "ip": 0, "op": 90, "st": 0, "bm": 0,
      "shapes": [{
        "ty": "gr", "it": [
          { "ty": "sr", "p": { "a": 0, "k": [0, 0] }, "r": { "a": 0, "k": 0 }, "pt": { "a": 0, "k": 5 }, "is": { "a": 0, "k": 50 }, "or": { "a": 0, "k": 20 }, "ir": { "a": 0, "k": 10 }, "sy": 1 },
          { "ty": "fl", "c": { "a": 0, "k": [0.961, 0.286, 0.600, 1] }, "o": { "a": 0, "k": 100 } },
          { "ty": "tr", "p": { "a": 0, "k": [0, 0] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
        ]
      }]
    },
    {
      "ddd": 0, "ind": 2, "ty": 4, "nm": "star2",
      "sr": 1, "ks": {
        "o": { "a": 1, "k": [{ "t": 10, "s": [0] }, { "t": 25, "s": [100] }, { "t": 55, "s": [100] }, { "t": 70, "s": [0] }] },
        "r": { "a": 1, "k": [{ "t": 0, "s": [0] }, { "t": 90, "s": [-360] }] },
        "p": { "a": 1, "k": [{ "t": 10, "s": [100, 100, 0] }, { "t": 55, "s": [70, 130, 0] }] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 1, "k": [{ "t": 10, "s": [0, 0, 100] }, { "t": 25, "s": [80, 80, 100] }, { "t": 55, "s": [60, 60, 100] }, { "t": 70, "s": [0, 0, 100] }] }
      },
      "ao": 0, "ip": 0, "op": 90, "st": 0, "bm": 0,
      "shapes": [{
        "ty": "gr", "it": [
          { "ty": "sr", "p": { "a": 0, "k": [0, 0] }, "r": { "a": 0, "k": 0 }, "pt": { "a": 0, "k": 4 }, "is": { "a": 0, "k": 50 }, "or": { "a": 0, "k": 15 }, "ir": { "a": 0, "k": 7 }, "sy": 1 },
          { "ty": "fl", "c": { "a": 0, "k": [0.486, 0.416, 0.961, 1] }, "o": { "a": 0, "k": 100 } },
          { "ty": "tr", "p": { "a": 0, "k": [0, 0] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
        ]
      }]
    }
  ]
}

// Upload / send-upward animation
const UPLOAD_LOTTIE = {
  "v": "5.7.4", "fr": 30, "ip": 0, "op": 60, "w": 200, "h": 200,
  "assets": [],
  "layers": [{
    "ddd": 0, "ind": 1, "ty": 4, "nm": "arrow",
    "sr": 1, "ks": {
      "o": { "a": 0, "k": 100 }, "r": { "a": 0, "k": 0 },
      "p": { "a": 1, "k": [{ "t": 0, "s": [100, 120, 0] }, { "t": 30, "s": [100, 80, 0] }, { "t": 60, "s": [100, 120, 0] }] },
      "a": { "a": 0, "k": [0, 0, 0] }, "s": { "a": 0, "k": [100, 100, 100] }
    },
    "ao": 0, "ip": 0, "op": 60, "st": 0, "bm": 0,
    "shapes": [{
      "ty": "gr", "it": [
        {
          "ty": "sh", "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [0, 0]], "o": [[0, 0], [0, 0], [0, 0]], "v": [[-20, 20], [0, -20], [20, 20]], "c": false } }
        },
        { "ty": "st", "c": { "a": 0, "k": [0.024, 0.714, 0.533, 1] }, "o": { "a": 0, "k": 100 }, "w": { "a": 0, "k": 8 } },
        { "ty": "tr", "p": { "a": 0, "k": [0, 0] }, "a": { "a": 0, "k": [0, 0] }, "s": { "a": 0, "k": [100, 100] }, "r": { "a": 0, "k": 0 }, "o": { "a": 0, "k": 100 } }
      ]
    }]
  }]
}

type LottiePreset = 'loading-ai' | 'idea-sparkle' | 'upload'

const PRESETS: Record<LottiePreset, object> = {
  'loading-ai': LOADING_AI_LOTTIE,
  'idea-sparkle': IDEA_SPARKLE_LOTTIE,
  'upload': UPLOAD_LOTTIE,
}

interface LottiePlayerProps {
  preset: LottiePreset
  size?: number
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export function LottiePlayer({ preset, size = 120, className = '', loop = true, autoplay = true }: LottiePlayerProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Lottie
        animationData={PRESETS[preset]}
        loop={loop}
        autoplay={autoplay}
        style={{ width: size, height: size }}
      />
    </div>
  )
}
