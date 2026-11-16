// Theme lives on <html> so every page, the login screen included, picks it up. Saved per device.
export function applyTheme(t) {
  document.documentElement.dataset.theme = t
  document.querySelector('meta[name=theme-color]').content = t === 'pink' ? '#fff4f8' : '#08080a'
}
