export interface TemplateRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface TemplateRegions {
  title: TemplateRegion
  qr: TemplateRegion
}

const BLANK_THRESHOLD = 235
const REGION_PADDING_RATIO = 0.06

function isBlankPixel(data: Uint8ClampedArray, index: number): boolean {
  return (
    data[index] > BLANK_THRESHOLD &&
    data[index + 1] > BLANK_THRESHOLD &&
    data[index + 2] > BLANK_THRESHOLD
  )
}

function applyPadding(region: TemplateRegion): TemplateRegion {
  const padX = Math.round(region.width * REGION_PADDING_RATIO)
  const padY = Math.round(region.height * REGION_PADDING_RATIO)
  return {
    x: region.x + padX,
    y: region.y + padY,
    width: Math.max(1, region.width - padX * 2),
    height: Math.max(1, region.height - padY * 2),
  }
}

function fallbackRegions(width: number, height: number): TemplateRegions {
  // Calibrated from share.png (1344×576): title y=16–223, qr ≈ 1015×258 270×271
  return {
    title: applyPadding({
      x: Math.round(width * 0.0156),
      y: Math.round(height * 0.0278),
      width: Math.round(width * 0.9688),
      height: Math.round(height * 0.3611),
    }),
    qr: applyPadding({
      x: Math.round(width * 0.7552),
      y: Math.round(height * 0.4479),
      width: Math.round(width * 0.2009),
      height: Math.round(height * 0.4705),
    }),
  }
}

function rowBlankSpan(
  data: Uint8ClampedArray,
  width: number,
  y: number,
  xMin: number,
  xMax: number,
): { start: number; end: number } | null {
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

function detectTitleRegion(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): TemplateRegion | null {
  const yLimit = Math.floor(height * 0.55)
  let best: TemplateRegion | null = null
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

function detectQrRegion(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): TemplateRegion | null {
  const xMin = Math.floor(width * 0.55)
  const yMin = Math.floor(height * 0.4)
  let best: TemplateRegion | null = null
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
      const aspect = regionWidth / regionHeight
      const score = area * (1 - Math.abs(1 - aspect))

      if (score > bestArea && regionWidth > width * 0.1 && regionHeight > height * 0.15) {
        bestArea = score
        best = { x, y, width: regionWidth, height: regionHeight }
      }
    }
  }

  return best
}

export function detectTemplateRegions(
  imageData: ImageData,
  width: number,
  height: number,
): TemplateRegions {
  const { data } = imageData
  const title = detectTitleRegion(data, width, height)
  const qr = detectQrRegion(data, width, height)

  if (!title || !qr) {
    console.warn('[share-image] 模版空白区域检测失败，使用回退坐标')
    return fallbackRegions(width, height)
  }

  return {
    title: applyPadding(title),
    qr: applyPadding(qr),
  }
}

export function loadImageData(src: string): Promise<{ imageData: ImageData; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'))
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      resolve({ imageData, width: canvas.width, height: canvas.height })
    }
    img.onerror = () => reject(new Error(`无法加载分享模版：${src}`))
    img.src = src
  })
}
