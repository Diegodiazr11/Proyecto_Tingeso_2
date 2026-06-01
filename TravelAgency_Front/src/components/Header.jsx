import { Link } from 'react-router-dom';
import './Header.css'
import keycloak from '../service/keyclaok'

function Header() {
    
    return (
        <header className="header">
            <Link to="/" className="header-logo">TravelAgency</Link>
            <nav className="header-nav">
                <Link to="/" className="header-btn">Inicio</Link>
                    <button className="header-btn login-special" onClick={() => keycloak.login(
                    )}>
                        Iniciar Sesión
                    </button>
            </nav>
        </header>
    );
}

export default Header;