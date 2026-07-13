import {
  SHARE_TITLE_COLOR,
  SHARE_TITLE_FONT,
  SHARE_TITLE_GRADIENT,
  drawFittedTitle,
  fitTitleTwoLines,
  setShareTitleFont,
  truncateWithEllipsis,
  wrapToTwoLines,
} from '../../../../scripts/lib/article-share-title.mjs'
import type { TemplateRegion } from './detectTemplateRegions'

export { SHARE_TITLE_COLOR, SHARE_TITLE_FONT, SHARE_TITLE_GRADIENT }

export type FittedTitle = ReturnType<typeof fitTitleTwoLines>

export { drawFittedTitle, fitTitleTwoLines, setShareTitleFont, truncateWithEllipsis, wrapToTwoLines }

export type { TemplateRegion }
