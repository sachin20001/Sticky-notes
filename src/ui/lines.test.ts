import { describe, expect, it } from 'vitest'
import { getCopyableLine, getLogicalLines } from './lines'

describe('logical note lines', () => {
  it('keeps neighboring lines separate and preserves the exact line text', () => {
    const note = '  https://example.test/x  \nsecond line'
    expect(getCopyableLine(note, 0)).toBe('  https://example.test/x  ')
    expect(getCopyableLine(note, 1)).toBe('second line')
  })

  it('does not offer blank or whitespace-only lines for copying', () => {
    expect(getCopyableLine('first\n\n  \nlast', 1)).toBeNull()
    expect(getCopyableLine('first\n\n  \nlast', 2)).toBeNull()
  })

  it('preserves long lines and trailing blank lines', () => {
    const longQuery = `SELECT ${'column,'.repeat(400)} id FROM loans;`
    expect(getLogicalLines(`${longQuery}\n`)).toEqual([longQuery, ''])
    expect(getCopyableLine(longQuery, 0)).toBe(longQuery)
  })
})
