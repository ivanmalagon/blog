import Typography from 'typography'
import grandViewTheme from 'typography-theme-grand-view'

grandViewTheme.baseLineHeight = 1.5;

const typography = new Typography(grandViewTheme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography
