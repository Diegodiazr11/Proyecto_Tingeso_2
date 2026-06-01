import { useState, useEffect } from "react";
import api from "../service/axiosConfig"
import "./Profile.css";
import { useNavigate } from "react-router-dom";

function Profile({ keycloak }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        document: '',
        nationality: '',
        phone: '',
        newPassword: '',
        confirmPassword: ''
    });

    const keycloakId = keycloak.subject;

    useEffect(() => {
        if (keycloakId) {
            fetchUser();
        }
    }, [keycloakId]);

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

    const openModal = () => {
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            document: user.document,
            nationality: user.nationality,
            newPassword: '',
            confirmPassword: ''
        });
        setError(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const updateUser = async () => {
        setError(null);
        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                setError("Las contraseñas no coinciden");
                return;
            }
            if (formData.newPassword.length < 8) {
                setError("La contraseña debe tener al menos 8 caracteres");
                return;
            }
            if (!/[A-Z]/.test(formData.newPassword)) {
                setError("La contraseña debe tener al menos una mayúscula");
                return;
            }
            if (!/[a-z]/.test(formData.newPassword)) {
                setError("La contraseña debe tener al menos una minúscula");
                return;
            }
            if (!/[0-9]/.test(formData.newPassword)) {
                setError("La contraseña debe tener al menos un número");
                return;
            }
        }
        try {

            const body = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                document: formData.document,
                nationality: formData.nationality,
                ...(formData.newPassword && { password: formData.newPassword })
            };

            await api.put(`8001/api/user/update/${keycloakId}`, body);
            setUser({ ...user, ...formData });
            setSuccess("Datos actualizados");
            setTimeout(() => setSuccess(false), 3000);
            setTimeout(() => closeModal(), 3000);
        } catch (error) {
            console.error("Error updating user:", error);
            setError("Error al actualizar el usuario");
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async () => {
        const confirmed = window.confirm("¿Estás seguro de que deseas eliminar tu cuenta?")
        if (!confirmed) return

        try {
            const response = await api.delete(`8001/api/user/delete/${keycloakId}`)
            const { action } = response.data
            if (action === "DEACTIVATED") {
                setSuccess("Tu cuenta ha sido desactivada.")
                setTimeout(() => keycloak.logout({redirectUri: window.location.origin }), 2000)
            } else {
                keycloak.logout({redirectUri: window.location.origin });            
            }
            
        } catch (error) {
            console.log("Error delete user:", error)
            setError("Error al eliminar o desactivar al usuario")
        }
    };


    if (loading) return <p>Cargando...</p>;
    if (!user) return <p>Usuario no encontrado</p>;

    return (
        <div className="profile-container">

            <h1 className="profile-title">Mi Perfil</h1>

            <div className="profile-card">
                {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}
                {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

                <div className="profile-header">
                    <div className="avatar">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                        <p className="profile-name">{user.firstName} {user.lastName}</p>
                    </div>
                </div>

                <div className="profile-body">
                    <div className="profile-row">
                        <span>👤</span>
                        <span>Nombre: {user.firstName}</span>
                    </div>
                    <div className="profile-row">
                        <span>👤</span>
                        <span>Apellido: {user.lastName}</span>
                    </div>
                    <div className="profile-row">
                        <span>👤</span>
                        <span>Username: {user.username}</span>
                    </div>
                    <div className="profile-row">
                        <span>📧</span>
                        <span>Email: {user.email}</span>
                    </div>
                    <div className="profile-row">
                        <span>📞</span>
                        <span>Phone: {user.phone}</span>
                    </div>
                    <div className="profile-row">
                        <span>🪪</span>
                        <span>Documento: {user.document}</span>
                    </div>
                    <div className="profile-row">
                        <span>🌎</span>
                        <span>Nacionalidad: {user.nationality}</span>
                    </div>
                </div>

                <div className="profile-actions">
                    <button onClick={openModal}>Editar</button>
                    <button onClick={deleteUser}>Eliminar</button>
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}
                            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
                            <h2>Editar usuario</h2>

                            <div className="modal-row">
                                <div className="field">
                                    <label>Nombre</label>
                                    <input name="firstName" value={formData.firstName || ""} onChange={handleChange} />
                                </div>
                                <div className="field">
                                    <label>Apellido</label>
                                    <input name="lastName" value={formData.lastName || ""} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="field">
                                <label>Documento</label>
                                <input name="document" value={formData.document} onChange={handleChange} />
                            </div>

                            <div className="field">
                                <label>Email</label>
                                <input name="email" value={formData.email} onChange={handleChange} />
                            </div>

                            <div className="field">
                                <label>Nacionalidad</label>
                                <input name="nationality" value={formData.nationality} onChange={handleChange} />
                            </div>


                            <div className="field">
                                <label>Teléfono</label>
                                <input name="phone" value={formData.phone || ""} onChange={handleChange} />
                            </div>
                            <div className="field">
                                <label>Nueva contraseña</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="field">
                                <label>Confirmar contraseña</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="action-btn-delete-btn" onClick={closeModal}>Cancelar</button>
                                <button className="action-btn-edit-btn" onClick={updateUser}>Guardar cambios</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;