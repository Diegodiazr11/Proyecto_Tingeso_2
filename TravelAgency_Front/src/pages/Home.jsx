import { useEffect } from 'react';
import './Home.css';
import keycloak from '../service/keyclaok'

const Home = () => {
    useEffect(() => {

        document.body.style.overflow = 'hidden';

        return () => {

            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <>
        <div className="home-container">
            <h1 className="home-title">Bienvenido a TravelAgency</h1>
            <h2 className="home-subtitle">Inicia Sesión para poder ver los paquetes que tenemos para ti</h2>
            <div className="button-container">
                <div className="button-group">
                    <button className="client-login" onClick={() => keycloak.login(
                        )}>Iniciar sesión
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default Home;