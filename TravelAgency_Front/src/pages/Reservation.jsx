import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from "../service/axiosConfig"
import './Reservation.css';

function Reservation() {
    const location = useLocation();
    const navigate = useNavigate();
    const pkg = location.state?.pkg;

    const [passengerCount, setPassengerCount] = useState(1);
    const [specialRequests, setSpecialRequests] = useState('');
    const [totalPrice, setTotalPrice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [appliedDiscounts, setAppliedDiscounts] = useState([]);
    const [previewDone, setPreviewDone] = useState(false);
    const [totalDiscountPercent, setTotalDiscountPercent] = useState(0);

    if (!pkg) {
        return (
            <div className="reservation-wrapper">
                <div className="reservation-error-state">
                    <span>No se encontró el paquete seleccionado.</span>
                    <button onClick={() => navigate('/client/view-packages')}>Volver a paquetes</button>
                </div>
            </div>
        );
    }

    const basePrice  = pkg.pricePackage;

    const handlePreview = async () => {
        setError('');
        if (passengerCount < 1 || passengerCount > pkg.availableQuotas) {
            setError(`La cantidad de pasajeros debe ser entre 1 y ${pkg.availableQuotas}.`);
            return;
        }
        setLoading(true);
        try {
            const keycloakId = localStorage.getItem('keycloakId');
            const sessionId  = localStorage.getItem('sessionId');
            const response = await api.get('8002/api/reservations/preview', {
                params: { keycloakId, sessionId, packageId: pkg.id, passengerCount }
            });
            setTotalPrice(response.data.totalPrice);
            setAppliedDiscounts(response.data.appliedDiscounts ?? []);
            setTotalDiscountPercent(response.data.totalDiscountPercent);
            setPreviewDone(true);
        } catch (err) {
            setError('Error al calcular el precio.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setError('');
        setLoading(true);
        try {
            const keycloakId = localStorage.getItem('keycloakId');
            const sessionId  = localStorage.getItem('sessionId');
            const response = await api.post('8002/api/reservations/create', null, {
                params: {
                    keycloakId,
                    sessionId,
                    packageId: pkg.id,
                    passengerCount,
                    specialRequests: specialRequests || undefined,
                }
            });
            navigate('/client/pay', { 
                state: { 
                    pay: pkg, 
                    passengerCount, 
                    totalPrice: response.data.totalPrice,
                    discountAmount: response.data.discountAmount,
                    reservationId: response.data.id
                } 
            });
        } catch (err) {
            setError('Ocurrió un error al procesar la reserva. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reservation-wrapper">


            <div className="reservation-hero">
                <div className="reservation-hero-accent" />
                <div className="reservation-hero-text">
                    <h1>{pkg.namePackage}</h1>
                    <span className="reservation-hero-destination">📍 {pkg.destinationPackage}</span>
                    <span className="reservation-hero-tag">{pkg.classificationPackage}</span>
                </div>
            </div>

            <div className="reservation-layout">

                <aside className="reservation-summary">
                    <h2>Resumen del paquete</h2>

                    <div className="summary-row">
                        <span>Duración</span>
                        <strong>{pkg.durationPackage} días</strong>
                    </div>
                    <div className="summary-row">
                        <span>Salida</span>
                        <strong>{new Date(pkg.startDate).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                    </div>
                    <div className="summary-row">
                        <span>Regreso</span>
                        <strong>{new Date(pkg.endDate).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                    </div>
                    <div className="summary-row">
                        <span>Cupos disponibles</span>
                        <strong>{pkg.availableQuotas}</strong>
                    </div>
                    <div className="summary-row">
                        <span>Precio por persona</span>
                        <strong className="summary-price">${basePrice.toLocaleString('es-CL')}</strong>
                    </div>

                    <div className="summary-divider" />

                    <div className="summary-services">
                        <span>Servicios incluidos</span>
                        <p>{pkg.servicePackage}</p>
                    </div>
                    <div className="summary-services">
                        <span>Condiciones</span>
                        <p>{pkg.conditionPackage}</p>
                    </div>
                    <div className="summary-services">
                        <span>Restricciones</span>
                        <p>{pkg.restrictionPackage}</p>
                    </div>
                </aside>

                <div className="reservation-form-card">
                    <h2>Datos de la reserva</h2>

                    <div className="form-field">
                        <label>Cantidad de pasajeros</label>
                        <div className="passenger-counter">
                            <button
                                className="counter-btn"
                                onClick={() => {
                                    setPassengerCount(c => Math.max(1, c - 1));
                                    setPreviewDone(false);
                                    setAppliedDiscounts([]);
                                    setTotalPrice(null);
                                    setTotalDiscountPercent(0);
                                }}
                                disabled={passengerCount <= 1}
                            >-</button>
                            <span className="counter-value">{passengerCount}</span>
                            <button
                                className="counter-btn"
                                onClick={() => {
                                    setPassengerCount(c => Math.min(pkg.availableQuotas, c + 1));
                                    setPreviewDone(false);
                                    setAppliedDiscounts([]);
                                    setTotalPrice(null);
                                    setTotalDiscountPercent(0);
                                }}
                                disabled={passengerCount >= pkg.availableQuotas}
                            >+</button>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Solicitudes especiales <span className="optional">(opcional)</span></label>
                        <textarea
                            value={specialRequests}
                            onChange={e => setSpecialRequests(e.target.value)}
                            placeholder="Ej: necesito silla de ruedas, dieta vegetariana, habitación para no fumadores..."
                            maxLength={500}
                            rows={4}
                            className="form-textarea"
                        />
                        <span className="char-count">{specialRequests.length}/500</span>
                    </div>

                    {error && <div className="form-error">{error}</div>}
                    {success && <p className="form-success">{success}</p>}

                    {appliedDiscounts.length > 0 && (
                        <div className="discount-breakdown">
                            <h4>Descuentos aplicados:</h4>
                            {appliedDiscounts.map((des, i) => (
                                <div key={i} className="discount-row">
                                    <span>{des}</span>
                                </div>
                        
                            ))}
                            {(100 - (totalPrice*100)/(basePrice*passengerCount)) >= 20 ?
                            (<span style={{ color: "#1a6bff"}}>El descuento máximo aplicable es del 20%. Si coincide con una promoción igual o superior, se aplicará únicamente el descuento de la promoción (no acumulable).</span>) : ""}               
                        </div>
                    )}

                    <div className="reservation-total-note">
                        {totalPrice && (
                            <div className="reservation-total">
                                <span>Precio original</span>
                                <strong style={{ textDecoration: 'line-through', color: 'gray' }}>
                                    ${(basePrice * passengerCount).toLocaleString('en-US')}
                                </strong>
                            </div>
                        )}
                        <div className="reservation-total">
                            <span>Total a pagar</span>
                            <strong>
                                ${(totalPrice ?? basePrice * passengerCount).toLocaleString('en-US')}
                            </strong>
                        </div>
                    </div>

                    <div className="reservation-actions">
                        <button className="btn-back" onClick={() => navigate(-1)}>Volver</button>

                        {!previewDone && (
                            <button className="btn-confirm" onClick={handlePreview} disabled={loading}>
                                {loading ? 'Calculando...' : 'Ver precio final'}
                            </button>
                        )}

                        {previewDone && (
                            <button className="btn-confirm" onClick={handleConfirm} disabled={loading}>
                                {loading ? 'Procesando...' : 'Confirmar y pagar'}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Reservation;