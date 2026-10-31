/// <reference types="vite/client" />

interface Window {
  quickNote: {
    platform: string
    load: () => Promise<string>
    save: (content: string) => Promise<void>
    copy: (content: string) => Promise<void>
  }
}
