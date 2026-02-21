function mostrarAlerta(mensaje, tipo = 'info', duracion = 3000) {
  const existing = document.querySelector('.aa-toast');
  if (existing) existing.remove();

  const colors = {
    success: '#059669', error: '#DC2626',
    warning: '#D97706', info: '#2563EB'
  };

  const toast = document.createElement('div');
  toast.className = 'aa-toast';
  toast.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:${colors[tipo] || colors.info};color:#fff;
    padding:14px 24px;border-radius:12px;font-size:0.95rem;font-weight:500;
    box-shadow:0 4px 20px rgba(0,0,0,0.25);z-index:99999;max-width:90%;
    text-align:center;animation:toastIn 0.3s ease;
  `;
  toast.textContent = mensaje;
  document.body.appendChild(toast);

  if (duracion > 0) {
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duracion);
  }
}

async function comprimirImagen(file, maxWidth, quality) {
  maxWidth = maxWidth || CONFIG.MAX_IMG_WIDTH;
  quality = quality || CONFIG.IMG_QUALITY;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Compression failed')), 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function obtenerUbicacion() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no disponible en este navegador'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

function formatearFecha(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function textoEstado(estado) {
  const map = {
    'pendiente': '⏳ Pendiente de evaluación',
    'en_revision': '🔍 En revisión',
    'evaluado': '✅ Evaluado'
  };
  return map[estado] || estado;
}

function claseEstado(estado) {
  const map = {
    'pendiente': 'badge-warning',
    'en_revision': 'badge-info',
    'evaluado': 'badge-success'
  };
  return map[estado] || '';
}

function textoValor(valor) {
  if (valor >= 9) return 'Excepcional';
  if (valor >= 7) return 'Alto valor';
  if (valor >= 5) return 'Valor moderado';
  if (valor >= 3) return 'Bajo valor';
  return 'Sin valor significativo';
}

function colorValor(valor) {
  if (valor >= 9) return '#7c3aed';
  if (valor >= 7) return '#059669';
  if (valor >= 5) return '#2563EB';
  if (valor >= 3) return '#D97706';
  return '#6B7280';
}

async function subirFoto(file, hallazgoId, orden) {
  const blob = await comprimirImagen(file);
  const ext = 'jpg';
  const path = `${hallazgoId}/${orden}.${ext}`;

  const uploadR = await fetch(`${CONFIG.STORAGE_URL}/object/${CONFIG.BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      ...CONFIG.AUTH_HEADERS,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true'
    },
    body: blob
  });

  if (!uploadR.ok) {
    const errText = await uploadR.text();
    throw new Error('Error subiendo foto: ' + errText);
  }

  const publicUrl = `${CONFIG.STORAGE_PUBLIC}/${CONFIG.BUCKET}/${path}`;

  const insertR = await fetch(`${CONFIG.API_BASE}/hallazgo_fotos`, {
    method: 'POST',
    headers: { ...CONFIG.HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify({
      hallazgo_id: hallazgoId,
      foto_url: publicUrl,
      orden: orden
    })
  });

  if (!insertR.ok) throw new Error('Error registrando foto en base de datos');

  return publicUrl;
}

function renderHeader(user) {
  const header = document.getElementById('appHeader');
  if (!header) return;

  const rolTexto = {
    'admin': 'Administrador',
    'arqueologo': 'Arqueólogo',
    'publico': 'Explorador'
  };

  header.innerHTML = `
    <div class="aa-header-inner">
      <a href="${user.tipo_usuario === 'admin' ? 'dashboard_admin.html' : user.tipo_usuario === 'arqueologo' ? 'dashboard_arqueologo.html' : 'dashboard_publico.html'}" class="aa-logo">
        🏛️ <span>AllArch</span>
      </a>
      <div class="aa-header-right">
        <span class="aa-user-badge">${rolTexto[user.tipo_usuario] || user.tipo_usuario}</span>
        <span class="aa-user-name">${user.nombre}</span>
        <button class="aa-btn-icon" onclick="logout()" title="Cerrar sesión">⎋</button>
      </div>
    </div>
  `;
}
