import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from "../service/axiosConfig"
import './Pay.css';

function Pay() {
    const location = useLocation();
    const navigate = useNavigate();
    const { pay: pkg, passengerCount, totalPrice, discountAmount, total, reservationId } = location.state || {};

    const [cardNumber, setCardNumber] = useState('');
    const [cardName,   setCardName]   = useState('');
    const [cardExp,    setCardExp]    = useState('');
    const [cardCvv,    setCardCvv]    = useState('');
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState('');
    const [success,    setSuccess]    = useState('');

    if (!pkg || !reservationId) {
        return (
            <div className="pay-wrapper">
                <div className="pay-error-state">
                    <span>No se encontró información de la reserva.</span>
                    <button onClick={() => navigate('/client/view-packages')}>Volver a paquetes</button>
                </div>
            </div>
        );
    }

    const fmt = n => '$' + Math.round(n).toLocaleString('es-CL');


    const baseTotal = pkg.pricePackage * passengerCount;
    const discountPercent = Math.round((discountAmount / baseTotal) * 100);

    const handleCardNumber = (e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
        setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
    };

    const handleExp = (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2, 4);
        setCardExp(v);
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        const num = cardNumber.replace(/\s/g, '');
        if (num.length < 16){ setError('Número de tarjeta inválido (16 dígitos).'); return; }
        if (!cardName.trim()){ setError('Ingresa el nombre en la tarjeta.'); return; }
        if (!/^\d{2}\/\d{2}$/.test(cardExp)){ setError('Fecha de vencimiento inválida (MM/AA).'); return; }
        if (cardCvv.length === 2){ setError('CVV inválido (3 dígitos).'); return; }

        setLoading(true);
        try {
            await api.post('api/pay/create', {
                reservationId,
                price:  totalPrice,
                format: 'Tarjeta de crédito',
                date:   new Date().toISOString(),
            });
            setSuccess('Pago registrado exitosamente. Reserva confirmada.');
            setTimeout(() => navigate('/client/view-packages'), 2000);
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Esta reserva ya tiene un pago registrado.');
            } else if (err.response?.status === 400) {
                setError(err.response.data?.message || 'Datos de pago inválidos.');
            } else {
                setError('Error al procesar el pago. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatLocalDate = (dateString) => {
        if (!dateString) return "";

        const meses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];

        const [year, month, day] = dateString.split("T")[0].split("-");
        const dia = parseInt(day, 10);
        const mes = meses[parseInt(month, 10) - 1];

        return `${dia} de ${mes} del ${year}`;
    };


    return (
        <div className="pay-wrapper">

            <div className="pay-summary">
                <h2>Resumen del pedido</h2>
                <div className="pay-row"><span>Paquete</span><strong>{pkg.namePackage}</strong></div>
                <div className="pay-row"><span>Destino</span><strong>{pkg.destinationPackage}</strong></div>
                <div className="pay-row"><span>Pasajeros</span><strong>{passengerCount} pasajero{passengerCount > 1 ? 's' : ''}</strong></div>
                <div className="pay-row"><span>Precio por persona</span><strong>${(pkg.pricePackage).toLocaleString('en-US')}</strong></div>
                <div className="pay-row"><span>Fecha de ida</span><strong>{formatLocalDate(pkg.startDate)}</strong></div>
                <div className="pay-row"><span>Fecha de vuelta</span><strong>{formatLocalDate(pkg.endDate)}</strong></div>
                <div className="pay-row"><span>Reserva N°</span><strong>#{reservationId}</strong></div>
                {discountAmount == 0 ? "" : <div className="pay-row"><span>Descuento</span><strong>{discountPercent}%</strong></div>}
                <div className="pay-divider" />
                <div className="pay-total">
                    <span>Total a pagar</span>
                    <strong>${(totalPrice).toLocaleString('en-US')}</strong>
                </div>
            </div>

            <div className="pay-form">
                <h2>Datos de pago <span className="pay-badge">Tarjeta de crédito simulada</span></h2>

                <div className="form-group">
                    <label>Número de tarjeta</label>
                    <div className="input-wrap">
                        <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={handleCardNumber}
                            maxLength={19}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Nombre en la tarjeta</label>
                    <input
                        type="text"
                        placeholder="Como aparece en la tarjeta"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Vencimiento</label>
                        <input
                            type="text"
                            placeholder="MM/AA"
                            value={cardExp}
                            onChange={handleExp}
                            maxLength={5}
                        />
                    </div>
                    <div className="form-group">
                        <label>CVV</label>
                        <input
                            type="text"
                            placeholder="123"
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            maxLength={3}
                        />
                    </div>
                </div>

                {error   && <div className="form-error">{error}</div>}
                {success && <div className="form-success">{success}</div>}

                <button className="btn-confirm" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Procesando...' : 'Confirmar pago'}
                </button>
                <button className="btn-back" onClick={() => navigate("/client/my-reservations")}>Mis reservas</button>
            </div>
        </div>
    );
}

export default Pay;