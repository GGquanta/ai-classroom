export const SHARE_TITLE_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif"

export const SHARE_TITLE_GRADIENT = {
  start: '#084280',
  end: '#0b5cab',
}

/** @deprecated Use SHARE_TITLE_GRADIENT for rendered share images */
export const SHARE_TITLE_COLOR = SHARE_TITLE_GRADIENT.end

const LINE_HEIGHT_RATIO = 1.28
const ELLIPSIS = '…'

function getFontBounds(region) {
  return {
    max: Math.min(76, Math.round(region.height * 0.52)),
    min: Math.max(16, Math.round(region.height * 0.17)),
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} fontSize
 */
export function setShareTitleFont(ctx, fontSize) {
  ctx.font = `700 ${fontSize}px ${SHARE_TITLE_FONT}`
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 */
function measureLineWidth(ctx, text) {
  return ctx.measureText(text).width
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} title
 * @param {number} maxWidth
 */
export function wrapToTwoLines(ctx, title, maxWidth) {
  const chars = [...title.trim()]
  if (chars.length === 0) return ['']

  const lines = ['']
  let lineIndex = 0

  for (const char of chars) {
    const candidate = lines[lineIndex] + char
    if (measureLineWidth(ctx, candidate) <= maxWidth || lines[lineIndex].length === 0) {
      lines[lineIndex] = candidate
      continue
    }

    if (lineIndex === 0) {
      lineIndex = 1
      lines.push(char)
    } else {
      lines[lineIndex] = char
      break
    }
  }

  if (lines.length === 1 && measureLineWidth(ctx, lines[0]) > maxWidth) {
    return [lines[0]]
  }

  return lines.slice(0, 2)
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} maxWidth
 */
export function truncateWithEllipsis(ctx, text, maxWidth) {
  if (measureLineWidth(ctx, text) <= maxWidth) return text

  let truncated = text
  while (truncated.length > 0 && measureLineWidth(ctx, truncated + ELLIPSIS) > maxWidth) {
    truncated = truncated.slice(0, -1)
  }
  return truncated.length > 0 ? truncated + ELLIPSIS : ELLIPSIS
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[]} lines
 * @param {number} fontSize
 * @param {{ width: number, height: number }} region
 */
function fitsInRegion(ctx, lines, fontSize, region) {
  const lineHeight = fontSize * LINE_HEIGHT_RATIO
  const totalHeight = lines.length * lineHeight
  if (totalHeight > region.height) return false
  return lines.every((line) => measureLineWidth(ctx, line) <= region.width)
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} title
 * @param {{ x: number, y: number, width: number, height: number }} region
 */
export function fitTitleTwoLines(ctx, title, region) {
  const { max: MAX_FONT_SIZE, min: MIN_FONT_SIZE } = getFontBounds(region)
  let best = {
    lines: [title.trim() || ''],
    fontSize: MIN_FONT_SIZE,
    lineHeight: MIN_FONT_SIZE * LINE_HEIGHT_RATIO,
  }

  for (let fontSize = MAX_FONT_SIZE; fontSize >= MIN_FONT_SIZE; fontSize--) {
    setShareTitleFont(ctx, fontSize)
    let lines = wrapToTwoLines(ctx, title, region.width)

    if (lines.length === 2 && !fitsInRegion(ctx, lines, fontSize, region)) {
      lines[1] = truncateWithEllipsis(ctx, lines[1], region.width)
    }

    if (lines.length === 1 && measureLineWidth(ctx, lines[0]) > region.width) {
      lines = [truncateWithEllipsis(ctx, lines[0], region.width)]
    }

    if (fitsInRegion(ctx, lines, fontSize, region)) {
      return {
        lines,
        fontSize,
        lineHeight: fontSize * LINE_HEIGHT_RATIO,
      }
    }

    best = {
      lines,
      fontSize,
      lineHeight: fontSize * LINE_HEIGHT_RATIO,
    }
  }

  setShareTitleFont(ctx, best.fontSize)
  best.lines = best.lines.map((line, index) => {
    if (index === best.lines.length - 1) {
      return truncateWithEllipsis(ctx, line, region.width)
    }
    return line
  })

  return best
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} title
 * @param {{ x: number, y: number, width: number, height: number }} region
 */
export function drawFittedTitle(ctx, title, region) {
  const fitted = fitTitleTwoLines(ctx, title, region)
  setShareTitleFont(ctx, fitted.fontSize)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const totalTextHeight = fitted.lines.length * fitted.lineHeight
  const startY = region.y + (region.height - totalTextHeight) / 2 + fitted.lineHeight / 2
  const centerX = region.x + region.width / 2
  const gradientTop = startY - fitted.lineHeight / 2
  const gradientBottom = startY + (fitted.lines.length - 1) * fitted.lineHeight + fitted.lineHeight / 2
  const gradient = ctx.createLinearGradient(centerX, gradientTop, centerX, gradientBottom)
  gradient.addColorStop(0, SHARE_TITLE_GRADIENT.start)
  gradient.addColorStop(1, SHARE_TITLE_GRADIENT.end)
  ctx.fillStyle = gradient

  fitted.lines.forEach((line, index) => {
    ctx.fillText(line, centerX, startY + index * fitted.lineHeight)
  })
}
