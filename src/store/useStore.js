import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      darkMode: true,
      toggleDarkMode: () => {
        const next = !get().darkMode
        set({ darkMode: next })
        document.documentElement.classList.toggle('dark', next)
        document.documentElement.classList.toggle('light', !next)
      },

      // Canvas slides
      slides: [null],
      currentSlide: 0,
      currentFormat: 'portrait',
      setSlides: (s) => set({ slides: s }),
      setCurrentSlide: (i) => set({ currentSlide: i }),
      setFormat: (f) => set({ currentFormat: f }),
      addSlide: () => {
        const slides = [...get().slides, null]
        set({ slides, currentSlide: slides.length - 1 })
      },
      saveCurrentSlide: (json) => {
        const slides = [...get().slides]
        slides[get().currentSlide] = json
        set({ slides })
      },

      // Studio slides (from generator → editor)
      studioSlides: null,
      setStudioSlides: (s) => set({ studioSlides: s }),
      clearStudioSlides: () => set({ studioSlides: null }),

      // Gallery
      projects: [],
      setProjects: (p) => set({ projects: p }),
    }),
    {
      name: 'aure-store',
      partialize: (s) => ({
        darkMode: s.darkMode,
        slides: s.slides,
        currentFormat: s.currentFormat,
        projects: s.projects,
      }),
    }
  )
)
