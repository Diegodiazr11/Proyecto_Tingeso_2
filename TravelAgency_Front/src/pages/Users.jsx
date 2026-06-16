import api from "../service/axiosConfig"
import { useEffect, useState } from "react";
import "./Users.css";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRoles, setUserRoles] = useState({});
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);


    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({});

    const fetchUsers = async () => {
        try {
            const response = await api.get("api/user/search");
            const fetchedUsers = response.data;
            setUsers(fetchedUsers);
            await fetchAllRoles(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllRoles = async (fetchedUsers) => {
        const rolesMap = {};
        await Promise.all(
            fetchedUsers.map(async (user) => {
                if (!user.keycloakId) return;
                try {
                    const response = await api.get(`api/user/role?userId=${user.keycloakId}`);
                    const roles = response.data;

                    if (roles.includes("admin")) {
                        rolesMap[user.keycloakId] = "Admin";
                    } else if (roles.includes("user")) {
                        rolesMap[user.keycloakId] = "Cliente";
                    } else {
                        rolesMap[user.keycloakId] = "Sin rol";
                    }
                } catch (error) {
                    console.error("Error fetching role for user " + user.keycloakId, error);
                    rolesMap[user.keycloakId] = "Sin rol";
                }
            })
        );
        setUserRoles(rolesMap);
    };

    const openModal = (user) => {
        setSelectedUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            nationality: user.nationality,
            document: user.document,
            roles: [userRoles[user.keycloakId] === "Admin" ? "admin" : "user"]
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const updateUser = async () => {
        setError(null);
        try {
            await api.put(`api/user/update/${selectedUser.keycloakId}`, formData)
            await fetchUsers();
            setSuccess("Usuario actualizado correctamente.");
            setTimeout(() => setSuccess(false), 3000);
            closeModal();
        } catch (error) {
            console.error("Error updating user:", error);
            setError("Error al actualizar el usuario");
            closeModal();
        } finally {
            setLoading(false);
        }
    };

    const [userToDelete, setUserToDelete] = useState(null);

    const deleteUser = async () => {
        try {
            const response = await api.delete(`api/user/delete/${userToDelete}`); 
            const action = response.data?.action;
            await fetchUsers();
            setUserToDelete(null);
            if (action === "DEACTIVATED") {
                setSuccess("La cuenta ha sido desactivada.")
                setTimeout(() => setSuccess(false), 2000); 
            } else {
                setSuccess("La cuenta ha sido eliminada.")
                setTimeout(() => setSuccess(false), 2000);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setError("Error al eliminar el usuario");
            setUserToDelete(null);
        }   finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
    };

    return (
        <div className="users-wrapper">

            {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <div className="users-header">
                <div className="users-header-accent" />
                <h1>Usuarios</h1>
                <span>{users.length} registro{users.length !== 1 ? "s" : ''}</span>
            </div>


            <div className="users-card">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Nombre</th>
                            <th>Documento</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr className="loading-row">
                                <td colSpan={8}>Cargando usuarios...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="empty-state">
                                    No hay usuarios registrados
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="cell-username">
                                            <div className="avatar">
                                                {getInitials(user.firstName, user.lastName)}
                                            </div>
                                            {user.username}
                                        </div>
                                    </td>
                                    <td>{user.firstName}</td>
                                    <td className="cell-rut">{user.document}</td>
                                    <td className="cell-email">{user.email}</td>
                                    <td className="cell-phone">{user.phone}</td>
                                    <td>
                                        {userRoles[user.keycloakId] ?? <span className="loading-text">...</span>}
                                    </td>
                                    <td>{user.active ? "Activo" : "Inactivo"}</td>
                                    <td>
                                        <button
                                            className="action-btn-edit-btn"
                                            onClick={() => openModal(user)}
                                        >
                                            Editar
                                        </button>
                                        {user.active &&
                                            <button 
                                                className="action-btn-delete-btn"
                                                onClick={() => setUserToDelete(user.keycloakId)}
                                            >
                                                Eliminar
                                            </button>
                                        }
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Editar usuario</h2>

                        <div className="modal-row">
                            <div className="field">
                                <label>Nombre</label>
                                <input name="firstName" value={formData.firstName} onChange={handleChange} />
                            </div>
                            <div className="field">
                                <label>Apellido</label>
                                <input name="lastName" value={formData.lastName} onChange={handleChange} />
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
                            <input name="phone" value={formData.phone} onChange={handleChange} />
                        </div>

                        <div className="field">
                            <label>Rol</label>
                            <select
                                name="roles"
                                value={formData.roles?.[0]}
                                onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
                            >
                                <option value="user">Cliente</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button className="action-btn-delete-btn" onClick={closeModal}>Cancelar</button>
                            <button className="action-btn-edit-btn" onClick={updateUser}>Guardar cambios</button>
                        </div>
                    </div>
                </div>
            )}
            {userToDelete && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>¿Eliminar usuario?</h2>
                        <p>Esta acción no se puede deshacer.</p>
                        <div className="modal-actions">
                            <button className="action-btn-delete-btn" onClick={() => setUserToDelete(null)}>Cancelar</button>
                            <button className="action-btn-edit-btn" onClick={deleteUser}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Users;