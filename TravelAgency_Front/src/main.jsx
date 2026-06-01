import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import keycloak from './service/keyclaok.js';
import api from './service/axiosConfig.js';


let initPromise = null;

const startApp = () => {

  if (initPromise) return initPromise;

  initPromise = keycloak.init({
    onLoad: 'check-sso',
    checkLoginIframe: false,
    pkceMethod: 'S256'
  });

  return initPromise;
};

const container = document.getElementById('root');
const root = createRoot(container);

startApp()
  .then((authenticated) => {

    if (authenticated) {
      localStorage.setItem("token", keycloak.token);
      localStorage.setItem("keycloakId", keycloak.subject);

      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      localStorage.setItem("sessionId", generateUUID());

    }
    
    root.render(
      <BrowserRouter>
        <App keycloak={keycloak} authenticated={authenticated} />
      </BrowserRouter>
    );
  })
  .catch((err) => {
    if (err?.message?.includes('once')) return;
    
    console.error("Error al inicializar Keycloak:", err);
    root.render(
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Error de Conexión</h2>
        <p>No se pudo conectar con el servidor de identidad.</p>
      </div>
    );
  });