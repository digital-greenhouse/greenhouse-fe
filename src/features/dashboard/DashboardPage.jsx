import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardMenu from './components/DashboardMenu';
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

  return (
    <main className="villa-page">
      <DashboardMenu />

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
            <Link className="hero-action-primary" to="/reservar">
              Reservar Ahora
            </Link>
            <a className="hero-action-secondary" href="#gallery">
              Ver Galeria
            </a>
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
