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

// Convert RGB to CMYK Cyan channel (grayscale)
export const rgbToCmykC = (r: number, g: number, b: number): number => {
  // Normalize RGB to 0-1
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255

  // Calculate K (black)
  const k = 1 - Math.max(rr, gg, bb)

  // Handle pure black case
  if (k === 1) {
    return 0
  }

  // Calculate Cyan with black removal
  const c = (1 - rr - k) / (1 - k)

  // Convert to grayscale (0-255)
  // For CMYK channels, higher values mean more ink/darker colors
  return Math.round(c * 255)
}

// Convert RGB to CMYK Magenta channel (grayscale)
export const rgbToCmykM = (r: number, g: number, b: number): number => {
  // Normalize RGB to 0-1
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255

  // Calculate K (black)
  const k = 1 - Math.max(rr, gg, bb)

  // Handle pure black case
  if (k === 1) {
    return 0
  }

  // Calculate Magenta with black removal
  const m = (1 - gg - k) / (1 - k)

  // Convert to grayscale (0-255)
  // For CMYK channels, higher values mean more ink/darker colors
  return Math.round(m * 255)
}

// Convert RGB to CMYK Yellow channel (grayscale)
export const rgbToCmykY = (r: number, g: number, b: number): number => {
  // Normalize RGB to 0-1
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255

  // Calculate K (black)
  const k = 1 - Math.max(rr, gg, bb)

  // Handle pure black case
  if (k === 1) {
    return 0
  }

  // Calculate Yellow with black removal
  const y = (1 - bb - k) / (1 - k)

  // Convert to grayscale (0-255)
  // For CMYK channels, higher values mean more ink/darker colors
  return Math.round(y * 255)
}
