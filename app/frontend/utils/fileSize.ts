const UNITS = ["B", "KB", "MB", "GB"]

// 1536 -> "1.5 KB". One decimal below 10, none above.
export function formatFileSize(bytes: number) {
  let size = bytes
  let unit = 0
  while (size >= 1024 && unit < UNITS.length - 1) {
    size /= 1024
    unit += 1
  }
  const digits = unit === 0 || size >= 10 ? 0 : 1
  return `${size.toFixed(digits)} ${UNITS[unit]}`
}
