import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { applyTheme } from './theme.js'
import './styles.css'

let saved = 'dark'
try { if (localStorage.getItem('theme') === 'pink') saved = 'pink' } catch { /* private mode */ }
applyTheme(saved)

createRoot(document.getElementById('root')).render(<App />)
