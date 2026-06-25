import { useState, useEffect } from 'react';
import api from "../service/axiosConfig"
import './ViewPackages.css';
import { useNavigate } from 'react-router-dom';

function ViewPackages() {

    const navigate = useNavigate();

    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal]= useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    const [search, setSearch] = useState('');
    const [classification, setClassification] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minDuration, setMinDuration] = useState('');
    const [maxDuration, setMaxDuration] = useState('');
    const [sortBy, setSortBy] = useState('');

    useEffect(() => {
        fetchPackages();
    }, [search, classification, minPrice, maxPrice, startDate, endDate, minDuration, maxDuration, sortBy]);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (classification) params.classification = classification;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (minDuration) params.minDuration = minDuration;
            if (maxDuration) params.maxDuration = maxDuration;
            if (sortBy) params.sortBy = sortBy;

            const response = await api.get('/api/package/search', { params });
            setPackages(response.data);
        } catch (error) {
            console.error("Error al buscar paquetes:", error);
            setPackages([]);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (pkg) => {
        setSelectedPackage(pkg);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPackage(null);
    };

    const clearFilters = () => {
        setSearch('');
        setClassification('');
        setMinPrice('');
        setMaxPrice('');
        setStartDate('');
        setEndDate('');
        setMinDuration('');
        setMaxDuration('');
        setSortBy('');
    };

    const formatLocalDate = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("T")[0].split("-");
        return `${day}/${month}/${year}`;
    };

    const hasActiveFilters = search || classification || minPrice || maxPrice ||
                            startDate || endDate || minDuration || maxDuration || sortBy;

    return (
        <div className="packages-wrapper">
            <div className="packages-header">
                <div className="packages-header-accent" />
                <h1>Paquetes Turísticos</h1>
                <span>{packages.length} paquete{packages.length !== 1 ? "s" : ''}</span>
            </div>

            <div className="packages-filters">
                <input
                    type="text"
                    placeholder="Buscar por destino o nombre..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="filter-input"
                />

                <div className="filter-row">
                    <select
                        value={classification}
                        onChange={e => setClassification(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Tipo de experiencia</option>
                        <option value="Aventura">Aventura</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Relax">Relax</option>
                        <option value="Gastronómico">Gastronómico</option>
                        <option value="Familiar">Familiar</option>
                        <option value="Playa y sol">Playa y sol</option>
                        <option value="Romantico">Romántico</option>
                        <option value="Ecoturismo">Ecoturismo</option>
                        <option value="Lujo">Lujo</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Precio mínimo"
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        className="filter-input filter-input--short"
                        min={0}
                    />
                    <input
                        type="number"
                        placeholder="Precio máximo"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="filter-input filter-input--short"
                        min={0}
                    />
                </div>

                <div className="filter-row">
                    <label className="filter-label">
                        Salida desde
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="filter-input filter-input--short"
                        />
                    </label>
                    <label className="filter-label">
                        Salida hasta
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="filter-input filter-input--short"
                        />
                    </label>
                    <input
                        type="number"
                        placeholder="Duración mín (días)"
                        value={minDuration}
                        onChange={e => setMinDuration(e.target.value)}
                        className="filter-input filter-input--short"
                        min={0}
                    />
                    <input
                        type="number"
                        placeholder="Duración máx (días)"
                        value={maxDuration}
                        onChange={e => setMaxDuration(e.target.value)}
                        className="filter-input filter-input--short"
                        min={0}
                    />
                </div>

                <div className="filter-row" style={{ justifyContent: 'space-between' }}>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Ordenar por...</option>
                        <option value="price_asc">Precio: menor a mayor</option>
                        <option value="price_desc">Precio: mayor a menor</option>
                        <option value="date_asc">Fecha de salida más próxima</option>
                    </select>

                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="filter-clear-btn">
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="empty-state">Buscando paquetes...</div>
            ) : packages.length === 0 ? (
                <div className="empty-state">
                    {hasActiveFilters
                        ? 'No se encontraron paquetes con los filtros aplicados'
                        : 'No hay paquetes disponibles'}
                </div>
            ) : (
                <div className="packages-grid">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="package-card">
                            <div className="package-card-header">
                                <span className="package-classification">{pkg.classificationPackage}</span>
                                <span className="package-duration"> {pkg.durationPackage} días</span>
                            </div>
                            <h2>{pkg.namePackage}</h2>
                            <p>Destino: <span>{pkg.destinationPackage}</span></p>
                            <p className="package-price">${pkg.pricePackage.toLocaleString()}</p>
                            <div className="package-dates">
                                <span className="package-date-badge">
                                    Salida: {formatLocalDate(pkg.startDate)}
                                </span>
                                <span className="package-date-badge">
                                    Regreso: {formatLocalDate(pkg.endDate)}
                                </span>
                            </div>
                            <p className="package-quotas">{pkg.availableQuotas} cupos disponibles</p>
                            <button className="package-button" onClick={() => openModal(pkg)}>
                                Ver más detalles
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && selectedPackage && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="view-modal" onClick={e => e.stopPropagation()}>
                        <h2>{selectedPackage.namePackage}</h2>

                        <div className="view-modal-section">
                            <span className="package-classification">{selectedPackage.classificationPackage}</span>
                        </div>

                        <div className="view-modal-row">
                            <div className="field">
                                <label>Destino</label>
                                <p>{selectedPackage.destinationPackage}</p>
                            </div>
                            <div className="field">
                                <label>Duración</label>
                                <p>{selectedPackage.durationPackage} días</p>
                            </div>
                        </div>

                        <div className="field">
                            <label>Descripción</label>
                            <p>{selectedPackage.descriptionPackage}</p>
                        </div>

                        <div className="view-modal-row">
                            <div className="field">
                                <label>Fecha de salida</label>
                                <p>{formatLocalDate(selectedPackage.startDate)}</p>
                            </div>
                            <div className="field">
                                <label>Fecha de regreso</label>
                                <p>{formatLocalDate(selectedPackage.endDate)}</p>
                            </div>
                        </div>

                        <div className="view-modal-row">
                            <div className="field">
                                <label>Precio por persona</label>
                                <p className="package-price">${selectedPackage.pricePackage.toLocaleString('en-US')}</p>
                            </div>
                            <div className="field">
                                <label>Cupos disponibles</label>
                                <p>{selectedPackage.availableQuotas}</p>
                            </div>
                        </div>

                        <div className="field">
                            <label>Servicios incluidos</label>
                            <p>{selectedPackage.servicePackage}</p>
                        </div>

                        <div className="view-modal-row">
                            <div className="field">
                                <label>Condiciones</label>
                                <p>{selectedPackage.conditionPackage}</p>
                            </div>
                            <div className="field">
                                <label>Restricciones</label>
                                <p>{selectedPackage.restrictionPackage}</p>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="action-btn-delete-btn" onClick={closeModal}>Cerrar</button>
                            <button className="action-btn-edit-btn" onClick={() => navigate("/client/reservation", { state: { pkg: selectedPackage } })}>Reservar ahora</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewPackages;