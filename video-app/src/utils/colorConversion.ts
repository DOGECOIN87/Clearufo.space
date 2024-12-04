// Convert RGB to HSV color space
export const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  let s = max === 0 ? 0 : diff / max
  let v = max

  if (diff !== 0) {
    switch (max) {
      case r:
        h = 60 * ((g - b) / diff + (g < b ? 6 : 0))
        break
      case g:
        h = 60 * ((b - r) / diff + 2)
        break
      case b:
        h = 60 * ((r - g) / diff + 4)
        break
    }
  }

  // Normalize hue to 0-255 range for visualization
  h = Math.round((h / 360) * 255)
  s = Math.round(s * 255)
  v = Math.round(v * 255)

  return [h, s, v]
}