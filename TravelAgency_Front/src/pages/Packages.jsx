import { useState, useEffect} from 'react';
import api from "../service/axiosConfig"
import './Packages.css';

function Packages() {

    const [formData, setFormData] = useState({
        namePackage: "",
        destinationPackage: "",
        pricePackage: "",
        durationPackage: "",
        startDate: "",
        endDate: "",
        descriptionPackage: "",
        servicePackage: "",
        conditionPackage: "",
        restrictionPackage: "",
        classificationPackage: "",
        availableQuotas: "",
    })

    const [promoFormData, setPromoFormData] = useState({
        name: '', description: '', percentageDiscount: '',
        startDate: '', endDate: '', activate: true,
    });

    const [promotion, setPromotion] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [promoError, setPromoError] = useState(null);
    const [promoSuccess, setPromoSuccess] = useState(null); 
    const [selectedPackageId, setSelectedPackageId] = useState(null);

    useEffect(() => {
        fetchPackages();
        fecthPromotion();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await api.get('/api/package/all');
            setPackages(response.data);
        } catch (error) {
            console.error("Error al cargar paquetes:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({...formData,[e.target.name]: e.target.value})
    }

    const handlePromoChange = (e) => {
        setPromoFormData({ ...promoFormData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (formData.pricePackage <= 0) {
            setError("El precio debe ser un número positivo");
            setLoading(false);
            return;
        }

        if (formData.durationPackage <= 0) {
            setError("La duración debe ser un número positivo");
            setLoading(false);
            return;
        }

        if (formData.availableQoutas < 0) {
            setError("Las cuotas disponibles no pueden ser negativas");
            setLoading(false);
            return;
        }

        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);

        if (isNaN(startDate) || isNaN(endDate)) {
            setError("Las fechas no son válidas");
            return;
        }
        if (endDate <= startDate) {
            setError("La fecha de término debe ser posterior a la fecha de inicio");
            return;
        }

        setLoading(true)

        try {
            const response = await api.post('/api/package/register', formData);
            fetchPackages();
            setFormData({
                namePackage: "",
                destinationPackage: "",
                pricePackage: "",
                durationPackage: "",
                startDate: "",
                endDate: "",
                descriptionPackage: "",
                servicePackage: "",
                conditionPackage: "",
                restrictionPackage: "",
                classificationPackage: "",
                availableQuotas: "",
            });
            setSuccess("¡Registro exitoso! Has creado un nuevo paquete")
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            setError(error.response?.data?.message ||"Error al crear el paquete");
        } finally {
            setLoading(false);
        }
    }

    const handleCancel = () => {
        setFormData({
            namePackage: "", destinationPackage: "", pricePackage: "",
            durationPackage: "", startDate: "", endDate: "",
            descriptionPackage: "", servicePackage: "", conditionPackage: "",
            restrictionPackage: "", classificationPackage: "", availableQuotas: "",
        });
    }

    const toggleStatus = async (id, currentStatus) => {
        if (!currentStatus) return;
        try {
            await api.put(`/api/package/deactivate/${id}`);
            fetchPackages();
        } catch (error) {
            alert("Error al desactivar el paquete");
        }
    };

    const openModal = (pkg) => {
        setSelectedId(pkg.id);
        setFormData({ ...pkg });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({
            namePackage: "", destinationPackage: "", pricePackage: "",
            durationPackage: "", startDate: "", endDate: "",
            descriptionPackage: "", servicePackage: "", conditionPackage: "",
            restrictionPackage: "", classificationPackage: "", availableQuotas: "",
        });
    };

    const updatePackage = async () => {
        setError(null)

        if (formData.pricePackage <= 0) {
            setError("El precio debe ser un número positivo");
            setLoading(false);
            return;
        }

        if (formData.durationPackage <= 0) {
            setError("La duración debe ser un número positivo");
            setLoading(false);
            return;
        }

        if (formData.availableQoutas < 0) {
            setError("Las cuotas disponibles no pueden ser negativas");
            setLoading(false);
            return;
        }
        setLoading(true)
        try {
            await api.put(`/api/package/update/${selectedId}`, formData);
            fetchPackages();
            setSuccess("Paqute actualizado");
            setTimeout(() => setSuccess(false), 3000);
            closeModal();
        } catch (error) {
            console.log(error)
            setError(error.response?.data?.message ||"Error al actualizar el paquete");
        } finally {
            setLoading(false);
        }
    };

    const createPromotion = async () => {
        setPromoError(null);
        
        if (!promoFormData.name || !promoFormData.percentageDiscount || !promoFormData.startDate) {
            setPromoError("Por favor, completa los campos obligatorios.");
            return;
        }
        if (promoFormData.percentageDiscount < 0 || promoFormData.percentageDiscount > 99) {
            setPromoError("El descuento no puede ser mayor a 99 y tampoco puede ser menor a 0.");
            return;
        }
        const startDate = new Date(promoFormData.startDate);
        const endDate = new Date(promoFormData.endDate);

        if (isNaN(startDate) || isNaN(endDate)) {
            setError("Las fechas no son válidas");
            return;
        }
        if (endDate <= startDate) {
            setError("La fecha de término debe ser posterior a la fecha de inicio");
            return;
        }

        setLoading(true);
        try {
            const dataToSend = {
                name: promoFormData.name,
                description: promoFormData.description,
                percentageDiscount: parseFloat(promoFormData.percentageDiscount),
                startDate: `${promoFormData.startDate}T00:00:00`,
                endDate: `${promoFormData.endDate}T23:59:59`,
                active: true,
                travelPackage: { 
                    id: parseInt(selectedPackageId) 
                }
            };
            const response = await api.post("/api/promotions/create", dataToSend);
            fecthPromotion(); 
            setPromoSuccess("¡Promoción creada exitosamente!");
            setPromoFormData({ name: '', description: '', percentageDiscount: '', startDate: '', endDate: '', active: true });
        } catch (error) {
            console.error("Error completo:", error.response?.data);
            setPromoError(error.response?.data?.message || "Error al crear la promoción");
        } finally {
            setLoading(false);
        }
    };

    const fecthPromotion = async () => {
        try {
            const response = await api.get('/api/promotions/all');
            setPromotion(response.data);
        } catch (error) {
            console.error("Error al cargar paquetes:", error);
        }
    };

    const handleDeactivatePromo = async (id) => {
        if (!id) return; 

        try {
            setLoading(true);
            setError(null); 
            setPromoError(null); 

            await api.patch(`/api/promotions/deactivate/${id}`);

            setPromoSuccess("¡Estado de la promoción actualizado!");
            await fetchPromotion(); 
            setTimeout(() => setPromoSuccess(null), 3000);
        } catch (err) {
            console.error("Error al cambiar estado:", err);
        
            const errorMsg = err.response?.data?.message || "No se pudo cambiar el estado de la promoción.";
            setPromoError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <> 
        <div className="packages-page">
            <div className="users-header">
                <div className="users-header-accent" />
                <h1>Crear paquete</h1>
                <span>{packages.length} {packages.length == 1 ? 'paquete' : 'paquetes'} </span>
            </div>
            <div className="package-form">
                {success && <p style={{ color: "green" }}>{success}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                <h2 className="package-title">Nuevo Paquete Turístico</h2>
            
                <h3 className="package-subtitle">Información general</h3>
            
                <div className="form-group">
                    <label>Nombre del paquete</label>
                    <input
                        type="text"
                        name="namePackage"
                        value={formData.namePackage}
                        onChange={handleChange}
                        placeholder="Ej: La octava maravilla del mundo"
                    />
                </div>
            
                <div className="form-group">
                    <label>Destino</label>
                    <input
                        type="text"
                        name="destinationPackage"
                        value={formData.destinationPackage}
                        onChange={handleChange}
                        placeholder="Ej: Torres del Paine, Chile"
                    />
                </div>
            
                <div className="form-group">
                    <label>Clasificación</label>
                    <select
                        name="classificationPackage"
                        value={formData.classificationPackage}
                        onChange={handleChange}
                    >
                        <option value="">Seleccionar categoría</option>
                        <option>Aventura</option>
                        <option>Cultural</option>
                        <option>Relax</option>
                        <option>Gastronómico</option>
                        <option>Playa y sol</option>
                        <option>Romántico</option>
                        <option>Familiar</option>
                        <option>Ecoturismo</option>
                        <option>Lujo</option>
                    </select>
                </div>
            
                <div className="form-group">
                    <label>Cupos disponibles</label>
                    <input
                        type="number"
                        name="availableQuotas"
                        value={formData.availableQuotas}
                        onChange={handleChange}
                        placeholder="Ej: 20"
                        min="0"
                    />
                </div>

                <h3 className="package-subtitle">Fechas y duración</h3>

                <div className="form-row">
                    <div className="form-group">
                        <label>Fecha de inicio</label>
                        <input 
                            type="date" 
                            name="startDate" 
                            value={formData.startDate} 
                            onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Fecha de término</label>
                        <input 
                            type="date" 
                            name="endDate" 
                            value={formData.endDate} 
                            onChange={handleChange} />
                    </div>
                </div>
            
                <div className="form-group">
                    <label>Duración (días)</label>
                    <input
                        type="number"
                        name="durationPackage"
                        value={formData.durationPackage}
                        onChange={handleChange}
                        placeholder="Ej: 7"
                        min="0"
                    />
                </div>
            
                <h3 className="package-subtitle">Precio</h3>
            
                <div className="form-group">
                    <label>Precio por persona ($)</label>
                    <input
                        type="number"
                        name="pricePackage"
                        value={formData.pricePackage}
                        onChange={handleChange}
                        placeholder="$ 0.00"
                        min="0"
                        step="0.1"
                    />
                </div>
            
                <h3 className="package-subtitle">Descripción y condiciones</h3>
            
                <div className="form-group">
                    <label>Descripción detallada</label>
                    <textarea
                            name="descriptionPackage"
                            value={formData.descriptionPackage}
                            onChange={handleChange}
                            placeholder="Describe el paquete, experiencias incluidas, puntos destacados..."
                        />
                </div>
            
                <div className="form-group">
                    <label>Servicios incluidos</label>
                    <textarea
                        name="servicePackage"
                        value={formData.servicePackage}
                        onChange={handleChange}
                        placeholder="Ej: Traslados, desayuno..."
                    />
                </div>
            
                <div className="form-group">
                    <label>Condiciones</label>
                    <textarea
                        name="conditionPackage"
                        value={formData.conditionPackage}
                        onChange={handleChange}
                        placeholder="Ej: Tener buena condición fisica..."
                    />
                </div>
            
                <div className="form-group">
                    <label>Restricciones</label>
                    <textarea
                        name="restrictionPackage"
                        value={formData.restrictionPackage}
                        onChange={handleChange}
                        placeholder="Ej: Los menores de 14 años no pueden volar solos..."
                    />
                </div>
            
                <div className="form-group">
                    <button onClick={handleCancel} className="cancel-button">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="register-button" type="submit" disabled={loading}>
                        {loading ? "Registrando..." : "Registrar"}
                    </button>
                </div>
            </div>

            {success && <p style={{ color: "green" }}>{success}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <h2 className="package-title">Tabla de Paquete Turístico</h2>

            <table className="packages-table"> 
                    <thead className="packages-table-header">
                        <tr className="packages-table-row">
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Destino</th>
                            <th>Clasificación</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Término</th>
                            <th>Precio</th>
                            <th>Cupos</th>
                            <th>Estado</th>
                            <th style={{textAlign: 'center'}}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="packages-table-body">
                        {packages.length === 0 ? (
                            <tr>
                                <td colSpan="11">No hay paquetes registrados</td>
                            </tr>) 
                            : 
                            (packages.map((pkg) => (
                                <tr key={pkg.id} className="packages-table-row">
                                    <td>{pkg.id}</td>
                                    <td>{pkg.namePackage}</td>
                                    <td>{pkg.destinationPackage}</td>
                                    <td>{pkg.classificationPackage}</td>
                                    <td>{new Date(pkg.startDate).toLocaleDateString()}</td>
                                    <td>{new Date(pkg.endDate).toLocaleDateString()}</td>
                                    <td>${(pkg.pricePackage).toLocaleString('en-US')}</td>
                                    <td>{pkg.availableQuotas}</td>
                                    <td>{pkg.status ? "Activo" : "Inactivo"}</td>
                                    {pkg.status == true ? 
                                        <td>
                                            <button className="edit-button" onClick={() => openModal(pkg)}>Editar</button>
                                            <button
                                                onClick={() => toggleStatus(pkg.id, pkg.status)}
                                                disabled={!pkg.status} 
                                                className="toggle-status-button"
                                            >
                                                {pkg.status ? "Desactivar" : "Inactivo"}
                                            </button>
                                            <button className='select-package' onClick={() => setSelectedPackageId(pkg.id)}>Promo</button>
                                        </td> : ""
                                    }
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            {success && <p style={{ color: "green" }}>{success}</p>}
                            {error && <p style={{ color: "red" }}>{error}</p>}
                            <h2>Editar paquete</h2> 

                            <div className="modal-row">
                                <div className="field">
                                    <label>Precio ($)</label>
                                    <input name="pricePackage" value={formData.pricePackage || ""} onChange={handleChange} />
                                </div>  
                                <div className="field">
                                    <label>Cupos disponibles</label>
                                    <input name="availableQuotas" value={formData.availableQuotas || ""} onChange={handleChange} />
                                </div>
                            </div> 
                            
                            <div className="field">
                                <label>Descripcion del paquete</label>
                                <input name="descriptionPackage" value={formData.descriptionPackage || ""} onChange={handleChange} />
                            </div>

                            <div className="field">
                                <label>Servicios incluidos</label>
                                <input name="servicePackage" value={formData.servicePackage || ""} onChange={handleChange} />
                            </div>

                            <div className="field">
                                <label>Condiciones</label>
                                <input name="conditionPackage" value={formData.conditionPackage || ""} onChange={handleChange} />
                            </div>

                            <div className="field">
                                <label>Clasificación</label>
                                <select
                                    name="classificationPackage"
                                    value={formData.classificationPackage}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccionar categoría</option>
                                    <option>Aventura</option>
                                    <option>Cultural</option>
                                    <option>Relax</option>
                                    <option>Gastronómico</option>
                                    <option>Playa y sol</option>
                                    <option>Romántico</option>
                                    <option>Familiar</option>
                                    <option>Ecoturismo</option>
                                    <option>Lujo</option>
                                </select>
                            </div>

                            <div className="field">
                                <label>Restricciones</label>
                                <input name="restrictionPackage" value={formData.restrictionPackage || ""} onChange={handleChange} />
                            </div>

                            <div className="modal-actions">
                                <button className="action-btn-delete-btn" onClick={closeModal}>Cancelar</button>
                                <button className="action-btn-edit-btn" onClick={updatePackage}>Guardar cambios</button>
                            </div>
                        </div>
                    </div>
                )}
                {packages.length > 0 && (
                    <section className="promo-section">
                        <h2>Crear Promoción {selectedPackageId && `para Paquete #${selectedPackageId}`}</h2>
                        
                        {promoError && <p style={{ color: "red" }} className="error">{promoError}</p>}
                        {promoSuccess && <p style={{ color: "green" }} className="success">{promoSuccess}</p>}

                        <div className="promo-row-full">
                            <input
                                name="name"
                                placeholder="Nombre Promoción"
                                value={promoFormData.name}
                                onChange={handlePromoChange}
                            />
                        </div>

                        <div className="promo-row-full">
                            <input
                                name="description"
                                placeholder="Descripción de la promoción"
                                value={promoFormData.description}
                                onChange={handlePromoChange}
                            />
                        </div>

                        <div className="promo-row-triple">
                            <input
                                type="number"
                                name="percentageDiscount"
                                placeholder="%"
                                value={promoFormData.percentageDiscount}
                                onChange={handlePromoChange}
                                min={0}
                                max={99}
                            />
                            <input
                                type="date"
                                name="startDate"
                                value={promoFormData.startDate}
                                onChange={handlePromoChange}
                            />
                            <input
                                type="date"
                                name="endDate"
                                value={promoFormData.endDate}
                                onChange={handlePromoChange}
                            />
                        </div>

                        <button 
                            className="promo-submit-btn"
                            onClick={createPromotion} 
                            disabled={loading || !selectedPackageId}
                        >
                            {loading ? "Procesando..." : "Aplicar Promoción"}
                        </button>
                    </section>
                )}
                <h2 className="promotion-title">Tabla de Descuentos</h2>

                <table className="promotion-table">
                    <thead className="promotion-table-header">
                        <tr>
                            <th>#</th>
                            <th>NOMBRE PAQUETE</th>
                            <th>NOMBRE del DESCUENTO</th>
                            <th>DESCUENTO</th>
                            <th>FECHA INICIO</th>
                            <th>FECHA TÉRMINO</th>
                            <th >ESTADO</th>
                            <th style={{ textAlign: 'center' }}>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody className="promotion-table-body">
                        {promotion.length === 0 ? (
                        <tr>
                            <td colSpan="8">No hay promociones registradas</td>
                        </tr>
                        ) : (
                        promotion.map((pro) => (
                            <tr key={pro.id} className="promotion-table-row">
                                <td>{pro.id}</td>
                                <td>{pro.travelPackage?.namePackage || "Sin nombre"}</td>
                                <td>{pro.name}</td>
                                <td>{pro.percentageDiscount}%</td>
                                <td>{new Date(pro.startDate).toLocaleDateString()}</td>
                                <td>{new Date(pro.endDate).toLocaleDateString()}</td>
                                <td>{pro.active ? "Activo" : "Inactivo"}</td>
                                <td style={{ textAlign: 'center' }}>
                                    {pro.active ? 
                                    (<button
                                        className="toggle-status-button"
                                        style={{ backgroundColor: pro.active ? '#f0625d' : '#6c757d' }}
                                        onClick={() => handleDeactivatePromo(pro.id)}
                                        > Desactivar
                                    </button>) : ""}
                                </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                </table>
        </div>
        </>
    )
}

export default Packages;