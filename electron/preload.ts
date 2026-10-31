import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('quickNote', {
  platform: process.platform,
  load: (): Promise<string> => ipcRenderer.invoke('note:load'),
  save: (content: string): Promise<void> => ipcRenderer.invoke('note:save', content),
  copy: (content: string): Promise<void> => ipcRenderer.invoke('clipboard:write', content)
})
