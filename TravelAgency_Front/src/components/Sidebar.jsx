import { Link } from "react-router-dom";
import "./Sidebar.css";
// Importamos la instancia de keycloak
import keycloak from "../service/keyclaok"; 

function Sidebar({ collapsed, setCollapsed, authenticated }) {
    

    if (!authenticated) return null;

    const isAdmin = keycloak.hasResourceRole("admin_client_role", "spring-client-api-rest") 
                || keycloak.hasRealmRole("admin_client_role");


    const handleLogout = () => {
        keycloak.logout({
            redirectUri: window.location.origin 
        });
    };

    return (
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                {!collapsed && <span className="sidebar-logo">TravelAgency</span>}
                <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? "→" : "←"}
                </button>
            </div>

            <nav className="sidebar-nav">
                {/* RUTAS DE CLIENTE */}
                {!isAdmin && (
                    <>
                        <Link to="/client/dashboard" className="sidebar-link">
                            <span className="sidebar-icon">🏠</span>
                            {!collapsed && <span>Inicio</span>}
                        </Link>
                        <Link to="/client/view-packages" className="sidebar-link">
                            <span className="sidebar-icon">✈️</span>
                            {!collapsed && <span>Paquetes</span>}
                        </Link>
                        <Link to="/client/my-reservations" className="sidebar-link">
                            <span className="sidebar-icon">📋</span>
                            {!collapsed && <span>Mis Reservas</span>}
                        </Link>
                    </>
                )}

                {/* RUTAS DE ADMIN */}
                {isAdmin && (
                    <>
                        <Link to="/admin/dashboard" className="sidebar-link">
                            <span className="sidebar-icon">🏠</span>
                            {!collapsed && <span>Inicio</span>}
                        </Link>
                        <Link to="/admin/users" className="sidebar-link">
                            <span className="sidebar-icon">👥</span>
                            {!collapsed && <span>Usuarios</span>}
                        </Link>
                        <Link to="/admin/packages" className="sidebar-link">
                            <span className="sidebar-icon">✈️</span>
                            {!collapsed && <span>Paquetes</span>}
                        </Link>
                        <Link to="/admin/view-reservations" className="sidebar-link">
                            <span className="sidebar-icon">📋</span>
                            {!collapsed && <span>Todas las reservas</span>}
                        </Link>
                        
                        <Link to="/admin/report-period" className="sidebar-link">
                            <span className="sidebar-icon">⏳</span>
                            {!collapsed && <span>Reporte por periodo</span>}
                        </Link>
                        <Link to="/admin/report-ranking" className="sidebar-link">
                            <span className="sidebar-icon">📈</span>
                            {!collapsed && <span>Reporte del ranking</span>}
                        </Link>
                    </>
                )}
            </nav>
            <div className="sidebar-profile">
            {isAdmin && (
                <Link to="/admin/profile" className="sidebar-link">
                    <span className="sidebar-icon">👤</span>
                    {!collapsed && <span>Perfil</span>}
                </Link>
            )}
            {!isAdmin && (
                <Link to="/client/profile" className="sidebar-link">
                    <span className="sidebar-icon">👤</span>
                    {!collapsed && <span>Perfil</span>}
                </Link>
            )}
            </div>
            <button className="sidebar-logout-btn" onClick={handleLogout}>
                <span className="sidebar-icon">🚪</span>
                {!collapsed && <span>Cerrar Sesión</span>}
            </button>
        </div>
    );
}

export default Sidebar;