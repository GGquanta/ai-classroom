import { getScrollOffset } from 'vitepress'

const TOP_THRESHOLD = 8

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth'
}

function handleOutlineClick(e: MouseEvent, link: HTMLAnchorElement) {
  const hash = link.hash
  if (!hash) return false

  let heading: HTMLElement | null = null
  try {
    heading = document.getElementById(decodeURIComponent(hash.slice(1)))
  } catch {
    return false
  }
  if (!heading) return false

  e.preventDefault()
  e.stopImmediatePropagation()

  const oldURL = location.href
  if (hash !== location.hash) {
    history.pushState({}, '', hash)
    window.dispatchEvent(
      new HashChangeEvent('hashchange', {
        oldURL,
        newURL: location.href,
      }),
    )
  }

  const targetPadding = parseInt(window.getComputedStyle(heading).paddingTop, 10) || 0
  const top =
    window.scrollY + heading.getBoundingClientRect().top - getScrollOffset() + targetPadding

  window.scrollTo({ top, behavior: scrollBehavior() })
  heading.focus({ preventScroll: true })
  return true
}

/** Not at top → scroll to top (block VitePress nav); at top → let default go home. */
function handleBrandClick(e: MouseEvent) {
  if (window.scrollY <= TOP_THRESHOLD) return false

  e.preventDefault()
  e.stopImmediatePropagation()
  window.scrollTo({ top: 0, behavior: scrollBehavior() })
  return true
}

let installed = false

/**
 * Register before VitePress createRouter so capture order wins over its link interceptor.
 */
export function installSmoothOutlineScroll() {
  if (typeof window === 'undefined' || installed) return
  installed = true

  window.addEventListener(
    'click',
    (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      if (!(e.target instanceof Element)) return

      const brand = e.target.closest('a.brand')
      if (brand instanceof HTMLAnchorElement && handleBrandClick(e)) return

      const outline = e.target.closest('a.outline-link')
      if (outline instanceof HTMLAnchorElement) handleOutlineClick(e, outline)
    },
    { capture: true },
  )
}
