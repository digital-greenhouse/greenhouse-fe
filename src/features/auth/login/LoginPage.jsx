import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [mode, setMode] = useState('login');
  const location = useLocation();
  const navigate = useNavigate();
  const hasBackgroundApp = Boolean(location.state?.backgroundLocation);

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

  return (
    <main className="auth-page" onClick={handleClose}>
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
            onClick={() => setMode('login')}
          >
            Iniciar Sesion
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => setMode('register')}
          >
            Registrarse
          </button>
        </div>

        <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
          {mode === 'register' && (
            <label>
              Nombre completo
              <input type="text" placeholder="Tu nombre" />
            </label>
          )}

          <label>
            Correo electronico
            <input type="email" placeholder="tu@correo.com" />
          </label>

          <label>
            Contrasena
            <input
              type="password"
              placeholder={mode === 'register' ? 'Minimo 6 caracteres' : 'Tu contrasena'}
            />
          </label>

          {mode === 'register' && (
            <label>
              Confirmar contrasena
              <input type="password" placeholder="Repite tu contrasena" />
            </label>
          )}

          <button type="submit" className="auth-submit">
            {mode === 'register' ? 'Crear Cuenta' : 'Iniciar Sesion'}
          </button>
        </form>

        <button type="button" className="auth-back-link" onClick={handleClose}>
          {hasBackgroundApp ? 'Cerrar y volver' : 'Volver al inicio'}
        </button>
      </section>
    </main>
  );
}

export default LoginPage;
