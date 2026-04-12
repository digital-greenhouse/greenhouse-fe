import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import './DashboardMenu.css';

const menuItems = [
  { label: 'Inicio', to: '/dashboard#hero' },
  { label: 'Reservar', to: '/reservar' },
  { label: 'Servicios', to: '/dashboard#servicios' },
  { label: 'Galeria', to: '/dashboard#gallery' },
  { label: 'Tarifa', to: '/dashboard#tarifas' },
  { label: 'Contacto', to: '/dashboard#hero' },
  { label: 'Propiedades', to: '/dashboard#hero' },
];

function DashboardMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hasAuthToken, setHasAuthToken] = useState(Boolean(localStorage.getItem('authToken')));
  const userName = localStorage.getItem('userName') || 'Usuario';
  const authActionsRef = useRef(null);
  const [userData, setUserData] = useState({
    //name: '', 
    email: '',
    roles: [],
  });

  const roleNames = Array.isArray(userData.roles)
    ? userData.roles.map((role) => (typeof role === 'string' ? role : role?.name)).filter(Boolean)
    : (typeof userData.roles === 'string' && userData.roles ? [userData.roles] : []);
  const isSuperAdmin = roleNames.includes('SUPERADMIN');

  const closeMobileMenu = () => setMenuOpen(false);

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    const top = target.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top, behavior: 'smooth' });
    window.history.replaceState(null, '', `/dashboard#${sectionId}`);
  };

  const handleMenuClick = (event, to) => {
    if (!to.startsWith('/dashboard#')) {
      closeMobileMenu();
      return;
    }

    const sectionId = to.split('#')[1];
    if (location.pathname === '/dashboard') {
      event.preventDefault();
      scrollToSection(sectionId);
      closeMobileMenu();
      return;
    }

    closeMobileMenu();
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      console.log("Token encontrado en localStorage:", token);
      if (token !== null) {
        const data = jwtDecode(token);
        if (!data?.exp || data.exp * 1000 <= Date.now()) {
          throw new Error('Token expirado');
        }
        //setIsTokenChecked(true);
        console.log("Token válido encontrado en localStorage", data);
        setUserData({
          email: data.email || '',
          roles: data.roles || data.role || [],
        });

      } else {
        localStorage.removeItem('authToken');
        console.log("Token inválido o expirado. Redirigiendo a login.");
        localStorage.clear();
        setUserData({
          email: '',
          roles: [],
        });
        //window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      localStorage.removeItem('authToken');
      setUserData({
        email: '',
        roles: [],
      });
      //window.location.href = '/login';
    }
  }, [hasAuthToken]);

  const loginOption = () => {
    navigate('/login', { state: { backgroundLocation: location } });
  };

  const userOption = () => {
    setProfileMenuOpen(false);
    navigate('/dashboard');
  };

  const adminOption = () => {
    setProfileMenuOpen(false);
    navigate('/admin');
  };

  const logoutOption = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('auth-state-changed'));
    setHasAuthToken(false);
    closeMobileMenu();
    setProfileMenuOpen(false);
    setShowLogoutConfirm(false);
    navigate('/dashboard', { replace: true });
  };

  const requestLogout = () => {
    setProfileMenuOpen(false);
    closeMobileMenu();
    setShowLogoutConfirm(true);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const syncAuthState = () => {
      setHasAuthToken(Boolean(localStorage.getItem('authToken')));
    };

    window.addEventListener('auth-state-changed', syncAuthState);
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('focus', syncAuthState);

    return () => {
      window.removeEventListener('auth-state-changed', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('focus', syncAuthState);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!authActionsRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className="villa-header">
      <div className="brand-block">
        <span className="brand-icon" aria-hidden="true">
          <svg viewBox="0 0 21 21" role="img" focusable="false">
            <path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z">
            </path>
          </svg>
        </span>
        <div className="brand-text">
          <p className="brand-title">Villa Encantada</p>
          <p className="brand-subtitle">La Villa del Amor</p>
        </div>
      </div>

      <button
        className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
        type="button"
        aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`menu-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Menu principal">
        {menuItems.map((item) => (
          <Link key={item.label} to={item.to} onClick={(event) => handleMenuClick(event, item.to)}>
            {item.label}
          </Link>
        ))}

        {hasAuthToken ? (
          <>
            <button
              type="button"
              className="admin-btn user-btn admin-btn-mobile"
              onClick={() => {
                closeMobileMenu();
                userOption();
              }}
              aria-label="Ir a mi cuenta"
            >
              <span className="user-avatar" aria-hidden="true">{userName.charAt(0).toUpperCase()}</span>
              <span className="user-label">{userName}</span>
            </button>

            <button
              type="button"
              className="admin-secondary-btn admin-btn-mobile"
              onClick={() => {
                closeMobileMenu();
                adminOption();
              }}
            >
              Administrador
            </button>

            <button
              type="button"
              className="logout-btn admin-btn-mobile"
              onClick={requestLogout}
            >
              Cerrar sesion
            </button>
          </>
        ) : (
          <Link
            className="admin-btn admin-btn-mobile"
            to="/login"
            state={{ backgroundLocation: location }}
            onClick={closeMobileMenu}
          >
            Iniciar sesion
          </Link>
        )}
      </nav>

      {hasAuthToken ? (
        <div className="auth-actions" aria-label="Acciones de cuenta" ref={authActionsRef}>
          <button
            type="button"
            className={`admin-btn user-btn user-menu-trigger ${profileMenuOpen ? 'is-open' : ''}`}
            onClick={toggleProfileMenu}
            aria-label="Abrir menu de usuario"
            aria-expanded={profileMenuOpen}
            aria-haspopup="menu"
          >
            <span className="user-avatar" aria-hidden="true">{userName.charAt(0).toUpperCase()}</span>
            <span className="user-label">{userName}</span>
            <span className="user-caret" aria-hidden="true">▾</span>
          </button>

          <div className={`user-dropdown ${profileMenuOpen ? 'is-open' : ''}`} role="menu">
            <button type="button" className="admin-secondary-btn" onClick={userOption} role="menuitem">
              Mi cuenta
            </button>

            <button
              type="button"
              className="admin-secondary-btn"
              onClick={adminOption}
              disabled={!isSuperAdmin}
              role="menuitem"
            >
              Administrador
            </button>

            <button type="button" className="logout-btn" onClick={requestLogout} role="menuitem">
              Cerrar sesion
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="admin-btn" onClick={loginOption}>
          Iniciar sesion
        </button>
      )}

      <ConfirmModal
        show={showLogoutConfirm}
        title="Cerrar sesion"
        message="Se cerrara tu sesion en este dispositivo. Deseas continuar?"
        confirmText="Cerrar sesion"
        cancelText="Cancelar"
        onConfirm={logoutOption}
        onCancel={() => setShowLogoutConfirm(false)}
        variant="danger"
      />
    </header>
  );
}

export default DashboardMenu;
