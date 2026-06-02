import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import UserInfo from './userInfo/UserInfo';
import { extractRoleNames, getDisplayUserName, getUserName, parseStoredUser } from '../../../../components/utils/accountSession';
import './DashboardMenu.css';

const menuItems = [
  { label: 'Inicio', to: '/dashboard#hero' },
  { label: 'Reservar', to: '/reservar' },
  { label: 'Servicios', to: '/dashboard#servicios' },
  { label: 'Galeria', to: '/dashboard#gallery' },
  { label: 'Tarifa', to: '/dashboard#tarifas' },
  { label: 'Contacto', to: '/dashboard#contacto' },
  { label: 'Propiedades', to: '/properties' },
];

function DashboardMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [hasAuthToken, setHasAuthToken] = useState(Boolean(localStorage.getItem('authToken')));
  const storedUser = parseStoredUser();
  const userName = getUserName(storedUser);
  const displayUserName = getDisplayUserName(userName);
  const authActionsRef = useRef(null);
  const property = localStorage.getItem('property') ? JSON.parse(localStorage.getItem('property')) : null;
  const [userData, setUserData] = useState({
    //name: '', 
    email: '',
    roles: [],
  });

  const roleNames = extractRoleNames(userData.roles);
  const isSuperAdmin = roleNames.includes('SUPERADMIN');

  const closeMobileMenu = () => setMenuOpen(false);

  const clearSession = () => {
    const savedProperty = localStorage.getItem('property');
    localStorage.clear();
    if (savedProperty) {
      localStorage.setItem('property', savedProperty);
    }
    sessionStorage.clear();
    globalThis.dispatchEvent(new Event('auth-state-changed'));
    setHasAuthToken(false);
    setMenuOpen(false);
    setProfileMenuOpen(false);
    setShowUserInfo(false);
    setUserData({
      email: '',
      roles: [],
    });
  };

  const clearSessionAndGoLogin = () => {
    const hasProperty = Boolean(localStorage.getItem('property'));
    clearSession();

    if (!hasProperty) {
      navigate('/properties', { replace: true });
      return;
    }

    //navigate('/login', { replace: true, state: { backgroundLocation: location } });
  };

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    const top = target.getBoundingClientRect().top + globalThis.scrollY - 110;
    globalThis.scrollTo({ top, behavior: 'smooth' });
    globalThis.history.replaceState(null, '', `/dashboard#${sectionId}`);
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
    if (location.pathname.includes('/reservar')) {
      console.log('No se esta en dashboard ni en reservar, no se hace scroll');
      sessionStorage.clear();
    }

    closeMobileMenu();
  };

  useEffect(() => {
    const isOnLoginPage = typeof globalThis !== 'undefined' && globalThis.location.pathname === '/login';
    if (isOnLoginPage) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const property = localStorage.getItem('property');
      const rawUser = localStorage.getItem('user');
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (token !== null && user !== null && property !== null) {
        const data = jwtDecode(token);
        if (!data?.exp || data.exp * 1000 <= Date.now()) {
          // token expired: remove it but keep property so public dashboard can be viewed
          localStorage.removeItem('authToken');
          setHasAuthToken(false);
          setUserData({ email: '', roles: [] });
        } else {
          setUserData({
            email: data.email || '',
            roles: data.roles || data.role || [],
          });
          setHasAuthToken(true);
        }

      } else {
        // no property and no valid session — clear and go to login
        clearSession();
        clearSessionAndGoLogin();
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      // If a property is present, allow public dashboard view; otherwise redirect to login
      if (localStorage.getItem('property')) {
        clearSession();
        setHasAuthToken(false);
      } else {
        clearSessionAndGoLogin();
      }
    }
  }, [hasAuthToken, navigate]);



  const loginOption = () => {
    navigate('/login', { state: { backgroundLocation: location } });
  };

  const userOption = () => {
    setProfileMenuOpen(false);
    setShowUserInfo(true);
  };

  const adminOption = () => {
    setProfileMenuOpen(false);
    navigate('/admin/history-bookings');
  };

  const myBookingsOption = () => {
    setProfileMenuOpen(false);
    navigate('/dashboard/booking-actual');
  };

  const logoutOption = () => {
    const savedProperty = localStorage.getItem('property');
    localStorage.clear();
    if (savedProperty) {
      localStorage.setItem('property', savedProperty);
    }
    sessionStorage.clear();
    globalThis.dispatchEvent(new Event('auth-state-changed'));
    setHasAuthToken(false);
    closeMobileMenu();
    setProfileMenuOpen(false);
    setShowUserInfo(false);
    setShowLogoutConfirm(false);
    navigate('/login', {
      replace: true,
      state: {
        backgroundLocation: {
          pathname: '/properties',
          search: '',
          hash: '',
          state: null,
          key: 'logout-dashboard-background',
        },
      },
    });
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

    globalThis.addEventListener('auth-state-changed', syncAuthState);
    globalThis.addEventListener('storage', syncAuthState);
    globalThis.addEventListener('focus', syncAuthState);

    return () => {
      globalThis.removeEventListener('auth-state-changed', syncAuthState);
      globalThis.removeEventListener('storage', syncAuthState);
      globalThis.removeEventListener('focus', syncAuthState);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (globalThis.innerWidth > 1024) {
        setMenuOpen(false);
      }
    };

    globalThis.addEventListener('resize', handleResize);
    return () => globalThis.removeEventListener('resize', handleResize);
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
    globalThis.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      globalThis.removeEventListener('keydown', handleEscape);
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
          <p className="brand-title">{property?.name || ''}</p>
          <p className="brand-subtitle"></p>
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
              <span className="user-label" title={userName}>{displayUserName}</span>
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                className="admin-secondary-btn admin-btn-mobile"
                onClick={() => {
                  closeMobileMenu();
                  adminOption();
                }}
                disabled={!isSuperAdmin}
              >
                Administrador
              </button>
            )}

            <button
              type="button"
              className="admin-secondary-btn admin-btn-mobile"
              onClick={() => {
                closeMobileMenu();
                myBookingsOption();
              }}
            >
              Mis reservas
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
            <span className="user-label" title={userName}>{displayUserName}</span>
            <span className="user-caret" aria-hidden="true">▾</span>
          </button>

          <div className={`user-dropdown ${profileMenuOpen ? 'is-open' : ''}`} role="menu">
            <button type="button" className="admin-secondary-btn" onClick={userOption} role="menuitem">
              Mi cuenta
            </button>

            <button
              type="button"
              className="admin-secondary-btn"
              onClick={myBookingsOption}
              role="menuitem"
            >
              Mis reservas
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={adminOption}
                disabled={!isSuperAdmin}
                role="menuitem"
              >
                Administrador
              </button>
            )}

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

      <UserInfo
        show={showUserInfo}
        onHide={() => setShowUserInfo(false)}
      />
    </header>
  );
}

export default DashboardMenu;
