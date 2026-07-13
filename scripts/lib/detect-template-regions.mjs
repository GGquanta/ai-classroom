/** @typedef {{ x: number, y: number, width: number, height: number }} TemplateRegion */
/** @typedef {{ title: TemplateRegion, qr: TemplateRegion }} TemplateRegions */

const BLANK_THRESHOLD = 235
const REGION_PADDING_RATIO = 0.06

/** Calibrated from share.png (1344×576). */
const FALLBACK_TITLE = { x: 21, y: 16, width: 1301, height: 208 }
const FALLBACK_QR = { x: 1015, y: 258, width: 270, height: 271 }
const FALLBACK_WIDTH = 1344
const FALLBACK_HEIGHT = 576

/**
 * @param {Uint8ClampedArray} data
 * @param {number} index
 */
function isBlankPixel(data, index) {
  return (
    data[index] > BLANK_THRESHOLD &&
    data[index + 1] > BLANK_THRESHOLD &&
    data[index + 2] > BLANK_THRESHOLD
  )
}

/**
 * @param {TemplateRegion} region
 */
function applyPadding(region) {
  const padX = Math.round(region.width * REGION_PADDING_RATIO)
  const padY = Math.round(region.height * REGION_PADDING_RATIO)
  return {
    x: region.x + padX,
    y: region.y + padY,
    width: Math.max(1, region.width - padX * 2),
    height: Math.max(1, region.height - padY * 2),
  }
}

/**
 * @param {number} width
 * @param {number} height
 * @returns {TemplateRegions}
 */
export function fallbackRegions(width, height) {
  const scaleX = width / FALLBACK_WIDTH
  const scaleY = height / FALLBACK_HEIGHT

  const scaleRegion = (region) => ({
    x: Math.round(region.x * scaleX),
    y: Math.round(region.y * scaleY),
    width: Math.round(region.width * scaleX),
    height: Math.round(region.height * scaleY),
  })

  return {
    title: applyPadding(scaleRegion(FALLBACK_TITLE)),
    qr: applyPadding(scaleRegion(FALLBACK_QR)),
  }
}

/**
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {number} y
 * @param {number} xMin
 * @param {number} xMax
 */
function rowBlankSpan(data, width, y, xMin, xMax) {
  let start = -1
  let end = -1
  for (let x = xMin; x < xMax; x++) {
    const idx = (y * width + x) * 4
    if (isBlankPixel(data, idx)) {
      if (start === -1) start = x
      end = x
    }
  }
  if (start === -1) return null
  return { start, end }
}

/**
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {number} height
 */
function detectTitleRegion(data, width, height) {
  const yLimit = Math.floor(height * 0.55)
  let best = null
  let bestSpan = 0
  let blockStart = -1

  for (let y = 0; y < yLimit; y++) {
    const span = rowBlankSpan(data, width, y, 0, width)
    const isWide = span !== null && span.end - span.start > width * 0.5

    if (isWide && blockStart === -1) {
      blockStart = y
    } else if (!isWide && blockStart !== -1) {
      const blockHeight = y - blockStart
      const midY = blockStart + Math.floor(blockHeight / 2)
      const midSpan = rowBlankSpan(data, width, midY, 0, width)
      if (midSpan) {
        const spanWidth = midSpan.end - midSpan.start
        if (spanWidth > bestSpan) {
          bestSpan = spanWidth
          best = {
            x: midSpan.start,
            y: blockStart,
            width: spanWidth,
            height: blockHeight,
          }
        }
      }
      blockStart = -1
    }
  }

  if (blockStart !== -1) {
    const blockHeight = yLimit - blockStart
    const midY = blockStart + Math.floor(blockHeight / 2)
    const midSpan = rowBlankSpan(data, width, midY, 0, width)
    if (midSpan) {
      const spanWidth = midSpan.end - midSpan.start
      if (spanWidth > bestSpan) {
        best = {
          x: midSpan.start,
          y: blockStart,
          width: spanWidth,
          height: blockHeight,
        }
      }
    }
  }

  return best
}

/**
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {number} height
 */
function detectQrRegion(data, width, height) {
  const xMin = Math.floor(width * 0.55)
  const yMin = Math.floor(height * 0.4)
  let best = null
  let bestArea = 0
  const step = Math.max(4, Math.floor(Math.min(width, height) / 80))

  for (let y = yMin; y < height; y += step) {
    for (let x = xMin; x < width; x += step) {
      const idx = (y * width + x) * 4
      if (!isBlankPixel(data, idx)) continue

      let maxX = x
      let maxY = y
      while (maxX + 1 < width && isBlankPixel(data, ((y * width) + maxX + 1) * 4)) {
        maxX++
      }
      while (maxY + 1 < height && isBlankPixel(data, (((maxY + 1) * width) + x) * 4)) {
        maxY++
      }

      const regionWidth = maxX - x + 1
      const regionHeight = maxY - y + 1
      const area = regionWidth * regionHeight

      if (area > bestArea && regionWidth > width * 0.1 && regionHeight > height * 0.15) {
        bestArea = area
        best = { x, y, width: regionWidth, height: regionHeight }
      }
    }
  }

  return best
}

/**
 * @param {ImageData} imageData
 * @param {number} width
 * @param {number} height
 * @returns {TemplateRegions}
 */
export function detectTemplateRegions(imageData, width, height) {
  const { data } = imageData
  const title = detectTitleRegion(data, width, height)
  const qr = detectQrRegion(data, width, height)

  if (!title || !qr) {
    return fallbackRegions(width, height)
  }

  return {
    title: applyPadding(title),
    qr: applyPadding(qr),
  }
}
