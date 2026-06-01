import { useState, useEffect } from "react";
import api from "../service/axiosConfig";
import './Dashboard.css';
import { useNavigate } from "react-router-dom";

function DashboardClient({ keycloak }) {
  const keycloakId = keycloak.subject;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`8001/api/user/search/${keycloakId}`);
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
        <h1>Dashboard Cliente</h1>
        <span>Cliente</span>
      </div>
      <p style={{ color: '#5a6a9a', marginBottom: '24px' }}>
        Hola {user.username}, aquí puedes ver tus reservas y paquetes disponibles.
      </p>

      <div className="dash-grid">
        <div className="dash-card" onClick={() => navigate("/client/view-packages")}>
          <div className="dash-icon green">📦</div>
          <div>
            <h3>¿Quieres comprar un paquete?</h3>
            <p>Explora todos los paquetes de viaje disponibles.</p>
          </div>
          <button className="dash-btn" onClick={(e) => { e.stopPropagation(); navigate("/client/view-packages"); }}>
            Revisar paquetes
          </button>
        </div>

        <div className="dash-card" onClick={() => navigate("/client/my-reservations")}>
          <div className="dash-icon amber">🗓️</div>
          <div>
            <h3>Revisa tus reservas</h3>
            <p>Consulta el estado de todas tus reservas activas.</p>
          </div>
          <button className="dash-btn outline" onClick={(e) => { e.stopPropagation(); navigate("/client/my-reservations"); }}>
            Reservas
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardClient;