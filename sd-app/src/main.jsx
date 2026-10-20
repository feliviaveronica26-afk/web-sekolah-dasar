import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import { DataProvider } from './context/DataContext'
import App from './App'
import './styles/main.scss'

// Peringatan untuk pengguna yang disuruh orang lain menempelkan kode di konsol (self-XSS)
if (import.meta.env.PROD) {
  console.log(
    '%cBerhenti!%c\nJangan menempelkan kode apa pun di sini atas suruhan orang lain. Itu cara umum untuk mengambil alih akun dan data sekolah.',
    'color:#d91a28;font-size:36px;font-weight:bold',
    'font-size:14px',
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
