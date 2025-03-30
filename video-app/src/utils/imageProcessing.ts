// Function to adjust exposure of an image
export const adjustExposure = (data: Uint8ClampedArray, exposureValue: number): void => {
  // Skip alpha channel (every 4th value)
  for (let i = 0; i < data.length; i += 4) {
    // Apply exposure adjustment to RGB channels
    // For positive exposure, we brighten the image
    // For negative exposure, we darken the image
    const factor = Math.pow(2, exposureValue / 25); // Even more aggressive adjustment
    
    // Apply the exposure adjustment to each RGB channel
    data[i] = Math.min(255, Math.max(0, Math.round(data[i] * factor)));
    data[i + 1] = Math.min(255, Math.max(0, Math.round(data[i + 1] * factor)));
    data[i + 2] = Math.min(255, Math.max(0, Math.round(data[i + 2] * factor)));
  }
}

// Helper function to calculate histogram
export const calculateHistogram = (data: Uint8ClampedArray): number[] => {
  const histogram = new Array(256).fill(0)
  for (let i = 0; i < data.length; i += 4) {
    const value = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3)
    histogram[value]++
  }
  return histogram
}

// Helper function to calculate cumulative distribution function
export const calculateCDF = (histogram: number[]): number[] => {
  const cdf = new Array(256).fill(0)
  cdf[0] = histogram[0]
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + histogram[i]
  }
  return cdf
}

// Function to perform histogram equalization on a region
const equalizeRegion = (data: Uint8ClampedArray, width: number, startX: number, startY: number, tileWidth: number, tileHeight: number): number[] => {
  const histogram = new Array(256).fill(0)
  
  // Calculate histogram for the region
  for (let y = startY; y < startY + tileHeight; y++) {
    for (let x = startX; x < startX + tileWidth; x++) {
      const idx = (y * width + x) * 4
      const value = Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3)
      histogram[value]++
    }
  }

  // Calculate CDF
  const cdf = calculateCDF(histogram)
  const cdfMin = cdf.find(x => x > 0) || 0
  const total = tileWidth * tileHeight

  // Create lookup table
  const lookupTable = new Array(256)
  for (let i = 0; i < 256; i++) {
    lookupTable[i] = Math.round(((cdf[i] - cdfMin) / (total - cdfMin)) * 255)
  }

  return lookupTable
}

// Bilinear interpolation function
const interpolate = (x: number, x1: number, x2: number, q11: number, q21: number): number => {
  return Math.round(q11 * (x2 - x) / (x2 - x1) + q21 * (x - x1) / (x2 - x1))
}

// CLAHE implementation
export const applyCLAHE = (data: Uint8ClampedArray, width: number, height: number): void => {
  const TILE_SIZE = 32 // Size of each tile
  const numXTiles = Math.ceil(width / TILE_SIZE)
  const numYTiles = Math.ceil(height / TILE_SIZE)
  const lookupTables: number[][][] = []

  // Calculate lookup tables for each tile
  for (let tileY = 0; tileY < numYTiles; tileY++) {
    lookupTables[tileY] = []
    for (let tileX = 0; tileX < numXTiles; tileX++) {
      const startX = tileX * TILE_SIZE
      const startY = tileY * TILE_SIZE
      const tileWidth = Math.min(TILE_SIZE, width - startX)
      const tileHeight = Math.min(TILE_SIZE, height - startY)
      
      lookupTables[tileY][tileX] = equalizeRegion(data, width, startX, startY, tileWidth, tileHeight)
    }
  }

  // Apply interpolated transformation
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileX = Math.floor(x / TILE_SIZE)
      const tileY = Math.floor(y / TILE_SIZE)
      const idx = (y * width + x) * 4
      const value = Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3)

      let newValue: number

      // If pixel is in a corner tile
      if ((tileX === 0 || tileX === numXTiles - 1) && (tileY === 0 || tileY === numYTiles - 1)) {
        newValue = lookupTables[tileY][tileX][value]
      }
      // If pixel is in edge tile
      else if (tileX === 0 || tileX === numXTiles - 1 || tileY === 0 || tileY === numYTiles - 1) {
        const nextTileX = Math.min(tileX + 1, numXTiles - 1)
        newValue = interpolate(
          x,
          tileX * TILE_SIZE,
          (tileX + 1) * TILE_SIZE,
          lookupTables[tileY][tileX][value],
          lookupTables[tileY][nextTileX][value]
        )
      }
      // If pixel is in middle tiles
      else {
        const q11 = lookupTables[tileY][tileX][value]
        const q21 = lookupTables[tileY][tileX + 1][value]
        const q12 = lookupTables[tileY + 1][tileX][value]
        const q22 = lookupTables[tileY + 1][tileX + 1][value]

        const x1 = tileX * TILE_SIZE
        const x2 = (tileX + 1) * TILE_SIZE
        const y1 = tileY * TILE_SIZE
        const y2 = (tileY + 1) * TILE_SIZE

        const r1 = interpolate(x, x1, x2, q11, q21)
        const r2 = interpolate(x, x1, x2, q12, q22)
        newValue = interpolate(y, y1, y2, r1, r2)
      }

      data[idx] = newValue
      data[idx + 1] = newValue
      data[idx + 2] = newValue
    }
  }
}
