import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [mode, setMode] = useState('login');

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <span aria-hidden="true">^</span>
        <div>
          <p>Villa Encantada</p>
          <small>La Villa del Amor</small>
        </div>
      </div>

      <section className="auth-card" aria-label="Acceso de usuario">
        <h1>Bienvenido</h1>
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
      </section>

      <Link to="/dashboard" className="auth-back-link">
        Volver al inicio
      </Link>
    </main>
  );
}

export default LoginPage;