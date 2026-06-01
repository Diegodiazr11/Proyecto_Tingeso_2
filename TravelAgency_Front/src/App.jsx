import { useState, useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate, Navigate } from 'react-router-dom'
import './App.css'
import api from "./service/axiosConfig";


import Home from './pages/Home'
import Packages from './pages/Packages'
import DashboardAdmin from './pages/DashboardAdmin'
import Users from './pages/Users'
import DashboardClient from './pages/DashboardClient'
import Profile from './pages/Profile'
import ViewPackages from './pages/ViewPackages'
import Reservation from './pages/Reservation'
import ClientReservation from './pages/ClientReservation'
import Pay from './pages/Pay'
import ViewReservation from './pages/ViewReservations'
import ReportByPeriod from './pages/ReportByPeriod'
import ReportRanking from './pages/ReportRanking'

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'

function App({ keycloak, authenticated }) {


  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      api.get(`/api/user/search/${keycloak.subject}`);
    }
  }, [authenticated, keycloak]);


  const privateRoutes = [
    '/admin/packages', '/admin/dashboard', '/admin/users', '/admin/profile',
    '/client/dashboard', '/client/profile', '/client/view-packages', 
    '/client/reservation', '/client/my-reservations', '/client/pay',
    '/admin/view-reservations', '/admin/report-ranking', '/admin/report-period'
  ]
  
  const isPrivateRoute = privateRoutes.some(r => location.pathname.startsWith(r))
  

  const showSidebar = authenticated && isPrivateRoute

  const showHeader = !isPrivateRoute

  useEffect(() => {
    if (authenticated && location.pathname === '/') {
        const roles = keycloak.tokenParsed?.realm_access?.roles || [];
        if (roles.includes('admin')) {
            navigate('/admin/dashboard');
        } else {
            navigate('/client/dashboard');
        }
    }
  }, [authenticated, location.pathname, keycloak, navigate]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {showSidebar && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} authenticated={authenticated}
          keycloak={keycloak} />
      )}

      <div style={{
        marginLeft: showSidebar ? (collapsed ? "64px" : "220px") : "0",
        flex: 1,
        transition: "margin-left 0.3s ease",
        display: "flex",
        flexDirection: "column"
      }}>
        
        {showHeader && <Header keycloak={keycloak} authenticated={authenticated} />}

        <div style={{ padding: showSidebar ? "24px" : "0", flex: 1 }}>
          <Routes>
            {/* RUTA PÚBLICA */}
            <Route path="/" element={<Home keycloak={keycloak} authenticated={authenticated} />} />

            {/* RUTAS DE ADMINISTRADOR */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="admin" keycloak={keycloak}>
                <DashboardAdmin keycloak={keycloak} />
              </ProtectedRoute>
            } />
            <Route path="/admin/packages" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="admin" keycloak={keycloak}>
                <Packages />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="admin" keycloak={keycloak}>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="admin" keycloak={keycloak}>
                <Profile keycloak={keycloak}/>
              </ProtectedRoute>
            } />
            <Route path="/admin/view-reservations" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="admin" keycloak={keycloak}>
                <ViewReservation />
              </ProtectedRoute>
            } />
            <Route path="/admin/report-period" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="admin" keycloak={keycloak}>
                <ReportByPeriod />
              </ProtectedRoute>
            } /><Route path="/admin/report-ranking" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="admin" keycloak={keycloak}>
                <ReportRanking />
              </ProtectedRoute>
            } />

            {/* RUTAS DE CLIENTE */}
            <Route path="/client/dashboard" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="user" keycloak={keycloak}>
                <DashboardClient keycloak={keycloak}/>
              </ProtectedRoute>
            } />
            <Route path="/client/profile" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="user" keycloak={keycloak}>
                <Profile keycloak={keycloak}/>
              </ProtectedRoute>
            } />
            <Route path="/client/view-packages" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="user" keycloak={keycloak}>
                <ViewPackages />
              </ProtectedRoute>
            } />
            <Route path="/client/reservation" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="user" keycloak={keycloak}>
                <Reservation/>
              </ProtectedRoute>
            } />
            <Route path="/client/my-reservations" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="user" keycloak={keycloak}>
                <ClientReservation keycloak={keycloak}/>
              </ProtectedRoute>
            } />
            <Route path="/client/pay" element={
              <ProtectedRoute authenticated={authenticated} requiredRole="user" keycloak={keycloak}>
                <Pay />
              </ProtectedRoute>
            } />

            <Route path="*" element={
              <div style={{ padding: "50px", textAlign: "center" }}>
                <h1>404</h1>
                <p>La página que buscas no existe.</p>
                <button onClick={() => window.location.href = '/'}>Volver al Inicio</button>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;