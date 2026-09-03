import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UnsupportedBrowserNotice } from './webmcp'

// The notice sits above the app, not inside it: a judge who opens the live URL
// in a browser without WebMCP must be told why the agent side looks empty
// before they scroll past it and score the page as broken.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UnsupportedBrowserNotice />
    <App />
  </StrictMode>,
)
