import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import DashboardMenu from './components/DashboardMenu';
import './DashboardPage.css';

function buildPropertyImageSrc(image) {
  if (!image) {
    return '';
  }
  if (typeof image === 'object') {
    const base64 = image.src || image.base64 || image.data || image.content;
    if (typeof image.url === 'string' && image.url) {
      return image.url;
    }
    if (typeof base64 !== 'string' || !base64) {
      return '';
    }

    if (base64.startsWith('data:')) {
      return base64;
    }

    const mimeType = image.mime_type || image.mimeType || 'image/png';
    return `data:${mimeType};base64,${base64}`;
  }
  if (typeof image === 'string') {
    if (image.startsWith('data:') || image.startsWith('http')) {
      return image;
    }

    return `data:image/png;base64,${image}`;
  }

  return '';
}

function buildGalleryItems(property) {
  const images = Array.isArray(property?.images) ? property.images.slice() : [];

  const sortedImages = images.sort((left, right) => {
    const leftCover = left?.is_cover ? 1 : 0;
    const rightCover = right?.is_cover ? 1 : 0;

    if (leftCover !== rightCover) {
      return rightCover - leftCover;
    }

    const leftOrder = Number(left?.sort_order ?? Number.MAX_SAFE_INTEGER);
    const rightOrder = Number(right?.sort_order ?? Number.MAX_SAFE_INTEGER);

    return leftOrder - rightOrder;
  });

  const gallerySlots = ['main', 'interior', 'pool', 'terrace'];

  return gallerySlots.map((slot, index) => {
    const image = sortedImages[index];
    const imageSrc = buildPropertyImageSrc(image);
    return {
      id: slot,
      alt: image?.alt_text || property?.name || 'Propiedad',
      image: imageSrc,
      hasImage: Boolean(imageSrc),
    };
  });
}

const property = localStorage.getItem('property') ? JSON.parse(localStorage.getItem('property')) : null;


const services = [
  {
    id: 'finca',
    icon: 'FR',
    title: 'Finca Recreativa',
    description:
      'Espacios amplios ideales para celebraciones, reuniones familiares y eventos corporativos.',
  },
  {
    id: 'cocina',
    icon: 'CE',
    title: 'Cocina Equipada',
    description:
      'Cocina completa con utensilios, estufa y nevera para preparar tus comidas.',
  },
  {
    id: 'bbq',
    icon: 'BQ',
    title: 'Zona BBQ',
    description:
      'Area de barbecue techada con mesas y sillas para compartir al aire libre.',
  },
  {
    id: 'senderos',
    icon: 'SN',
    title: 'Senderos Naturales',
    description:
      'Caminos rodeados de naturaleza para caminatas y avistamiento de aves.',
  },
  {
    id: 'eventos',
    icon: 'ZE',
    title: 'Zona de Eventos',
    description:
      'Espacio adecuado para musica, baile y entretenimiento al aire libre.',
  },
  {
    id: 'parking',
    icon: 'PA',
    title: 'Parqueadero Amplio',
    description: 'Espacio amplio para vehiculos dentro de la propiedad.',
  },
  {
    id: 'capacidad',
    icon: 'C1',
    title: `Capacidad ${property?.maxCapacity || 50} Personas`,
    description: 'Amplios espacios para eventos grandes, reuniones y celebraciones.',
  },
  {
    id: 'entorno',
    icon: 'ET',
    title: 'Entorno Tranquilo',
    description:
      'Propiedad en zona rural con ambiente campestre y tranquilo en Motavita, Boyaca.',
  },
];

const pricingPlans = [
  {
    id: 'semana',
    name: 'Entre Semana',
    price: '$350.000',
    per: '/ dia',
    featured: false,
    features: ['Lunes a Jueves', 'Hasta 50 personas', 'Zonas comunes y BBQ', 'Parqueadero'],
  },
  {
    id: 'finde',
    name: 'Fin de Semana',
    price: '$550.000',
    per: '/ dia',
    featured: true,
    features: [
      'Viernes a Domingo',
      'Hasta 100 personas',
      'Zona BBQ y eventos',
      'Parqueadero',
      'Senderos naturales',
    ],
  },
  {
    id: 'alta',
    name: 'Temporada Alta',
    price: '$750.000',
    per: '/ dia',
    featured: false,
    features: [
      'Festivos y vacaciones',
      'Hasta 100 personas',
      'Todos los servicios',
      'Parqueadero',
      'Zona de eventos',
    ],
  },
];

