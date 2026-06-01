import { useEffect, useState } from 'react';
import {
    faBed,
    faChevronLeft,
    faChevronRight,
    faEye,
    faLocationDot,
    faList,
    faSearch,
    faSliders,
    faTableCellsLarge,
    faTag,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import './DashboardProperties.css';

const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80';

function formatCurrency(value) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return '$0';
    }

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(numericValue);
}

function formatStatus(status) {
    if (typeof status !== 'string') {
        return 'Inactiva';
    }

    return status.toUpperCase() === 'ACTIVE' ? 'Activa' : 'Inactiva';
}

function buildImageSrc(image) {
    if (!image) {
        return FALLBACK_IMAGE;
    }

    if (typeof image === 'string') {
        if (image.startsWith('data:') || image.startsWith('http')) {
            return image;
        }

        return `data:image/png;base64,${image}`;
    }

    const base64 = image.image_data || image.base64 || image.data || image.content;

    if (typeof image.url === 'string' && image.url) {
        return image.url;
    }

    if (typeof base64 !== 'string' || !base64) {
        return FALLBACK_IMAGE;
    }

    if (base64.startsWith('data:')) {
        return base64;
    }

    const mimeType = image.mime_type || image.mimeType || 'image/png';
    return `data:${mimeType};base64,${base64}`;
}

function normalizeImageList(property) {
    const candidates = [
        property?.images,
        property?.property_images,
        property?.propertyImages,
        property?.image_list,
        property?.gallery,
        property?.photos,
        property?.media,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate) && candidate.length > 0) {
            return candidate
                .slice()
                .sort((left, right) => {
                    const leftCover = left?.is_cover ? 1 : 0;
                    const rightCover = right?.is_cover ? 1 : 0;

                    if (leftCover !== rightCover) {
                        return rightCover - leftCover;
                    }

                    const leftOrder = Number(left?.sort_order ?? Number.MAX_SAFE_INTEGER);
                    const rightOrder = Number(right?.sort_order ?? Number.MAX_SAFE_INTEGER);

                    return leftOrder - rightOrder;
                });
        }
    }

    return [];
}

function getPropertyImage(property) {
    const imageList = normalizeImageList(property);
    const firstImage = imageList[0];

    if (firstImage) {
        return {
            src: buildImageSrc(firstImage),
            alt: firstImage.alt_text || property?.name || 'Propiedad',
        };
    }

    const directImage = property?.image_data || property?.imageData || property?.image;

    if (typeof directImage === 'string' && directImage) {
        return {
            src: directImage.startsWith('data:') ? directImage : `data:image/png;base64,${directImage}`,
            alt: property?.name || 'Propiedad',
        };
    }

    return {
        src: FALLBACK_IMAGE,
        alt: property?.name || 'Propiedad',
    };
}

