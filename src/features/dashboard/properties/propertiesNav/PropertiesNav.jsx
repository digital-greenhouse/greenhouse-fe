import { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { faBell, faBars, faHouse, faPlus, faSearch, faXmark, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getProperties } from '../../../../api/properties';
import { getPropertiesByOwner } from '../../../../api/properties';
import DashboardProperties from '../DashboardProperties';
import NewProperty from '../newProperty/NewProperty';
import UserInfo from '../../user/components/userInfo/UserInfo';
import { jwtDecode } from 'jwt-decode';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import FeedbackToast from '../../../../components/ui/FeedbackToast';
import {
    extractRoleNames,
    getDisplayUserName,
    getStoredUserId,
    getUserName,
    parseStoredUser,
} from '../../../../components/utils/accountSession';
import './PropertiesNav.css';

const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80';

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

function normalizePropertiesResponse(response) {
    const payload = response?.data;

    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    if (Array.isArray(payload?.results)) {
        return payload.results;
    }

    return [];
}

function isPropertyOwnedByUser(property, user) {
    if (!property || !user) {
        return false;
    }

    const propertyOwnerId =
        property.user_id ??
        property.userId ??
        property.owner_id ??
        property.ownerId ??
        property.created_by ??
        property.createdBy ??
        property.property_owner_id ??
        property.propertyOwnerId ??
        property.owner?.id ??
        property.user?.id;

    const userId = user.id ?? user.user_id ?? user.userId ?? user.owner_id ?? user.ownerId;

    if (propertyOwnerId === undefined || propertyOwnerId === null || userId === undefined || userId === null) {
        return false;
    }

    return `${propertyOwnerId}` === `${userId}`;
}

function PropertiesNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [viewMode, setViewMode] = useState('grid');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sectionMode, setSectionMode] = useState('explore');
    const [hasAuthToken, setHasAuthToken] = useState(Boolean(localStorage.getItem('authToken')));
    const [currentUser, setCurrentUser] = useState(() => parseStoredUser());
    const currentUserId = useMemo(() => getStoredUserId(currentUser), [currentUser]);
    const [isTokenChecked, setIsTokenChecked] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const authActionsRef = useRef(null);
    const [propertiesRefreshKey, setPropertiesRefreshKey] = useState(0);
    const [userData, setUserData] = useState({
        email: '',
        roles: [],
    });

    const userName = getUserName(currentUser);
    const displayUserName = getDisplayUserName(userName);
    const roleNames = extractRoleNames(userData.roles);
    const isSuperAdmin = roleNames.includes('SUPERADMIN');

    const syncAuthSession = () => {
        const token = localStorage.getItem('authToken');
        const storedUser = parseStoredUser();

        setCurrentUser(storedUser);

        if (token !== null) {
            try {
                const decodedToken = jwtDecode(token);

                if (decodedToken?.exp && decodedToken.exp * 1000 > Date.now()) {
                    setUserData({
                        email: decodedToken?.email || '',
                        roles: decodedToken?.roles || decodedToken?.role || [],
                    });
                    setHasAuthToken(true);
                    setIsTokenChecked(true);
                    return;
                }
            } catch (error) {
                console.error('Error al verificar el token:', error);
            }
        }

        localStorage.removeItem('authToken');
        setHasAuthToken(false);
        setIsTokenChecked(true);
        setUserData({
            email: '',
            roles: [],
        });
    };

    useEffect(() => {
        const handlePropertiesUpdated = () => {
            setPropertiesRefreshKey((currentValue) => currentValue + 1);
        };

        const handlePropertyFeedback = (event) => {
            const detail = event.detail || {};
            setFeedback({
                type: detail.type || 'info',
                message: detail.message || '',
            });
        };

        globalThis.addEventListener('properties-updated', handlePropertiesUpdated);
        globalThis.addEventListener('property-feedback', handlePropertyFeedback);

        return () => {
            globalThis.removeEventListener('properties-updated', handlePropertiesUpdated);
            globalThis.removeEventListener('property-feedback', handlePropertyFeedback);
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadProperties = async () => {
            try {
                setLoading(true);
                setError('');

                const ownerId = currentUserId;
                const response =
                    sectionMode === 'owned' && ownerId
                        ? await getPropertiesByOwner(ownerId)
                        : await getProperties();

                const normalized = normalizePropertiesResponse(response);
                const visible =
                    sectionMode === 'explore'
                        ? normalized.filter((property) => `${property?.status || ''}`.toUpperCase() === 'ACTIVE')
                        : normalized;

                if (mounted) {
                    setProperties(visible);
                }
            } catch (requestError) {
                console.error('Error al obtener propiedades:', requestError);

                if (mounted) {
                    setError('No fue posible cargar las propiedades. Intenta nuevamente.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadProperties();

        const handleResize = () => {
            if (window.innerWidth > 560) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            mounted = false;
            window.removeEventListener('resize', handleResize);
        };
    }, [sectionMode, currentUserId, propertiesRefreshKey]);

    useEffect(() => {
        syncAuthSession();
    }, []);

    useEffect(() => {
        const syncAuthState = () => {
            syncAuthSession();
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

    const normalizedProperties = useMemo(() => {
        return properties.map((property) => {
            const image = getPropertyImage(property);
            const images = normalizeImageList(property).map((item) => ({
                src: buildImageSrc(item),
                alt: item?.alt_text || property?.name || 'Propiedad',
            }));

            return {
                id: property?.id,
                name: property?.name || 'Propiedad sin nombre',
                description: property?.description || '',
                address: property?.address || 'Dirección no disponible',
                basePricePerNight: Number(property?.base_price_per_night ?? property?.basePricePerNight ?? 0),
                maxCapacity: Number(property?.max_capacity ?? property?.maxCapacity ?? 0),
                status: property?.status || 'INACTIVE',
                images: images.length > 0 ? images : [image],
                image,
                createdAt: property?.created_at || property?.createdAt || '',
            };
        });
    }, [properties]);

    const exploreProperties = useMemo(
        () => normalizedProperties.filter((property) => !isPropertyOwnedByUser(property, currentUser)),
        [normalizedProperties, currentUser]
    );

    const sectionProperties = sectionMode === 'explore' ? exploreProperties : normalizedProperties;

    const stats = useMemo(() => {
        const active = sectionProperties.filter((property) => property.status === 'ACTIVE').length;
        const inactive = sectionProperties.length - active;

        return {
            active,
            inactive,
            total: sectionProperties.length,
        };
    }, [sectionProperties]);

    const visibleProperties = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        const filtered = sectionProperties.filter((property) => {
            const matchesSearch =
                !search ||
                property.name.toLowerCase().includes(search) ||
                property.address.toLowerCase().includes(search) ||
                property.description.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && property.status === 'ACTIVE') ||
                (statusFilter === 'inactive' && property.status !== 'ACTIVE');

            return matchesSearch && matchesStatus;
        });

        const sorters = {
            recent: (left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0),
            older: (left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0),
            name: (left, right) => left.name.localeCompare(right.name, 'es'),
            price: (left, right) => right.basePricePerNight - left.basePricePerNight,
        };

        return filtered.sort(sorters[sortBy] || sorters.recent);
    }, [sectionProperties, searchTerm, sortBy, statusFilter]);

    const sectionTitle = sectionMode === 'explore' ? 'Explorar propiedades' : 'Mis propiedades';
    const sectionCopy =
        sectionMode === 'explore'
            ? 'Explora propiedades que no están registradas como tuyas desde el mismo panel.'
            : 'Gestiona la información, disponibilidad y reservas de tus propiedades.';
    const handleExploreProperties = () => {
        setSectionMode('explore');
        setIsMenuOpen(false);
        navigate('/properties');
    };

    const handleOwnedProperties = () => {
        setSectionMode('owned');
        setIsMenuOpen(false);
        navigate('/properties');
    };

    const handleToggleMenu = () => {
        setIsMenuOpen((previousValue) => !previousValue);
    };

    const handleMenuLinkClick = () => {
        setIsMenuOpen(false);
        setProfileMenuOpen(false);
    };

    const handleManageProperty = (property) => {
        localStorage.setItem('property', JSON.stringify(property));
    };

    const userOption = () => {
        setProfileMenuOpen(false);
        setShowUserInfo(true);
    };

    const adminOption = () => {
        setProfileMenuOpen(false);
        setIsMenuOpen(false);
        navigate('/admin/history-bookings');
    };

    const myBookingsOption = () => {
        setProfileMenuOpen(false);
        setIsMenuOpen(false);
        navigate('/properties/reservas');
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
        setIsMenuOpen(false);
        setProfileMenuOpen(false);
        setShowUserInfo(false);
        setShowLogoutConfirm(false);
        setSectionMode('explore');
        navigate('/properties', {
            replace: true,
            state: {
                backgroundLocation: {
                    pathname: '/dashboard',
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
        setIsMenuOpen(false);
        setShowLogoutConfirm(true);
    };

    const toggleProfileMenu = () => {
        setProfileMenuOpen((previousValue) => !previousValue);
    };

    const resultsLabel =
        visibleProperties.length === 1
            ? 'Mostrando 1 a 1 de 1 propiedad'
            : `Mostrando 1 a ${visibleProperties.length} de ${visibleProperties.length} propiedades`;

    const handeleShowViewNewProperty = () => {
        setProfileMenuOpen(false);
        setIsMenuOpen(false);
        navigate('/properties/new');
         
    };

    const isPropertiesChildRoute = location.pathname.startsWith('/properties/') && location.pathname !== '/properties';

    return (
        <main className="properties-dashboard">
            <header className="properties-topbar">
                <div className="properties-brand">
                    <div className="properties-brand__mark" aria-hidden="true">
                        <FontAwesomeIcon icon={faHouse} />
                    </div>
                    <div>
                        <h1>Green House</h1>
                    </div>
                </div>

                <button
                    type="button"
                    className="properties-topbar__menu-toggle"
                    onClick={handleToggleMenu}
                    aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={isMenuOpen}
                    aria-controls="properties-topbar-nav"
                >
                    <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
                </button>

                <nav
                    id="properties-topbar-nav"
                    className={`properties-topbar__nav ${isMenuOpen ? 'is-open' : ''}`}
                    aria-label="Navegación principal"
                >
                    {hasAuthToken && (
                        <>
                            <button
                                type="button"
                                className={`properties-topbar__link ${sectionMode === 'explore' ? 'is-active' : ''}`}
                                onClick={handleExploreProperties}
                            >
                                <FontAwesomeIcon icon={faSearch} />
                                Explorar
                            </button>
                            <button
                                type="button"
                                className={`properties-topbar__link ${sectionMode === 'owned' ? 'is-active' : ''}`}
                                onClick={handleOwnedProperties}
                            >
                                <FontAwesomeIcon icon={faHouse} />
                                Mis propiedades
                            </button>
                        </>
                    )}

                    <div className="properties-topbar__mobile-actions" aria-label="Acciones de propiedades">
                        {hasAuthToken ? (
                            <>
                                <button type="button" className="properties-topbar__publish" onClick={handeleShowViewNewProperty}>
                                    <FontAwesomeIcon icon={faPlus} />
                                    Publicar propiedad
                                </button>

                                <button
                                    type="button"
                                    className="properties-topbar__profile properties-topbar__mobile-user"
                                    onClick={() => {
                                        handleMenuLinkClick();
                                        userOption();
                                    }}
                                    aria-label="Ir a mi cuenta"
                                >
                                    <span className="properties-topbar__avatar" aria-hidden="true">
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="properties-topbar__profile-text">
                                        <strong title={userName}>{displayUserName}</strong>
                                        <small>Propietario</small>
                                    </span>
                                </button>

                                {isSuperAdmin && (
                                    <button
                                        type="button"
                                        className="properties-topbar__mobile-option properties-topbar__mobile-option--admin"
                                        onClick={() => {
                                            handleMenuLinkClick();
                                            adminOption();
                                        }}
                                    >
                                        Administrador
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="properties-topbar__mobile-option properties-topbar__mobile-option--bookings"
                                    onClick={() => {
                                        handleMenuLinkClick();
                                        myBookingsOption();
                                    }}
                                >
                                    Mis reservas
                                </button>

                                <button
                                    type="button"
                                    className="properties-topbar__mobile-option is-logout"
                                    onClick={requestLogout}
                                >
                                    Cerrar sesion
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="properties-topbar__mobile-option"
                                onClick={() => {
                                    handleMenuLinkClick();
                                    navigate('/login', { state: { backgroundLocation: location } });
                                }}
                            >
                                <FontAwesomeIcon icon={faArrowRightToBracket} />
                                Iniciar sesion
                            </button>
                        )}
                    </div>
                </nav>

                <div className="properties-topbar__actions" ref={authActionsRef}>
                    {hasAuthToken && (
                        <>
                            <button type="button" className="properties-topbar__publish" onClick={handeleShowViewNewProperty}>
                                <FontAwesomeIcon icon={faPlus} />
                                Publicar propiedad
                            </button>

                            <button type="button" className="properties-topbar__icon-btn" aria-label="Notificaciones">
                                <FontAwesomeIcon icon={faBell} />
                            </button>
                        </>
                    )}

                    {hasAuthToken ? (
                        <>
                            <button
                                type="button"
                                className={`properties-topbar__profile properties-topbar__profile-trigger ${profileMenuOpen ? 'is-open' : ''}`}
                                onClick={toggleProfileMenu}
                                aria-label="Abrir menu de usuario"
                                aria-expanded={profileMenuOpen}
                                aria-haspopup="menu"
                            >
                                <span className="properties-topbar__avatar" aria-hidden="true">
                                    {userName.charAt(0).toUpperCase()}
                                </span>
                                <span className="properties-topbar__profile-text">
                                    <strong title={userName}>{displayUserName}</strong>
                                   
                                </span>
                                <span className="properties-topbar__profile-caret" aria-hidden="true">▾</span>
                            </button>

                            <div className={`properties-topbar__user-dropdown ${profileMenuOpen ? 'is-open' : ''}`} role="menu">
                                <button type="button" className="properties-topbar__user-option" onClick={userOption} role="menuitem">
                                    Mi cuenta
                                </button>
                                <button type="button" className="properties-topbar__user-option" onClick={myBookingsOption} role="menuitem">
                                    Mis reservas
                                </button>
                                {isSuperAdmin && (
                                    <button type="button" className="properties-topbar__user-option" onClick={adminOption} role="menuitem">
                                        Administrador
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="properties-topbar__user-option is-logout"
                                    onClick={requestLogout}
                                    role="menuitem"
                                >
                                    Cerrar sesion
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="properties-topbar__profile properties-topbar__profile-login"
                            onClick={() => navigate('/login', { state: { backgroundLocation: location } })}
                        >
                            <FontAwesomeIcon icon={faArrowRightToBracket} />
                            Iniciar sesion
                        </button>
                    )}
                </div>
            </header>
            {isPropertiesChildRoute ? (
                <Outlet />
            ) : (
                <DashboardProperties
                    sectionMode={sectionMode}
                    stats={stats}
                    loading={loading}
                    error={error}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    sectionTitle={sectionTitle}
                    sectionCopy={sectionCopy}
                    visibleProperties={visibleProperties}
                    resultsLabel={resultsLabel}
                    onManageProperty={handleManageProperty}
                />
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
                user={currentUser}
            />

            <FeedbackToast
                show={Boolean(feedback.message)}
                type={feedback.type}
                message={feedback.message}
                onClose={() => setFeedback({ type: '', message: '' })}
            />

        </main>
    );
}

export default PropertiesNav;
