import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './DashboardMenu.css';

const menuItems = [
  { label: 'Inicio', to: '/dashboard#hero' },
  { label: 'Reservar', to: '/reservar' },
  { label: 'Servicios', to: '/dashboard#hero' },
  { label: 'Galeria', to: '/dashboard#gallery' },
  { label: 'Ubicacion', to: '/dashboard#hero' },
  { label: 'Contacto', to: '/dashboard#hero' },
];

function DashboardMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMobileMenu = () => setMenuOpen(false);

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
          <Link key={item.label} to={item.to} onClick={closeMobileMenu}>
            {item.label}
          </Link>
        ))}

        <button className="admin-btn admin-btn-mobile" type="button">
          Admin
        </button>
      </nav>

      <button className="admin-btn" type="button">
        Admin
      </button>
    </header>
  );
}

export default DashboardMenu;