function PropertyCardMedia({ images, fallbackImage, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) {
            setCurrentIndex(0);
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setCurrentIndex((previousIndex) => (previousIndex + 1) % images.length);
        }, 3000);

        return () => window.clearInterval(intervalId);
    }, [images]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [images]);

    const visibleImages = images && images.length > 0 ? images : [fallbackImage];
    const activeImage = visibleImages[currentIndex] || visibleImages[0] || fallbackImage;

    return (
        <div className="property-card__carousel">
            <img src={activeImage.src} alt={activeImage.alt || name || 'Propiedad'} loading="lazy" />

            {visibleImages.length > 1 && (
                <div className="property-card__carousel-indicators" aria-hidden="true">
                    {visibleImages.map((image, index) => (
                        <span
                            key={`${image.src}-${index}`}
                            className={index === currentIndex ? 'is-active' : ''}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

PropertyCardMedia.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.shape({
            src: PropTypes.string.isRequired,
            alt: PropTypes.string,
        })
    ),
    fallbackImage: PropTypes.shape({
        src: PropTypes.string.isRequired,
        alt: PropTypes.string,
    }).isRequired,
    name: PropTypes.string,
};

function DashboardProperties({
    sectionMode,
    stats,
    loading,
    error,
    searchTerm,
    onSearchTermChange,
    statusFilter,
    onStatusFilterChange,
    sortBy,
    onSortByChange,
    viewMode,
    onViewModeChange,
    sectionTitle,
    sectionCopy,
    visibleProperties,
    resultsLabel,
    onManageProperty,
}) {
    const handleViewPublicSite = (property) => {
        localStorage.setItem('property', JSON.stringify(property));
        window.location.assign('/dashboard');
     }
    return (
        <>
            <section className="properties-hero">
                <div className="properties-hero__content">
                    <h2>{sectionTitle}</h2>
                    <p>{sectionCopy}</p>

                    {sectionMode === 'owned' && (
                        <div className="properties-stats" aria-label="Resumen de propiedades">
                            <span className="properties-stat is-active">{stats.active} Activas</span>
                            <span className="properties-stat is-inactive">{stats.inactive} Inactivas</span>
                            <span className="properties-stat">{stats.total} Total</span>
                        </div>
                    )}
                </div>

                <div className="properties-hero__art" aria-hidden="true">
                    <div className="properties-hero__cloud properties-hero__cloud--one" />
                    <div className="properties-hero__cloud properties-hero__cloud--two" />
                    <div className="properties-hero__tree properties-hero__tree--left" />
                    <div className="properties-hero__mountains" />
                    <div className="properties-hero__house" />
                    <div className="properties-hero__tree properties-hero__tree--right" />
                </div>
            </section>

            <section className="properties-controls" aria-label="Filtros de propiedades">
                <label className="properties-search">
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => onSearchTermChange(event.target.value)}
                        placeholder="Buscar propiedad por nombre o ubicación..."
                    />
                </label>

                <label className="properties-select">
                    <span>Estado:</span>
                    <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
                        <option value="all">Todas</option>
                        <option value="active">Activas</option>
                        <option value="inactive">Inactivas</option>
                    </select>
                </label>

                <label className="properties-select">
                    <span>Ordenar por:</span>
                    <select value={sortBy} onChange={(event) => onSortByChange(event.target.value)}>
                        <option value="recent">Más recientes</option>
                        <option value="older">Más antiguas</option>
                        <option value="name">Nombre</option>
                        <option value="price">Precio</option>
                    </select>
                </label>

                <div className="properties-view-toggle" role="group" aria-label="Cambiar vista">
                    <button
                        type="button"
                        className={viewMode === 'grid' ? 'is-active' : ''}
                        onClick={() => onViewModeChange('grid')}
                        aria-label="Vista de cuadrícula"
                    >
                        <FontAwesomeIcon icon={faTableCellsLarge} />
                    </button>
                    <button
                        type="button"
                        className={viewMode === 'list' ? 'is-active' : ''}
                        onClick={() => onViewModeChange('list')}
                        aria-label="Vista de lista"
                    >
                        <FontAwesomeIcon icon={faList} />
                    </button>
                </div>
            </section>

            {loading ? (
                <section className="properties-state properties-state--loading" aria-live="polite">
                    <div className="properties-skeleton" />
                    <div className="properties-skeleton" />
                </section>
            ) : error ? (
                <section className="properties-state properties-state--error" role="alert">
                    <strong>No pudimos cargar tus propiedades.</strong>
                    <p>{error}</p>
                    <button type="button" onClick={() => window.location.reload()}>
                        Reintentar
                    </button>
                </section>
            ) : visibleProperties.length === 0 ? (
                <section className="properties-state properties-state--empty">
                    <strong>
                        {sectionMode === 'explore'
                            ? 'No hay propiedades disponibles para explorar.'
                            : 'No hay propiedades para mostrar.'}
                    </strong>
                    <p>
                        {sectionMode === 'explore'
                            ? 'Prueba ajustar los filtros o cambia a Mis propiedades.'
                            : 'Prueba ajustar los filtros o publica una nueva propiedad.'}
                    </p>
                </section>
            ) : (
                <section className={`properties-grid ${viewMode === 'list' ? 'is-list' : ''}`}>
                    {visibleProperties.map((property) => (
                        <article key={property.id} className="property-card">
                            <div className="property-card__media">
                                <PropertyCardMedia
                                    images={property.images}
                                    fallbackImage={property.image}
                                    name={property.name}
                                />
                                <span className={`property-card__status ${property.status === 'ACTIVE' ? 'is-active' : 'is-inactive'}`}>
                                    {formatStatus(property.status)}
                                </span>
                            </div>

                            <div className="property-card__body">
                                <div>
                                    <h3>{property.name}</h3>
                                    <p className="property-card__address">
                                        <FontAwesomeIcon icon={faLocationDot} />
                                        <span>{property.address}</span>
                                    </p>
                                </div>

                                <div className="property-card__meta">
                                    <span>
                                        <FontAwesomeIcon icon={faUsers} />
                                        {property.maxCapacity} personas
                                    </span>
                                    <span>
                                        <FontAwesomeIcon icon={faBed} />
                                        4 habitaciones
                                    </span>
                                    <span>
                                        <FontAwesomeIcon icon={faTag} />
                                        {formatCurrency(property.basePricePerNight)} / noche
                                    </span>
                                </div>

                                <div className={`property-card__actions ${sectionMode === 'explore' ? 'is-explore' : ''}`}>
                                    <button type="button" className="property-card__action is-secondary" onClick={handleViewPublicSite.bind(null, property)}>
                                        <FontAwesomeIcon icon={faEye} />
                                        Ver sitio público
                                    </button>
                                    {sectionMode === 'owned' && (
                                        <button
                                            type="button"
                                            className="property-card__action is-primary"
                                            onClick={() => onManageProperty(property)}
                                        >
                                            <FontAwesomeIcon icon={faSliders} />
                                            Administrar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            )}

            <footer className="properties-footer">
                <p>{resultsLabel}</p>

                <div className="properties-pagination" aria-label="Paginación de propiedades">
                    <button type="button" aria-label="Página anterior">
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button type="button" className="is-active" aria-current="page">
                        1
                    </button>
                    <button type="button" aria-label="Página siguiente">
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </footer>
        </>
    );
}

DashboardProperties.propTypes = {
    sectionMode: PropTypes.oneOf(['explore', 'owned']).isRequired,
    stats: PropTypes.shape({
        active: PropTypes.number.isRequired,
        inactive: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired,
    }).isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string.isRequired,
    searchTerm: PropTypes.string.isRequired,
    onSearchTermChange: PropTypes.func.isRequired,
    statusFilter: PropTypes.string.isRequired,
    onStatusFilterChange: PropTypes.func.isRequired,
    sortBy: PropTypes.string.isRequired,
    onSortByChange: PropTypes.func.isRequired,
    viewMode: PropTypes.oneOf(['grid', 'list']).isRequired,
    onViewModeChange: PropTypes.func.isRequired,
    sectionTitle: PropTypes.string.isRequired,
    sectionCopy: PropTypes.string.isRequired,
    visibleProperties: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            address: PropTypes.string.isRequired,
            basePricePerNight: PropTypes.number.isRequired,
            maxCapacity: PropTypes.number.isRequired,
            status: PropTypes.string.isRequired,
            images: PropTypes.array,
            image: PropTypes.shape({
                src: PropTypes.string.isRequired,
                alt: PropTypes.string,
            }).isRequired,
            createdAt: PropTypes.string,
        })
    ).isRequired,
    resultsLabel: PropTypes.string.isRequired,
    onViewPublicSite: PropTypes.func.isRequired,
    onManageProperty: PropTypes.func.isRequired,
};

export default DashboardProperties;
