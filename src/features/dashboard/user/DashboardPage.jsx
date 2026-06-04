import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DashboardMenu from './components/DashboardMenu';
import { getPropertyById } from '../../../api/properties';
import { getParcingRules } from '../../../api/properties';
import './DashboardPage.css';

function buildPropertyImageSrc(image) {
  if (!image) {
    return '';
  }
  if (typeof image === 'object') {
    const base64 = image.image_data || image.base64 || image.data || image.content;
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

function formatPricingDate(dateValue) {
  if (!dateValue) {
    return '';
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  const formattedDate = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);

  return formattedDate.replace('.', '');
}

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
    title: 'Capacidad Personas',
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

const propertyIdFromStorage = JSON.parse(localStorage.getItem('property')) || null;


const pricingPlanTemplates = [
  {
    id: 'semana',
    price: '$350.000',
    per: '/ dia',
    featured: false,
    features: ['Lunes a Jueves', `Hasta ${propertyIdFromStorage?.maxCapacity || 10} personas`, 'Zonas comunes y BBQ', 'Parqueadero'],
  },
  {
    id: 'finde',
    name: 'Fin de Semana',
    price: '$550.000',
    per: '/ dia',
    featured: true,
    features: [
      `Hasta ${propertyIdFromStorage?.maxCapacity || 50} personas`,
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
      `Hasta ${propertyIdFromStorage?.maxCapacity || 50} personas`,
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
  const [pricingRules, setPricingRules] = useState([]);
  const storedProperty = localStorage.getItem('property') ? JSON.parse(localStorage.getItem('property')) : null;
  const propertyId = storedProperty?.id ?? storedProperty?.property_id ?? storedProperty?.propertyId ?? storedProperty;
  const [property, setProperty] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadProperty = async () => {
      if (!propertyId) {
        return;
      }

      try {
        const response = await getPropertyById(propertyId);
        const loadedProperty = response?.data?.data || response?.data || null;

        if (mounted) {
          setProperty(loadedProperty);
        }
      } catch (error) {
        console.error('Error al cargar la propiedad:', error);

        if (mounted) {
          setProperty(storedProperty);
        }
      }
    };

    loadProperty();

    return () => {
      mounted = false;
    };
  }, [propertyId]);

  useEffect(() => {
    let mounted = true;

    const loadPricingRules = async () => {
      if (!propertyId) {
        return;
      }

      try {
        const response = await getParcingRules(propertyId);
        const rules = response?.data?.data || response?.data || [];

        if (mounted) {
          setPricingRules(Array.isArray(rules) ? rules : []);
        }
      } catch (error) {
        console.error('Error al cargar las reglas de precio:', error);

        if (mounted) {
          setPricingRules([]);
        }
      }
    };

    loadPricingRules();

    return () => {
      mounted = false;
    };
  }, [propertyId]);

  const galleryItems = buildGalleryItems(property);
  const heroBackgroundImage = galleryItems.find((item) => item.hasImage)?.image || '';
  const propertyCapacity = property?.maxCapacity ?? 50;
  const basePricePerNight = Number(
    property?.base_price_per_night ??
    property?.basePricePerNight ??
    storedProperty?.base_price_per_night ??
    storedProperty?.basePricePerNight ??
    0
  );

 const now = Date.now();

const pricingPlans = pricingRules
  .slice()
  .sort((a, b) => {
    const getPriority = (rule) => {
      const start = new Date(rule.start_date).getTime();
      const end = new Date(rule.end_date).getTime();

      if (now >= start && now <= end) return 0; // Vigente
      if (start > now) return 1; // Próxima
      return 2; // Pasada
    };

    const priorityA = getPriority(a);
    const priorityB = getPriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    const startA = new Date(a.start_date).getTime();
    const startB = new Date(b.start_date).getTime();

    // Futuras: la más cercana primero
    if (priorityA === 1) {
      return startA - startB;
    }

    // Pasadas: la más reciente primero
    if (priorityA === 2) {
      return startB - startA;
    }

    return 0;
  })
  .slice(0, 3)
  .map((rule, index) => {
    const template =
      pricingPlanTemplates[index] ||
      pricingPlanTemplates[pricingPlanTemplates.length - 1];

    const modifier = Number(rule?.price_modifier ?? 1);
    const computedPrice = basePricePerNight * modifier;

    const formattedPrice =
      computedPrice > 0
        ? `$${new Intl.NumberFormat("es-CO", {
            maximumFractionDigits: 0,
          }).format(computedPrice)}`
        : template.price;

    return {
      id: rule?.id ?? template.id,
      name: rule?.name || template.name,
      price: formattedPrice,
      per: template.per,
      featured: template.featured,
      features: template.features,
      inicio: rule?.start_date || "",
      fin: rule?.end_date || "",
    };
  });

  const pricingPlansToRender = pricingPlans.length > 0 ? pricingPlans : pricingPlanTemplates;
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
          <section
            id="hero"
            className="hero-section"
            aria-label="Presentacion principal"
            style={{ backgroundImage: heroBackgroundImage ? `url("${heroBackgroundImage}")` : 'none' }}
          >
            <div className="hero-overlay" />

            <div className="hero-content">
              <div className="hero-location-row">
                <FontAwesomeIcon icon={faLocationDot} />
                <p className="hero-location">{storedProperty?.address || ''}</p>
              </div>
              <h1>Tu escape rural te espera</h1>
              <p>
                {storedProperty?.description || ''}
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
                  {service.id === 'capacidad' && <p>{`Hasta ${storedProperty?.maxCapacity || 10} personas`}</p>}
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
              {pricingPlansToRender.map((plan) => (
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

                  {plan.inicio && plan.fin && (
                    <p className="pricing-range">
                      <span>Inicio {formatPricingDate(plan.inicio)}</span>
                      <span>Fin {formatPricingDate(plan.fin)}</span>
                    </p>
                  )}

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
                  <p className="contact-footer__brand-title">{storedProperty?.name || 'Green House'}</p>
                  <p className="contact-footer__brand-copy">
                    {storedProperty?.description || 'Un lugar magico para tus eventos especiales en Motavita, Boyaca.'}
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
                  <span>{storedProperty?.address || 'Motavita, Boyacá, Colombia'}</span>
                </div>
              </div>

              <div className="contact-footer__divider" />

              <p className="contact-footer__copyright">
                2026 Green House. Todos los derechos reservados.
              </p>
            </div>
          </footer>
        </>
      )}


    </main>
  );
}

export default DashboardPage;
