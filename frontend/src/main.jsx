import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RegionProvider } from './context/RegionContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RegionProvider>
      <App />
    </RegionProvider>
  </StrictMode>,
)
