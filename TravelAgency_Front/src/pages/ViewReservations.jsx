import { useState, useEffect } from "react";
import api from "../service/axiosConfig";

function ViewReservations() {

    const [loading, setLoading] = useState(true);
    const [reservations, setReservations] = useState([]);
    const [error, setError] = useState(null);

    const statusLabels = {
        PENDING: "Pendiente",
        CONFIRMED: "Confirmada",
        CANCELLED: "Cancelada",
        EXPIRED: "Expirada"
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const response = await api.get("api/reservations/all");
            setReservations(response.data);
        } catch (error) {
            console.error("Error fetching reservations:", error);
            setError("No se pudieron cargar las reservas.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('es-CL', {
            day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const formatDateTime = (dateStr) =>
        new Date(dateStr).toLocaleString('es-CL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
    });

    const handleCancel = async (resId) => {
        const confirmed = window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")
        if (!confirmed) return
        try {
            await api.patch(`/api/reservations/cancel/${resId}`);
            setReservations(prev =>
                prev.map(r => r.id === resId ? { ...r, status: 'CANCELLED' } : r)
            );
            
        } catch (error) {
            console.error("Error cancel reservation:", error);
        }
    }

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="myReservation-container">
            <div className="myReservation-header">
                <div className="myReservation-header-bar" />
                <h1>Todas las reservas</h1>
                <span className="myReservation-count">
                    {reservations.length} reserva{reservations.length !== 1 ? 's' : ''}
                </span>
            </div>

            {reservations.length === 0 ? (
                <div className="myReservation-empty">
                    <h2>No hay reservas registradas</h2>
                    <p>Aún no se han realizado reservas en el sistema.</p>
                </div>
            ) : (
                reservations.map((reservation) => {
                    const pkg = reservation.packageId;
                    const client = reservation.clientKeycloakId;
                    return (
                        <div className="myReservation-card" key={reservation.id}>

                            {/* DATOS DEL CLIENTE */}
                            <div className="card-section">
                                <p className="section-label">Datos del cliente</p>
                                <div className="fields-grid">
                                    <div className="field">
                                        <label>Nombre</label>
                                        <p>{client?.firstName} {client?.lastName}</p>
                                    </div>
                                    <div className="field">
                                        <label>Email</label>
                                        <p>{client?.email}</p>
                                    </div>
                                    <div className="field">
                                        <label>Documento</label>
                                        <p>{client?.document ?? '—'}</p>
                                    </div>
                                    <div className="field">
                                        <label>Teléfono</label>
                                        <p>{client?.phone ?? '—'}</p>
                                    </div>
                                    <div className="field">
                                        <label>Nacionalidad</label>
                                        <p>{client?.nationality ?? '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* DATOS DE LA RESERVA */}
                            <div className="card-section">
                                <p className="section-label">Datos de la reserva</p>
                                <div className="fields-grid">
                                    <div className="field">
                                        <label>Cantidad de personas</label>
                                        <p>{reservation.passengerCount}</p>
                                    </div>
                                    <div className="field">
                                        <label>Precio por persona</label>
                                        <p className="price">${reservation.basePrice.toLocaleString('en-US')}</p>
                                    </div>
                                    <div className="field">
                                        <label>Precio total</label>
                                        <p className="price">${reservation.totalPrice.toLocaleString('en-US')}</p>
                                    </div>
                                    <div className="field">
                                        <label>Estado</label>
                                        <p>
                                            <span className={`status-badge ${reservation.status}`}>
                                                {statusLabels[reservation.status] || reservation.status}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="field">
                                        {reservation.status !== 'CONFIRMED' && reservation.status !== 'CANCELLED' && reservation.status !== 'EXPIRED' && 
                                        <div className="field"><label>Tiempo para pagar</label><p>{formatDateTime(reservation.expiresAt)}</p></div>}
                                    </div>
                                </div>
                            </div>

                            {/* DATOS DEL PAQUETE */}
                            <div className="card-section">
                                <p className="section-label">Datos del paquete</p>
                                <p className="pkg-name">{pkg?.namePackage}</p>
                                <p className="pkg-destination">{pkg?.destinationPackage}</p>
                                {pkg?.classificationPackage && (
                                    <span className="classification-badge">{pkg.classificationPackage}</span>
                                )}
                                <div className="pkg-info-grid">
                                    <div className="pkg-info-item">
                                        <label>Descripción</label>
                                        <p>{pkg?.descriptionPackage}</p>
                                    </div>
                                    <div className="pkg-info-item">
                                        <label>Servicios</label>
                                        <p>{pkg?.servicePackage}</p>
                                    </div>
                                    <div className="pkg-info-item">
                                        <label>Condiciones</label>
                                        <p>{pkg?.conditionPackage}</p>
                                    </div>
                                    <div className="pkg-info-item">
                                        <label>Restricciones</label>
                                        <p>{pkg?.restrictionPackage}</p>
                                    </div>
                                </div>
                                <div className="dates-row">
                                    <span className="date-pill">Inicio: {formatDate(pkg?.startDate)}</span>
                                    <span className="date-pill">Fin: {formatDate(pkg?.endDate)}</span>
                                </div>
                                <div className="card-actions">
                                    {reservation.status !== 'EXPIRED' && reservation.status !== 'CANCELLED' && (
                                    <button className="cancel-button" onClick={() => handleCancel(reservation.id)}>
                                        Cancelar Reserva
                                    </button>
                                    )} 
                                </div>
                            </div>

                        </div>
                    );
                })
            )}
        </div>
    );
}

export default ViewReservations;