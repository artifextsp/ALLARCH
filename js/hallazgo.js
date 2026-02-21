const fotosSeleccionadas = [null, null, null];

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth('publico');
  if (!user) return;
  renderHeader(user);

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('fechaHallazgo').value = today;
});

function agregarFoto(index) {
  const slots = document.querySelectorAll('.aa-photo-slot');
  const input = slots[index].querySelector('input[type="file"]');
  input.click();
}

function previewFoto(input, index) {
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  if (file.size > 20 * 1024 * 1024) {
    mostrarAlerta('La foto es demasiado grande (máx 20MB)', 'error');
    return;
  }

  fotosSeleccionadas[index] = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    const slot = document.querySelectorAll('.aa-photo-slot')[index];
    const existingImg = slot.querySelector('img');
    const existingBtn = slot.querySelector('.aa-remove-photo');

    if (existingImg) existingImg.remove();
    if (existingBtn) existingBtn.remove();

    const img = document.createElement('img');
    img.src = e.target.result;
    slot.appendChild(img);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'aa-remove-photo';
    removeBtn.innerHTML = '✕';
    removeBtn.onclick = (ev) => {
      ev.stopPropagation();
      quitarFoto(index);
    };
    slot.appendChild(removeBtn);

    slot.querySelector('span').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function quitarFoto(index) {
  fotosSeleccionadas[index] = null;
  const slot = document.querySelectorAll('.aa-photo-slot')[index];
  const img = slot.querySelector('img');
  const btn = slot.querySelector('.aa-remove-photo');
  if (img) img.remove();
  if (btn) btn.remove();
  slot.querySelector('span').style.display = '';
  slot.querySelector('input').value = '';
}

async function detectarUbicacion() {
  const btnGPS = document.getElementById('btnGPS');
  const status = document.getElementById('gpsStatus');

  btnGPS.disabled = true;
  status.textContent = 'Detectando...';

  try {
    const pos = await obtenerUbicacion();
    document.getElementById('latitud').value = pos.lat;
    document.getElementById('longitud').value = pos.lng;
    status.textContent = `✅ ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
    status.style.color = 'var(--success)';
  } catch (error) {
    status.textContent = '❌ No se pudo detectar. Escribe la dirección.';
    status.style.color = 'var(--danger)';
    console.error('GPS error:', error);
  }

  btnGPS.disabled = false;
}

async function enviarHallazgo(event) {
  event.preventDefault();

  const user = getUser();
  const descripcion = document.getElementById('descripcion').value.trim();
  const contexto = document.getElementById('contexto').value;
  const latitud = parseFloat(document.getElementById('latitud').value) || null;
  const longitud = parseFloat(document.getElementById('longitud').value) || null;
  const direccion = document.getElementById('direccion').value.trim();
  const fechaHallazgo = document.getElementById('fechaHallazgo').value || null;
  const btn = document.getElementById('enviarBtn');

  const fotosValidas = fotosSeleccionadas.filter(f => f !== null);
  if (fotosValidas.length === 0) {
    mostrarAlerta('Agrega al menos una fotografía', 'error');
    return;
  }

  if (!descripcion) {
    mostrarAlerta('Escribe una descripción del hallazgo', 'error');
    return;
  }

  if (!latitud && !direccion) {
    mostrarAlerta('Indica la ubicación (GPS o dirección manual)', 'error');
    return;
  }

  btn.disabled = true;
  const textoOriginal = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Enviando hallazgo...';

  try {
    const rH = await fetch(`${CONFIG.API_BASE}/hallazgos`, {
      method: 'POST',
      headers: { ...CONFIG.HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        usuario_id: user.id,
        descripcion,
        contexto,
        latitud,
        longitud,
        direccion_manual: direccion || null,
        fecha_hallazgo: fechaHallazgo,
        estado: 'pendiente'
      })
    });

    if (!rH.ok) {
      const errText = await rH.text();
      throw new Error('Error creando hallazgo: ' + errText);
    }

    const hallazgos = await rH.json();
    const hallazgo = hallazgos[0];

    let fotosSubidas = 0;
    for (let i = 0; i < fotosSeleccionadas.length; i++) {
      if (fotosSeleccionadas[i]) {
        btn.innerHTML = `<span class="spinner"></span> Subiendo foto ${fotosSubidas + 1}/${fotosValidas.length}...`;
        await subirFoto(fotosSeleccionadas[i], hallazgo.id, fotosSubidas + 1);
        fotosSubidas++;
      }
    }

    mostrarAlerta('¡Hallazgo enviado! Un arqueólogo lo evaluará pronto.', 'success', 3000);
    setTimeout(() => { window.location.href = 'dashboard_publico.html'; }, 2500);

  } catch (error) {
    console.error('Error:', error);
    mostrarAlerta('Error al enviar: ' + error.message, 'error');
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}
