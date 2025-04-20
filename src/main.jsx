import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthComponent from './AuthComponent.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthComponent />
  </StrictMode>,
)
