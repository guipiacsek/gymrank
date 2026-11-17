// Theme lives on <html> so every page, the login screen included, picks it up. Saved per device.
export function applyTheme(t) {
  // Switch instantly: otherwise every colour transition runs at once and the page smears between themes.
  const freeze = document.createElement('style')
  freeze.textContent = '*, *::before, *::after { transition: none !important; }'
  document.head.appendChild(freeze)
  document.documentElement.dataset.theme = t
  document.querySelector('meta[name=theme-color]').content = t === 'pink' ? '#ffb7c5' : '#08080a'
  getComputedStyle(document.body).color // force the new colours to apply before transitions come back
  requestAnimationFrame(() => freeze.remove())
}
