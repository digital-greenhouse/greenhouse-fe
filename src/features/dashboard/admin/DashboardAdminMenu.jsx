import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faBars, faRightFromBracket, faCalendarDays, faCircleArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Nav } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import './DashboardAdminMenu.css';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';



function AdminDashboard() {
  const [userData, setUserData] = useState({ name: '', lastName: '', email: '' });
  const [logout, setLogout] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuVisible, setMenuVisible] = useState(true);
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const loadInfoUser = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setUserData(user);
    } catch (error) {
      console.error("Error al cargar los datos del usuario", error);
      return {};
    }
  }

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token !== null && jwtDecode(token).exp * 1000 > Date.now()) {
        loadInfoUser();
        setIsTokenChecked(true);
      } else {
        localStorage.removeItem('authToken');
        const savedProperty = localStorage.getItem('property');
        localStorage.clear();
        if (savedProperty) {
          localStorage.setItem('property', savedProperty);
        }
        globalThis.location.href = '/login';
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      localStorage.removeItem('authToken');
      globalThis.location.href = '/login';
    }

  }, []);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        setLoading(true);
        localStorage.removeItem('authToken');
        navigate('/login');
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.error('Token vencido:', error);
          localStorage.removeItem('authToken');
          navigate('/login');
        } else {
          console.error('Error durante el logout:', error);
        }
      } finally {
        setLoading(false);
      }
    };



    if (logout) {
      handleLogout();
    }
  }, [logout, navigate]);



  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setLogout(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };




  const handleNavigation = async (path) => {

    navigate(`${path}`);

  };


  useEffect(() => {
    const handleResize = () => {
      if (globalThis.innerWidth >= 768) {
        setMenuVisible(true);
        setOverlayVisible(false);
      } else if (isMenuVisible) {
        setOverlayVisible(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuVisible]);


  const toggleMenu = () => {
    setMenuVisible((prevState) => {
      const newMenuState = !prevState;
      if (newMenuState && globalThis.innerWidth < 768) {
        setOverlayVisible(true);
      } else {
        setOverlayVisible(false);
      }
      return newMenuState;
    });
  };

  const isSelectedRoute = (path) => location.pathname === path;



  if (!isTokenChecked) {
    return null;
  }

  return (

    <div className="container-fluid "  >
      <div className="row custom-row">
        <div className={`col-2 ${isMenuVisible ? '' : 'd-none'}`} style={{ minWidth: '265px', padding: 0, }}>

          <Nav className=" menuU h-100">
            <div className="section-1">
              <Nav.Link className="profile-header" style={{ padding: 0 }} >
                <div className="title-profile">
                  <h5 className="profile-title">Villa Encantada</h5>
                  <p className="profile-subtitle">La Villa del Amor</p>
                </div>
              </Nav.Link>

              <Nav.Link
                className={`nav-item-custom ${isSelectedRoute('/admin/history-bookings') ? 'is-active' : ''}`}
                onClick={() => handleNavigation('/admin/history-bookings')}
              >
                <FontAwesomeIcon className="icon-margin" icon={faCalendarDays} />
                Reservas
              </Nav.Link>

              <Nav.Link className="nav-item-custom">
                <FontAwesomeIcon className="icon-margin" icon={faChartColumn} />
                Reportes
              </Nav.Link>
            </div>

            <div className="section-2">
              <div className="separator-line" />
              <Nav.Link className='profile-header-user' >
                <span className="user-avatar" aria-hidden="true">{userData.name.charAt(0).toUpperCase()}</span>
                <div className="title-profile">
                  <h5 className="profile-title-user">{userData.name} {userData.lastName}</h5>
                  <p className="profile-subtitle-user">{userData.email}</p>
                </div>
              </Nav.Link>
            </div>

            <div className="section-3">

              <Nav.Link className="nav-item-custom" onClick={() => navigate(-2)}>

                <FontAwesomeIcon className="icon-margin" icon={faCircleArrowLeft} />
                Volver al sitio
              </Nav.Link>

              <Nav.Link className="nav-item-custom" onClick={handleLogoutClick}>
                <FontAwesomeIcon className="icon-margin" icon={faRightFromBracket} />
                Cerrar Sesión
              </Nav.Link>
            </div>
          </Nav>


        </div>
        <div className="col custom-col">
          <div className="row ">

            <div className="col-12  top-bar d-md-none">
              <button className=" menu-button col-2" onClick={toggleMenu}>
                <FontAwesomeIcon className="icon-margin" icon={faBars} />
              </button>
            </div >

            <div className='col-12 container-content-scrollable'>
              <Outlet />
            </div>
          </div>

          <button
            type="button"
            className={`content-overlay ${isOverlayVisible ? 'visible' : ''}`}
            onClick={toggleMenu}
            aria-label="Cerrar menú lateral"
          />
        </div>
      </div>





   
      <ConfirmModal
        show={showLogoutModal}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Cierre de Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmText={loading ? 'Cargando...' : 'Sí'}
        cancelText="No"
      />


    </div>
  );
};

export default AdminDashboard;