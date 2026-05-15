import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // Theme
      darkMode: false,
      toggleDarkMode: () => {
        const next = !get().darkMode
        set({ darkMode: next })
        document.documentElement.classList.toggle('dark', next)
      },

      // Language
      language: 'es',
      setLanguage: (lang) => set({ language: lang }),

      // Auth
      user: null,
      setUser: (user) => set({ user }),

      // Canvas state
      currentFormat: 'square',
      setFormat: (format) => set({ currentFormat: format }),

      canvasJson: null,
      setCanvasJson: (json) => set({ canvasJson: json }),

      // Carousel slides
      slides: [null],
      currentSlide: 0,
      setSlides: (slides) => set({ slides }),
      setCurrentSlide: (idx) => set({ currentSlide: idx }),
      addSlide: () => {
        const slides = [...get().slides, null]
        set({ slides, currentSlide: slides.length - 1 })
      },
      removeSlide: (idx) => {
        const slides = get().slides.filter((_, i) => i !== idx)
        set({ slides: slides.length ? slides : [null], currentSlide: 0 })
      },
      saveCurrentSlide: (json) => {
        const slides = [...get().slides]
        slides[get().currentSlide] = json
        set({ slides })
      },

      // Service API keys (stored locally only)
      apiKeys: {},
      setApiKey: (service, key) =>
        set((s) => ({ apiKeys: { ...s.apiKeys, [service]: key } })),

      // AI image results
      aiResults: [],
      setAiResults: (results) => set({ aiResults: results }),
      addAiResult: (result) => set((s) => ({ aiResults: [result, ...s.aiResults.slice(0, 19)] })),

      // Projects (local cache)
      projects: [],
      setProjects: (projects) => set({ projects }),
    }),
    {
      name: 'social-canvas-store',
      partialize: (s) => ({
        darkMode: s.darkMode,
        language: s.language,
        apiKeys: s.apiKeys,
        slides: s.slides,
        currentFormat: s.currentFormat,
        projects: s.projects,
      }),
    }
  )
)
