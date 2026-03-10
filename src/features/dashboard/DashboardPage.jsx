import { useEffect, useRef, useState } from 'react';
import './DashboardPage.css';

const galleryItems = [
  {
    id: 'main',
    alt: 'Vista de montanas de la villa',
    image:
      'https://images.unsplash.com/photo-1501554728187-ce583db33af7?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'interior',
    alt: 'Sala interior de la villa',
    image:
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'pool',
    alt: 'Piscina con vista al paisaje',
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'terrace',
    alt: 'Terraza iluminada de noche',
    image:
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=80',
  },
];

function DashboardPage() {
  const galleryRef = useRef(null);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMobileMenu = () => setMenuOpen(false);

  useEffect(() => {
    const section = galleryRef.current;
    if (!section) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGalleryVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22 }
    );

    observer.observe(section);

    return () => observer.disconnect();
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

  return (
    <main className="villa-page">
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

        <nav
          className={`menu-nav ${menuOpen ? 'is-open' : ''}`}
          aria-label="Menu principal"
        >
          <a href="#hero" onClick={closeMobileMenu}>
            Inicio
          </a>
          <a href="#hero" onClick={closeMobileMenu}>
            Reservar
          </a>
          <a href="#hero" onClick={closeMobileMenu}>
            Servicios
          </a>
          <a href="#gallery" onClick={closeMobileMenu}>
            Galeria
          </a>
          <a href="#hero" onClick={closeMobileMenu}>
            Ubicacion
          </a>
          <a href="#hero" onClick={closeMobileMenu}>
            Contacto
          </a>

          <button className="admin-btn admin-btn-mobile" type="button">
            Admin
          </button>
        </nav>

        <button className="admin-btn" type="button">
          Admin
        </button>
      </header>

      <section id="hero" className="hero-section" aria-label="Presentacion principal">
        <div className="hero-overlay" />

        <div className="hero-content">
          <p className="hero-location">Motavita, Boyaca - Colombia</p>
          <h1>Tu escape rural te espera</h1>
          <p>
            Celebra tus eventos en un entorno natural unico. Villa Encantada La Villa
            del Amor, finca recreativa con capacidad hasta 100 personas. Planifica tu
            evento y vive una experiencia inolvidable.
          </p>

          <div className="hero-actions">
            <button type="button">Reservar Ahora</button>
            <a href="#gallery">Ver Galeria</a>
          </div>
        </div>
      </section>

      <section
        id="gallery"
        ref={galleryRef}
        className={`gallery-grid ${galleryVisible ? 'is-visible' : ''}`}
        aria-label="Galeria principal de la villa"
      >
        {galleryItems.map((item) => (
          <article key={item.id} className={`gallery-card ${item.id}`}>
            <img src={item.image} alt={item.alt} loading="lazy" />
          </article>
        ))}
      </section>
    </main>
  );
}

export default DashboardPage;
