import { useEffect, useState } from 'react';
import api from '../service/axiosConfig'
import './Report.css'

function ReportRanking () {

    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (startDate && endDate) {
            ranking();
        }
    }, [startDate, endDate]);

    const ranking = async () => {
        if (startDate > endDate) {
            setError('La fecha de inicio no puede ser posterior a la fecha de término');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const response = await api.get("api/reports/ranking", { params: { startDate, endDate } });
            setReport(response.data);
        } catch (error) {
            console.error("Error al buscar reportes:", error);
            setError('Error al cargar los reportes. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    }

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setReport([]);
        setError('');
    };

    const hasActiveFilters = startDate || endDate;
    return (
        <div className="report-page">
            <div className="users-header">
                <div className="users-header-accent" />
                <h1>Ranking de Paquetes</h1>
            </div>

            <div className="filter-row">
                <label className="filter-label">
                    Fecha inicio 
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="filter-input filter-input--short"
                    />
                </label>
                <label className="filter-label">
                    Fecha termino 
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="filter-input filter-input--short"
                    />
                </label>

                {hasActiveFilters && (
                    <button onClick={clearFilters} className="filter-clear-btn">
                        Limpiar filtros
                    </button>
                )}
            </div>

            {error && <div className="empty-state" style={{ color: 'red' }}>{error}</div>}

            {loading ? (
                <div className="empty-state">Buscando reportes...</div>
            ) : !startDate || !endDate ? (
                <div className="empty-state">Selecciona un rango de fechas para generar el ranking</div>
            ) : report.length === 0 ? (
                <div className="empty-state">No se encontraron paquetes en este período</div>
            ) : (
                <div className="report-grid">
                    {report.map((item, index) => (
                        <div key={item.packageId} className="report-card">
                            <div className="report-card__rank">#{index + 1}</div>
                            <div className="report-card__body">
                                <h3 className="report-card__name">{item.packageName}</h3>
                                <p className="report-card__destination">📍 {item.destination}</p>
                                <div className="report-card__stats">
                                    <span>🎫 {item.totalReservations} reservas</span>
                                    <span>👥 {item.totalPassengers} pasajeros</span>
                                    <span>💰 ${item.totalRevenue.toLocaleString('en-US')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
export default ReportRanking