import QRCode from 'qrcode'
import type { Article } from './useArticles'
import { SITE_ORIGIN, SHARE_TEMPLATE_URL } from './siteOrigin'
import { detectTemplateRegions, loadImageData } from './detectTemplateRegions'
import { drawFittedTitle } from './fitArticleShareTitle'

function loadTemplateImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`无法加载分享模版：${src}`))
    img.src = src
  })
}

async function renderQrCode(url: string, size: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  await QRCode.toCanvas(canvas, url, {
    width: size,
    margin: 1,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  })
  return canvas
}

export function buildArticleShareUrl(article: Article): string {
  return `${SITE_ORIGIN}${article.link}`
}

export async function generateArticleShareImage(
  article: Article,
  title?: string,
): Promise<Blob> {
  if (typeof document === 'undefined') {
    throw new Error('分享图仅能在浏览器中生成')
  }

  await document.fonts.ready

  const [template, { imageData, width, height }] = await Promise.all([
    loadTemplateImage(SHARE_TEMPLATE_URL),
    loadImageData(SHARE_TEMPLATE_URL),
  ])

  const regions = detectTemplateRegions(imageData, width, height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法创建 Canvas 上下文')
  }

  ctx.drawImage(template, 0, 0, width, height)
  drawFittedTitle(ctx, title ?? article.title, regions.title)

  const qrSize = Math.min(regions.qr.width, regions.qr.height)
  const qrCanvas = await renderQrCode(buildArticleShareUrl(article), qrSize)
  const qrX = regions.qr.x + (regions.qr.width - qrSize) / 2 - 2
  const qrY = regions.qr.y + (regions.qr.height - qrSize) / 2 - 2
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })

  if (!blob) {
    throw new Error('分享图生成失败')
  }

  return blob
}
