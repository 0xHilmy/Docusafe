import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WalletContextProvider } from './contexts/WalletContext'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

try {
  createRoot(root).render(
    <StrictMode>
      <BrowserRouter basename="/Docusafe">
        <WalletContextProvider>
          <App />
        </WalletContextProvider>
      </BrowserRouter>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Show a user-friendly error message
  root.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1a1a1a;
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="text-align: center;">
        <h1 style="margin-bottom: 1rem;">Something went wrong</h1>
        <p>Please refresh the page to try again.</p>
      </div>
    </div>
  `;
}
