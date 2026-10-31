const { spawnSync } = require('node:child_process')
const { existsSync, readFileSync } = require('node:fs')
const { join } = require('node:path')

const electronDirectory = join(__dirname, '..', 'node_modules', 'electron')
const marker = join(electronDirectory, 'path.txt')

function hasBinary() {
  if (!existsSync(marker)) return false
  const relativePath = readFileSync(marker, 'utf8').trim()
  return relativePath.length > 0 && existsSync(join(electronDirectory, 'dist', relativePath))
}

if (!hasBinary()) {
  console.log('Electron binary is missing or incomplete; retrying its installer…')
  const installer = join(electronDirectory, 'install.js')
  const environment = { ...process.env, ELECTRON_SKIP_BINARY_DOWNLOAD: '' }
  const result = spawnSync(process.execPath, [installer], { stdio: 'inherit', env: environment })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

if (!hasBinary()) {
  console.error('Electron still has no desktop binary. Check your network/proxy settings, then run `npm rebuild electron`.')
  process.exit(1)
}
