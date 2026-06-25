import './ClientReservation.css'
import { useNavigate } from 'react-router-dom'
import api from "../service/axiosConfig"
import ReservationVoucher from './ReservationVoucher';
import { useState, useEffect } from 'react'

function ClientReservation({ keycloak }) {
  const [myReservation, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const statusLabels = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada",
    EXPIRED: "Expirada"
  };
  const [user, setUser] = useState(null);

  const keycloakId = keycloak.subject;

  useEffect(() => {
    if (keycloakId) {
        fetchMyReservation();

        // Cargar usuario
        api.get(`api/user/search/${keycloakId}`)
            .then(res => setUser(res.data))
            .catch(err => console.error("Error fetching user:", err));
    }

    const interval = setInterval(() => {
        fetchMyReservation();
    }, 30000);

    return () => clearInterval(interval);
  }, [keycloakId]);

  const fetchMyReservation = async () => {
    try {
      const response = await api.get(`api/reservations/client/${keycloakId}`);
      setMyReservations(response.data); 
      
    } catch (error) {
      console.error("Error fetching reservation:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  const formatLocalDate = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("T")[0].split("-");
        return `${day}/${month}/${year}`;
    };
  
  const handlePay = (res, pkg) => {
    navigate('/client/pay', { 
      state: { 
        pay: pkg, 
        passengerCount: res.passengerCount, 
        totalPrice: res.totalPrice,
        reservationId: res.id, 
        discountAmount: res.discountAmount
      } 
    });
  }

  const handleCancel = async (resId) => {
    const confirmed = window.confirm("¿Estás seguro de que deseas cancelar tu reserva?")
    if (!confirmed) return
    try {
        await api.patch(`api/reservations/cancel/${resId}`);
        setMyReservations(prev =>
            prev.map(r => r.id === resId ? { ...r, status: 'CANCELLED' } : r)
        );
        
    } catch (error) {
        console.error("Error cancel reservation:", error);
    }
  }

  if (loading) return <p>Cargando...</p>;
  if (!myReservation || myReservation.length === 0) return (
    <div className="myReservation-container">
      <div className="myReservation-header">
        <div className="myReservation-header-bar" />
        <h1>Mis reservas</h1>
      </div>

      <div className="myReservation-empty">

        <h2>No tienes reservas aún</h2>
        <p>Cuando realices una reserva aparecerá aquí para que puedas gestionarla.</p>

        <button className="reserve-button" onClick={() => navigate('/client/view-packages')}>

          Nueva reserva
        </button>
      </div>
    </div>
  );

  return (
    <div className="myReservation-container">
      <div className="myReservation-header">
        <div className="myReservation-header-bar" />
        <h1>Mis reservas</h1>
        <span className="myReservation-count">{myReservation.length} reserva{myReservation.length !== 1 ? 's' : ''}</span>
      </div>

      {myReservation.map((reservation) => {
        const pkg = reservation.packageId;
        return (
          <div className="myReservation-card" key={reservation.id}>

            <div className="card-section">
              <p className="section-label">Datos de la reserva</p>
              <div className="fields-grid">
                <div className="field"><label>Cantidad de personas</label><p>{reservation.passengerCount}</p></div>
                <div className="field"><label>Precio por persona</label><p className="price">${reservation.basePrice.toLocaleString('en-US')}</p></div>
                <div className="field"><label>Precio total</label><p className="price">${reservation.totalPrice.toLocaleString('en-US')}</p></div>
                <div className="field">
                  <label>Estado</label>
                  <p>
                      <span className={`status-badge ${reservation.status}`}>
                          {statusLabels[reservation.status] || reservation.status}
                      </span>
                  </p>
                </div>
                {reservation.status !== 'CONFIRMED' && reservation.status !== 'CANCELLED' && reservation.status !== 'EXPIRED' && 
                <div className="field"><label>Tiempo para pagar</label><p>{formatDateTime(reservation.expiresAt)}</p></div>}
              </div>
            </div>

            <div className="card-section">
              <p className="section-label">Datos del paquete</p>
              <p className="pkg-name">{pkg?.namePackage}</p>
              <p className="pkg-destination">{pkg?.destinationPackage}</p>
              {pkg?.classificationPackage && (
                <span className="classification-badge">{pkg.classificationPackage}</span>
              )}
              <div className="pkg-info-grid">
                <div className="pkg-info-item"><label>Descripción</label><p>{pkg?.descriptionPackage}</p></div>
                <div className="pkg-info-item"><label>Servicios</label><p>{pkg?.servicePackage}</p></div>
                <div className="pkg-info-item"><label>Condiciones</label><p>{pkg?.conditionPackage}</p></div>
                <div className="pkg-info-item"><label>Restricciones</label><p>{pkg?.restrictionPackage}</p></div>
              </div>
              <div className="dates-row">
                <span className="date-pill">Inicio: {formatLocalDate(pkg?.startDate)}</span>
                <span className="date-pill">Fin: {formatLocalDate(pkg?.endDate)}</span>
              </div>
              <div className="card-actions">
                {reservation.status !== 'CONFIRMED' && reservation.status !== 'EXPIRED' && reservation.status !== 'CANCELLED' && (
                  <button className="cancel-button" onClick={() => handleCancel(reservation.id)}>
                    Cancelar Reserva
                  </button>
                )}
                {reservation.status !== 'CONFIRMED' && reservation.status !== 'EXPIRED' && reservation.status !== 'CANCELLED' &&(
                  <button className="pay-button" onClick={() => handlePay(reservation, pkg)}>
                    Pagar Reserva
                  </button>
                )}
                {reservation.status === 'CONFIRMED' && (
                  <button
                    className="cancel-button"
                    onClick={() => ReservationVoucher(reservation, pkg, user)}
                  >
                    Descargar comprobante
                  </button>
                )}
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}

export default ClientReservation;