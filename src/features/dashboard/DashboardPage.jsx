import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    title: 'Capacidad 100 Personas',
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
      const top = target.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }, [location.hash]);

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
          <article key={item.id} className={`gallery-card ${item.id}`}>
            <img src={item.image} alt={item.alt} loading="lazy" />
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
    </main>
  );
}

export default DashboardPage;