function DashboardPage() {
  const location = useLocation();
  const actualLocation = globalThis.location.pathname;
  const galleryRef = useRef(null);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const galleryItems = buildGalleryItems(property);
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
    if (!location.hash) {
      return;
    }

    const sectionId = location.hash.replace('#', '');
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    requestAnimationFrame(() => {
      const top = target.getBoundingClientRect().top + globalThis.scrollY - 110;
      globalThis.scrollTo({ top, behavior: 'smooth' });
    });
  }, [location.hash]);



  return (
    <main className="villa-page">
      <DashboardMenu />
      {actualLocation.includes('/dashboard/booking-actual') ? <Outlet /> : (
        <>
          <section id="hero" className="hero-section" aria-label="Presentacion principal">
            <div className="hero-overlay" />

            <div className="hero-content">
              <p className="hero-location">{property?.address || ''}</p>
              <h1>Tu escape rural te espera</h1>
              <p>
                {property?.description || ''}
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

          <section id="servicios" className="services-section" aria-label="Servicios">
            <p className="services-kicker">Servicios</p>
            <h2>Todo lo que necesitas para un evento perfecto</h2>
            <p className="services-copy">
              Villa Encantada cuenta con amplios espacios para que tu unica preocupacion
              sea disfrutar.
            </p>

            <div className="services-grid">
              {services.map((service) => (
                <article key={service.id} className="service-card">
                  <span className="service-icon" aria-hidden="true">
                    {service.icon}
                  </span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="gallery"
            ref={galleryRef}
            className={`gallery-grid ${galleryVisible ? 'is-visible' : ''}`}
            aria-label="Galeria principal de la villa"
          >
            {galleryItems.map((item) => (
              <article key={item.id} className={`gallery-card ${item.id} ${item.hasImage ? 'has-image' : 'is-empty'}`}>
                {item.hasImage ? (
                  <img src={item.image} alt={item.alt} loading="lazy" />
                ) : (
                  <div className="gallery-card__placeholder" aria-hidden="true">
                    <span>{item.id}</span>
                  </div>
                )}
              </article>
            ))}
          </section>

          <section id="tarifas" className="pricing-section" aria-label="Tarifas">
            <h2>Precios transparentes, sin sorpresas</h2>
            <p>
              Consulta nuestras tarifas y reserva directamente. El precio final se calcula
              segun tus fechas y numero de asistentes.
            </p>

            <div className="pricing-grid">
              {pricingPlans.map((plan) => (
                <article
                  key={plan.id}
                  className={`pricing-card ${plan.featured ? 'is-featured' : ''}`}
                >
                  {plan.featured && <span className="pricing-badge">Popular</span>}

                  <h3>{plan.name}</h3>

                  <p className="pricing-price">
                    <strong>{plan.price}</strong>
                    <span>{plan.per}</span>
                  </p>

                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>

                  <Link className={`pricing-btn ${plan.featured ? 'is-featured' : ''}`} to="/reservar">
                    Cotizar
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <footer id="contacto" className="contact-footer" aria-label="Contacto">
            <div className="contact-footer__content">
              <div className="contact-footer__columns">
                <div className="contact-footer__brand">
                  <p className="contact-footer__brand-title">Villa Encantada La Villa del Amor</p>
                  <p className="contact-footer__brand-copy">
                    La Villa del Amor en Motavita, Boyacá. Finca recreativa para eventos,
                    naturaleza y experiencias inolvidables.
                  </p>
                </div>

                <nav className="contact-footer__links" aria-label="Enlaces del pie de página">
                  <h3>Enlaces</h3>
                  <a href="#hero">Inicio</a>
                  <a href="/reservar">Reservar</a>
                  <a href="#servicios">Servicios</a>
                  <a href="#gallery">Galeria</a>
                </nav>

                <div className="contact-footer__contact">
                  <h3>Contacto</h3>
                  <a href="tel:+573101234567">+57 310 123 4567</a>
                  <a href="mailto:reservas@villaencantada.com">reservas@villaencantada.com</a>
                  <span>Motavita, Boyacá, Colombia</span>
                </div>
              </div>

              <div className="contact-footer__divider" />

              <p className="contact-footer__copyright">
                2026 Villa Encantada - La Villa del Amor. Todos los derechos reservados.
              </p>
            </div>
          </footer>
        </>
      )}


    </main>
  );
}

export default DashboardPage;
