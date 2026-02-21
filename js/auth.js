function getUser() {
  try {
    const data = localStorage.getItem('allarch_user');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error obteniendo usuario:', e);
    return null;
  }
}

function setUser(userData) {
  try {
    localStorage.setItem('allarch_user', JSON.stringify(userData));
    return true;
  } catch (e) {
    console.error('Error guardando usuario:', e);
    return false;
  }
}

function requireAuth(tipoRequerido = null) {
  const user = getUser();

  if (!user || !user.id) {
    window.location.href = 'index.html';
    return null;
  }

  if (tipoRequerido && user.tipo_usuario !== tipoRequerido) {
    if (user.tipo_usuario === 'admin') return user;
    mostrarAlerta('No tienes permisos para acceder a esta sección', 'error');
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    return null;
  }

  return user;
}

function logout() {
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('allarch_')) localStorage.removeItem(k);
    });
  } catch (e) { /* ignore */ }
  window.location.replace('index.html');
}

function redirigirPorTipoUsuario() {
  const user = getUser();
  if (!user) { window.location.href = 'index.html'; return; }

  switch (user.tipo_usuario) {
    case 'admin':
      window.location.href = 'dashboard_admin.html';
      break;
    case 'arqueologo':
      window.location.href = 'dashboard_arqueologo.html';
      break;
    case 'publico':
      window.location.href = 'dashboard_publico.html';
      break;
    default:
      window.location.href = 'index.html';
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || email.length < 3) {
    mostrarAlerta('Ingresa tu correo electrónico', 'error');
    emailInput.focus();
    return;
  }
  if (password.length < 4) {
    mostrarAlerta('La contraseña debe tener al menos 4 caracteres', 'error');
    passwordInput.focus();
    return;
  }

  loginBtn.disabled = true;
  const textoOriginal = loginBtn.innerHTML;
  loginBtn.innerHTML = '<span class="spinner"></span> Ingresando...';

  try {
    const r = await fetch(
      `${CONFIG.API_BASE}/usuarios?email=eq.${encodeURIComponent(email)}&select=*`,
      { headers: CONFIG.HEADERS, mode: 'cors', credentials: 'omit' }
    );

    if (!r.ok) throw new Error('Error de conexión con el servidor');

    const usuarios = await r.json();
    if (!usuarios || usuarios.length === 0) {
      throw new Error('Usuario no encontrado. Verifica tu correo.');
    }

    const usuario = usuarios[0];

    if (usuario.password !== password) {
      throw new Error('Contraseña incorrecta.');
    }
    if (!usuario.activo) {
      throw new Error('Tu cuenta está inactiva. Contacta al administrador.');
    }

    const userData = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      tipo_usuario: usuario.tipo_usuario,
      aprobado: usuario.aprobado,
      loginTime: new Date().toISOString()
    };

    setUser(userData);
    mostrarAlerta('¡Bienvenido, ' + userData.nombre + '!', 'success', 1200);
    setTimeout(redirigirPorTipoUsuario, 1200);

  } catch (error) {
    console.error('Error en login:', error);
    let msg = error.message || 'Error al iniciar sesión.';
    if (msg.includes('Failed to fetch')) {
      msg = 'Sin conexión al servidor. Verifica tu internet.';
    }
    mostrarAlerta(msg, 'error');
    loginBtn.disabled = false;
    loginBtn.innerHTML = textoOriginal;
    passwordInput.value = '';
    passwordInput.focus();
  }
}
