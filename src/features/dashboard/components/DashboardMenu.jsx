import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './DashboardMenu.css';

const menuItems = [
  { label: 'Inicio', to: '/dashboard#hero' },
  { label: 'Reservar', to: '/reservar' },
  { label: 'Servicios', to: '/dashboard#servicios' },
  { label: 'Galeria', to: '/dashboard#gallery' },
  { label: 'Tarifa', to: '/dashboard#tarifas' },
  { label: 'Contacto', to: '/dashboard#hero' },
];

function DashboardMenu() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="villa-header">
      <div className="brand-block">
        <span className="brand-icon" aria-hidden="true">
          ^
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

        <Link className="admin-btn admin-btn-mobile" to="/login" onClick={closeMobileMenu}>
          Iniciar sesion
        </Link>
      </nav>

      <Link className="admin-btn" to="/login">
        Iniciar sesion
      </Link>
    </header>
  );
}

export default DashboardMenu;
