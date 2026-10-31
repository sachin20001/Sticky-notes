import { app, BrowserWindow, clipboard, ipcMain } from 'electron'
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import { join } from 'node:path'

const dataPath = () => join(app.getPath('userData'), 'note.txt')
let saveQueue: Promise<void> = Promise.resolve()

async function createWindow() {
  const window = new BrowserWindow({
    width: 420,
    height: 560,
    minWidth: 320,
    minHeight: 360,
    title: 'QuickNote',
    backgroundColor: '#fff8dc',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    await window.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    await window.loadFile(join(__dirname, '../dist/index.html'))
  }
}

ipcMain.handle('note:load', async () => {
  try { return await readFile(dataPath(), 'utf8') }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return ''
    throw error
  }
})

ipcMain.handle('note:save', async (_event, content: unknown) => {
  if (typeof content !== 'string') throw new TypeError('Note content must be text')
  saveQueue = saveQueue.catch(() => undefined).then(async () => {
    const target = dataPath()
    const temporary = `${target}.tmp`
    await mkdir(app.getPath('userData'), { recursive: true })
    await writeFile(temporary, content, 'utf8')
    await rename(temporary, target)
  })
  return saveQueue
})

ipcMain.handle('clipboard:write', async (_event, content: unknown) => {
  if (typeof content !== 'string') throw new TypeError('Clipboard content must be text')
  clipboard.writeText(content)
})

app.whenReady().then(() => {
  void createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) void createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
