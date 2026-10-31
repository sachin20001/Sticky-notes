import { Check, Copy, Pin, StickyNote } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getCopyableLine } from './lines'

type HoveredLine = { index: number; top: number; left: number; highlightTop: number; highlightHeight: number } | null

export default function App() {
  const [content, setContent] = useState('')
  const [ready, setReady] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState<HoveredLine>(null)
  const [copiedLine, setCopiedLine] = useState<number | null>(null)
  const [copyFailed, setCopyFailed] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let active = true
    window.quickNote.load().then((saved) => {
      if (active) { setContent(saved); setReady(true) }
    }).catch(() => { if (active) { setLoadFailed(true); setReady(true) } })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!ready) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void window.quickNote.save(content).catch(() => undefined)
    }, 350)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [content, ready])

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current) }, [])

  const syncMirror = () => {
    const textarea = textareaRef.current
    const mirror = mirrorRef.current
    if (!textarea || !mirror) return
    mirror.scrollTop = textarea.scrollTop
    mirror.scrollLeft = textarea.scrollLeft
  }

  const handlePointerMove = (event: React.MouseEvent<HTMLElement>) => {
    const mirror = mirrorRef.current
    const textarea = textareaRef.current
    if (!mirror || !textarea) return
    const bounds = textarea.getBoundingClientRect()
    const y = event.clientY - bounds.top + textarea.scrollTop
    const blocks = Array.from(mirror.children) as HTMLElement[]
    const index = blocks.findIndex((block) => y >= block.offsetTop && y < block.offsetTop + block.offsetHeight)
    const line = getCopyableLine(content, index)
    if (index < 0 || line === null) { setHovered(null); return }
    const range = document.createRange()
    range.selectNodeContents(blocks[index])
    const textRows = Array.from(range.getClientRects())
    const lastTextRow = textRows.at(-1)
    if (!lastTextRow) { setHovered(null); return }
    const buttonSize = 32
    const blockBounds = blocks[index].getBoundingClientRect()
    const left = Math.min(lastTextRow.right - bounds.left + 5, bounds.width - buttonSize - 3)
    const top = lastTextRow.top - bounds.top + (lastTextRow.height - buttonSize) / 2
    setHovered({
      index,
      top,
      left,
      highlightTop: blockBounds.top - bounds.top,
      highlightHeight: blockBounds.height
    })
  }

  const copyLine = async (index: number) => {
    const line = getCopyableLine(content, index)
    if (line === null) return
    try {
      await window.quickNote.copy(line)
      setCopiedLine(index)
      setCopyFailed(false)
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
      feedbackTimer.current = setTimeout(() => setCopiedLine(null), 1300)
    } catch {
      setCopyFailed(true)
      setCopiedLine(null)
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
      feedbackTimer.current = setTimeout(() => setCopyFailed(false), 1800)
    }
  }

  const togglePin = async () => {
    try {
      setPinned(await window.quickNote.setAlwaysOnTop(!pinned))
    } catch {
      setPinned(false)
    }
  }

  const lineText = hovered ? getCopyableLine(content, hovered.index) ?? '' : ''

  return (
    <main className={`note-shell ${window.quickNote.platform === 'darwin' ? 'is-mac' : ''}`}>
      <header className="note-header">
        <div className="brand"><span className="brand-icon"><StickyNote size={16} /></span><span>QuickNote</span></div>
        <div className="header-actions">
          <button
            className={`pin-button ${pinned ? 'is-pinned' : ''}`}
            type="button"
            onClick={() => void togglePin()}
            aria-label={pinned ? 'Unpin window from always on top' : 'Keep window always on top'}
            aria-pressed={pinned}
            title={pinned ? 'Unpin window' : 'Keep on top'}
          >
            <Pin size={15} />
          </button>
          <span className="save-state" aria-live="polite">{loadFailed ? 'Couldn’t load note' : ready ? 'Saved automatically' : 'Loading note…'}</span>
        </div>
      </header>
      <section className="editor-wrap" aria-label="Sticky note editor" onMouseMove={handlePointerMove} onMouseLeave={() => setHovered(null)}>
        <div className="editor-mirror" ref={mirrorRef} aria-hidden="true">
          {content.split('\n').map((line, index) => <div className="mirror-line" key={index}>{line || '\u00a0'}</div>)}
        </div>
        {hovered && (
          <div
            className="hover-highlight"
            style={{ top: hovered.highlightTop, height: hovered.highlightHeight }}
            aria-hidden="true"
          />
        )}
        <textarea
          ref={textareaRef}
          className="note-editor"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onScroll={syncMirror}
          placeholder="Write something worth keeping…"
          aria-label="Your note"
          spellCheck={false}
          disabled={!ready || loadFailed}
        />
        {hovered && lineText.trim() && (
          <button
            className={`copy-button ${copiedLine === hovered.index ? 'is-copied' : ''}`}
            style={{ top: hovered.top, left: hovered.left }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => void copyLine(hovered.index)}
            aria-label={copiedLine === hovered.index ? 'Line copied' : `Copy line ${hovered.index + 1}`}
            title={copiedLine === hovered.index ? 'Copied' : 'Copy this line'}
          >
            {copiedLine === hovered.index ? <Check size={16} /> : <Copy size={15} />}
          </button>
        )}
      </section>
      <footer className="note-footer">
        <span>{copyFailed ? 'Couldn’t copy. Try again.' : copiedLine !== null ? 'Line copied to clipboard' : 'Hover over a line to copy it'}</span>
        <span className="line-count">{content.length.toLocaleString()} characters</span>
      </footer>
    </main>
  )
}
