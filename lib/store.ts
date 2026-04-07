import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCookie, setCookie, removeCookie } from './cookies'
import type { IdeaVariant } from './api'
import type { Niche, Platform } from '@/types'

interface StudioState {
  prompt: string
  niche: Niche
  platforms: Platform[]
  ideas: IdeaVariant[]
  setPrompt: (prompt: string) => void
  setNiche: (niche: Niche) => void
  setPlatforms: (platforms: Platform[]) => void
  setIdeas: (ideas: IdeaVariant[]) => void
  reset: () => void
}

// Custom storage for JSON serialization with cookies
const cookieStorage = {
  getItem: (name: string): string | null => {
    return getCookie(name)
  },
  setItem: (name: string, value: string): void => {
    setCookie(name, value, 7) // expires in 7 days
  },
  removeItem: (name: string): void => {
    removeCookie(name)
  },
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      prompt: '',
      niche: 'finance',
      platforms: ['youtube'],
      ideas: [],
      setPrompt: (prompt) => set({ prompt }),
      setNiche: (niche) => set({ niche }),
      setPlatforms: (platforms) => set({ platforms }),
      setIdeas: (ideas) => set({ ideas }),
      reset: () => set({ prompt: '', niche: 'finance', platforms: ['youtube'], ideas: [] }),
    }),
    {
      name: 'studio-storage',
      storage: createJSONStorage(() => cookieStorage),
    }
  )
)
