function Login() {
  return (
    <div>
      <h1>Iniciar Sesión</h1>
      <form>
        <div>
          <label>Email:</label>
          <input type="email" placeholder="tu@email.com" />
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" placeholder="••••••" />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default Login;