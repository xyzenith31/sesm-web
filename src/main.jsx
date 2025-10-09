import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NavigationProvider } from './context/NavigationContext.jsx'; // <-- Impor

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </AuthProvider>
  </StrictMode>
);