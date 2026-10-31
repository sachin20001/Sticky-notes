export function getLogicalLines(content: string): string[] {
  return content.split('\n')
}

export function getCopyableLine(content: string, index: number): string | null {
  const line = getLogicalLines(content)[index]
  return line?.trim() ? line : null
}
