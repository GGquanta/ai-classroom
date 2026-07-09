import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './tokens.css'
import './mooc.css'
import './vp-overrides.css'

export default {
  extends: DefaultTheme,
  Layout,
}
