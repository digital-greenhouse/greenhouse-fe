import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { publicClient } from '../../../api/config/apiFactory';
import { AuthContext } from './AuthContext';
import { createUser } from '../../../api/users'
import FeedbackToast from '../../../components/ui/FeedbackToast';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import './LoginPage.css';

function LoginPage() {
  const { handleLogin } = useContext(AuthContext);
  const [mode, setMode] = useState('login');
  const location = useLocation();
  const navigate = useNavigate();
  const hasBackgroundApp = Boolean(location.state?.backgroundLocation);
  const backgroundLocation = location.state?.backgroundLocation;
  const requestedPath = location.state?.redirectTo;
  const nextPath = requestedPath || (backgroundLocation
    ? `${backgroundLocation.pathname || '/dashboard'}${backgroundLocation.search || ''}${backgroundLocation.hash || ''}`
    : '/dashboard');
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

  const handleClose = () => {
    if (hasBackgroundApp) {
      navigate(-1);
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasBackgroundApp, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setIsSubmitting(true);
    const response = await handleLogin(loginData.email, loginData.password);
    console.log('Login response:', response?.data?.user?.name);

    try {
      if (response?.ok) {
        const token = response?.data?.token;
        const name = response?.data?.user?.name;

        if (token) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('userName', name);
          window.dispatchEvent(new Event('auth-state-changed'));
          if (hasBackgroundApp) {
            navigate(nextPath, { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          setFeedback({ type: 'error', message: 'No se pudo obtener el token de acceso.' });
        }
        return;
      }

      const status = response?.error?.response?.status;
      if (status === 401) {
        setFeedback({ type: 'error', message: 'Credenciales incorrectas. Intenta nuevamente.' });
      } else if (status === 404) {
        setFeedback({ type: 'error', message: 'El endpoint de login no existe en el backend configurado.' });
      } else {
        setFeedback({ type: 'error', message: 'No fue posible iniciar sesion en este momento.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'No fue posible iniciar sesion en este momento.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (registerData.password !== registerData.confirmPassword) {
      setFeedback({ type: 'error', message: 'Las contrasenas no coinciden.' });
      return;
    }

    setShowRegisterConfirm(true);
  };

  const handleConfirmRegister = () => {
    setShowRegisterConfirm(false);
    setIsSubmitting(true);
    createUser({
      name: registerData.fullName,
      email: registerData.email,
      password: registerData.password,
      role: 'CLIENT',
      phone: registerData.phoneNumber
    }

    ).then((res) => {
      console.log('Register response:', res.data);
      setFeedback({ type: 'success', message: 'Cuenta creada correctamente. Ahora puedes iniciar sesion.' });
      setMode('login');
      setLoginData((prev) => ({ ...prev, email: registerData.email, password: '' }));
      setRegisterData({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
      })
    }).catch((error) => {
      console.error('Error during registration:', error);
      if (error.request.status === 400) {
        setFeedback({ type: 'error', message: JSON.parse(error.request.response || '{}').error || 'Error desconocido' });
      } else {
        setFeedback({ type: 'error', message: 'No fue posible completar el registro.' });
      }
    }).finally(() => {
      setIsSubmitting(false);
    });
  };


  return (
    <main
      className="auth-page"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* <div className="auth-brand">
        <span aria-hidden="true">^</span>
        <div>
          <p>Villa Encantada</p>
          <small>La Villa del Amor</small>
        </div>
      </div> */}

      <section
        className="auth-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        aria-label="Acceso de usuario"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="auth-close-btn"
          aria-label="Cerrar inicio de sesion"
          onClick={handleClose}
        >
          ×
        </button>

        <p className="auth-kicker">Acceso privado</p>
        <h1 id="auth-title">Bienvenido</h1>
        <p>Accede a tu cuenta o crea una nueva</p>

        <div className="auth-switch" role="tablist" aria-label="Tipo de acceso">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => {
              setMode('login');
              setFeedback({ type: '', message: '' });
            }}
          >
            Iniciar Sesion
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => {
              setMode('register');
              setFeedback({ type: '', message: '' });
            }}
          >
            Registrarse
          </button>
        </div>

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <label>
              Correo electronico
              <input
                type="email"
                placeholder="tu@correo.com"
                value={loginData.email}
                onChange={(event) =>
                  setLoginData((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Contrasena
              <input
                type="password"
                placeholder="Tu contrasena"
                value={loginData.password}
                onChange={(event) =>
                  setLoginData((prev) => ({
                    ...prev,
                    password: event.target.value.replace(/\s/g, ''),
                  }))
                }
                required
              />
            </label>

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Iniciar Sesion'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <label>
              Nombre completo
              <input
                type="text"
                placeholder="Tu nombre"
                value={registerData.fullName}
                onChange={(event) =>
                  setRegisterData((prev) => ({ ...prev, fullName: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Correo electronico
              <input
                type="email"
                placeholder="tu@correo.com"
                value={registerData.email}
                onChange={(event) =>
                  setRegisterData((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Celular
              <input
                type="number"
                className="no-spinner"
                placeholder="Tu numero de contacto"
                value={registerData.phoneNumber}
                onChange={(event) => {
                  let value = event.target.value;
                  value = value.replace(/[eE+\-]/g, "");
                  if (value.length <= 10) {
                    setRegisterData((prev) => ({
                      ...prev,
                      phoneNumber: value
                    }));
                  }
                }}
                onWheel={(event) => event.currentTarget.blur()}
                onKeyDown={(e) => {
                  const value = e.target.value;
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                  if (value.length >= 10 && e.key !== "Backspace") {
                    e.preventDefault();
                  }
                }}
                min="1000000000"
                max="9999999999"
                required
                onInvalid={(e) => {
                  e.target.setCustomValidity("Ingresa un número de celular válido de 10 dígitos.");
                }}
                onInput={(e) => {
                  e.target.setCustomValidity("");
                }}
              />
            </label>

            <label>
              Contrasena
              <input
                type="password"
                placeholder="Minimo 6 caracteres"
                value={registerData.password}
                onChange={(event) =>
                  setRegisterData((prev) => ({
                    ...prev,
                    password: event.target.value.replace(/\s/g, ''),
                  }))
                }
                minLength={6}
                required
              />
            </label>

            <label>
              Confirmar contrasena
              <input
                type="password"
                placeholder="Repite tu contrasena"
                value={registerData.confirmPassword}
                onChange={(event) =>
                  setRegisterData((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value.replace(/\s/g, ''),
                  }))
                }
                required
              />
            </label>

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
        )}

        <button type="button" className="auth-back-link" onClick={handleClose}>
          {hasBackgroundApp ? 'Cerrar y volver' : 'Volver al inicio'}
        </button>
      </section>

      <FeedbackToast
        show={Boolean(feedback.message)}
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      <ConfirmModal
        show={showRegisterConfirm}
        title="Confirmar registro"
        message="Estas seguro de crear esta cuenta?"
        confirmText="Si, crear cuenta"
        cancelText="Cancelar"
        onConfirm={handleConfirmRegister}
        onCancel={() => setShowRegisterConfirm(false)}
        variant="primary"
      />
    </main>
  );
}

export default LoginPage;
