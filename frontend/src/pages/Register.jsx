function Register() {
  return (
    <div>
      <h1>Registrarse</h1>
      <form>
        <div>
          <label>Nombre:</label>
          <input type="text" placeholder="Tu nombre" />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" placeholder="tu@email.com" />
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" placeholder="••••••" />
        </div>
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}

export default Register;