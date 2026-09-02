import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import { installSmoothOutlineScroll } from './smoothOutlineScroll'
import './tokens.css'
import './mooc.css'
import './vp-overrides.css'
import './mermaid.css'

// Must run at module load (before VitePress createRouter) to win capture order.
installSmoothOutlineScroll()

export default {
  extends: DefaultTheme,
  Layout,
}
