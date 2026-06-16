import { useState, useEffect } from "react";
import api from "../service/axiosConfig";
import './Dashboard.css';
import { useNavigate } from "react-router-dom";

function DashboardAdmin({ keycloak }) {
  const keycloakId = keycloak.subject;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/api/user/search/${keycloakId}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    if (keycloakId) fetchUser();
  }, [keycloakId]);

  if (loading) return <p>Cargando...</p>;
  if (!user) return <p>Usuario no encontrado</p>;

  return (
    <div className="dash-wrapper">
      <div className="dash-header">
        <div className="dash-accent" />
        <h1>Dashboard Admin</h1>
        <span>Admin</span>
      </div>
      <p className="dash-welcome">Hola {user.username}, aquí podrás crear y gestionar paquetes, ver reportes y usuarios.</p>

      <div className="dash-grid">
        <div className="dash-card" onClick={() => navigate("/admin/users")}>
          <div className="dash-icon blue">👥</div>
          <div>
            <h3>Revisa los usuarios</h3>
            <p>Gestiona y revisa todos los usuarios registrados.</p>
          </div>
          <button className="dash-btn" onClick={(e) => { e.stopPropagation(); navigate("/admin/users"); }}>
            Usuarios
          </button>
        </div>

        <div className="dash-card" onClick={() => navigate("/admin/packages")}>
          <div className="dash-icon green">📦</div>
          <div>
            <h3>¿Quieres crear un paquete?</h3>
            <p>Crea y administra los paquetes de viaje disponibles.</p>
          </div>
          <button className="dash-btn" onClick={(e) => { e.stopPropagation(); navigate("/admin/packages"); }}>
            Crear paquete
          </button>
        </div>

        <div className="dash-card" onClick={() => navigate("/admin/view-reservations")}>
          <div className="dash-icon amber">🗓️</div>
          <div>
            <h3>Revisa todas las reservas</h3>
            <p>Revisa y gestiona todas las reservas activas.</p>
          </div>
          <button className="dash-btn" onClick={(e) => { e.stopPropagation(); navigate("/admin/view-reservations"); }}>
            Reservas
          </button>
        </div>

        <div className="dash-card" onClick={() => navigate("/admin/report-period")}>
          <div className="dash-icon purple">📊</div>
          <div>
            <h3>Revisa reportes por periodo</h3>
            <p>Consulta métricas agrupadas por rango de fechas.</p>
          </div>
          <button className="dash-btn outline" onClick={(e) => { e.stopPropagation(); navigate("/admin/report-period"); }}>
            Periodo
          </button>
        </div>

        <div className="dash-card" onClick={() => navigate("/admin/report-ranking")}>
          <div className="dash-icon coral">🏆</div>
          <div>
            <h3>Revisa reportes por ranking</h3>
            <p>Revisa los paquetes y destinos más populares.</p>
          </div>
          <button className="dash-btn outline" onClick={(e) => { e.stopPropagation(); navigate("/admin/report-ranking"); }}>
            Ranking
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;