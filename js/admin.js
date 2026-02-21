document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth('admin');
  if (!user) return;
  renderHeader(user);
  await Promise.all([cargarStatsAdmin(), cargarArqueologos(), cargarTodosHallazgos()]);
});

function cambiarTabAdmin(tab) {
  document.querySelectorAll('.aa-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'arqueologos') || (i === 1 && tab === 'hallazgos'));
  });
  document.getElementById('tabArqueologos').style.display = tab === 'arqueologos' ? 'block' : 'none';
  document.getElementById('tabHallazgos').style.display = tab === 'hallazgos' ? 'block' : 'none';
}

async function cargarStatsAdmin() {
  try {
    const [rU, rH, rE] = await Promise.all([
      fetch(`${CONFIG.API_BASE}/usuarios?tipo_usuario=eq.arqueologo&select=id,aprobado`, { headers: CONFIG.HEADERS }),
      fetch(`${CONFIG.API_BASE}/hallazgos?select=id,estado`, { headers: CONFIG.HEADERS }),
      fetch(`${CONFIG.API_BASE}/evaluaciones?select=id`, { headers: CONFIG.HEADERS })
    ]);

    const arqueologos = await rU.json();
    const hallazgos = await rH.json();
    const evaluaciones = await rE.json();

    const pendientes = hallazgos.filter(h => h.estado === 'pendiente').length;
    const aprobados = arqueologos.filter(a => a.aprobado).length;

    document.getElementById('statsAdmin').innerHTML = `
      <div class="aa-stat"><div class="aa-stat-number">${hallazgos.length}</div><div class="aa-stat-label">Hallazgos totales</div></div>
      <div class="aa-stat"><div class="aa-stat-number">${pendientes}</div><div class="aa-stat-label">Pendientes</div></div>
      <div class="aa-stat"><div class="aa-stat-number">${evaluaciones.length}</div><div class="aa-stat-label">Evaluaciones</div></div>
      <div class="aa-stat"><div class="aa-stat-number">${aprobados}</div><div class="aa-stat-label">Arqueólogos</div></div>
    `;
  } catch (e) {
    console.error('Error stats:', e);
  }
}

async function cargarArqueologos() {
  try {
    const r = await fetch(
      `${CONFIG.API_BASE}/usuarios?tipo_usuario=eq.arqueologo&order=created_at.desc&select=*`,
      { headers: CONFIG.HEADERS }
    );
    const arqueologos = await r.json();

    const pendientes = arqueologos.filter(a => !a.aprobado);
    const aprobados = arqueologos.filter(a => a.aprobado);

    document.getElementById('contadorPendientes').textContent = pendientes.length;
    document.getElementById('contadorAprobados').textContent = aprobados.length;

    const listaPend = document.getElementById('listaPendientes');
    const listaAprob = document.getElementById('listaAprobados');

    if (pendientes.length === 0) {
      listaPend.innerHTML = '<p class="aa-text-muted" style="padding:12px;">No hay solicitudes pendientes.</p>';
    } else {
      listaPend.innerHTML = pendientes.map(a => renderArqueologoCard(a, false)).join('');
    }

    if (aprobados.length === 0) {
      listaAprob.innerHTML = '<p class="aa-text-muted" style="padding:12px;">No hay arqueólogos aprobados aún.</p>';
    } else {
      listaAprob.innerHTML = aprobados.map(a => renderArqueologoCard(a, true)).join('');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

function renderArqueologoCard(a, aprobado) {
  const inicial = (a.nombre || '?')[0].toUpperCase();

  return `
    <div class="aa-user-card" id="arq-${a.id}">
      <div class="aa-user-avatar">${inicial}</div>
      <div class="aa-user-card-info">
        <h4>${a.nombre} ${a.apellidos}</h4>
        <p>${a.institucion || 'Sin institución'} · ${a.especializacion || ''}</p>
        <p>${a.anios_experiencia || 0} años exp. · ${a.email}</p>
      </div>
      <div class="aa-user-card-actions">
        ${!aprobado ? `
          <button class="aa-btn aa-btn-success aa-btn-sm" onclick="aprobarArqueologo('${a.id}')">✓ Aprobar</button>
          <button class="aa-btn aa-btn-danger aa-btn-sm" onclick="rechazarArqueologo('${a.id}')">✕</button>
        ` : `
          <span class="badge badge-success">Verificado</span>
        `}
      </div>
    </div>
  `;
}

async function aprobarArqueologo(id) {
  try {
    const r = await fetch(`${CONFIG.API_BASE}/usuarios?id=eq.${id}`, {
      method: 'PATCH',
      headers: CONFIG.HEADERS,
      body: JSON.stringify({ aprobado: true })
    });
    if (!r.ok) throw new Error('Error');
    mostrarAlerta('Arqueólogo aprobado correctamente', 'success');
    await cargarArqueologos();
    await cargarStatsAdmin();
  } catch (e) {
    mostrarAlerta('Error al aprobar arqueólogo', 'error');
  }
}

async function rechazarArqueologo(id) {
  if (!confirm('¿Rechazar esta solicitud?')) return;
  try {
    const r = await fetch(`${CONFIG.API_BASE}/usuarios?id=eq.${id}`, {
      method: 'DELETE',
      headers: CONFIG.HEADERS
    });
    if (!r.ok) throw new Error('Error');
    mostrarAlerta('Solicitud rechazada', 'warning');
    await cargarArqueologos();
  } catch (e) {
    mostrarAlerta('Error al rechazar', 'error');
  }
}

async function cargarTodosHallazgos() {
  try {
    const r = await fetch(
      `${CONFIG.API_BASE}/hallazgos?order=created_at.desc&select=*,usuarios(nombre,apellidos),hallazgo_fotos(foto_url,orden),evaluaciones(valor_arqueologico)`,
      { headers: CONFIG.HEADERS }
    );
    const hallazgos = await r.json();

    document.getElementById('contadorHallazgos').textContent = hallazgos.length;
    const container = document.getElementById('listaHallazgos');

    if (!hallazgos || hallazgos.length === 0) {
      container.innerHTML = '<p class="aa-text-muted" style="padding:12px;">No hay hallazgos registrados.</p>';
      return;
    }

    container.innerHTML = hallazgos.map(h => {
      const foto = h.hallazgo_fotos && h.hallazgo_fotos.length > 0
        ? h.hallazgo_fotos.sort((a, b) => a.orden - b.orden)[0].foto_url
        : null;
      const reportante = h.usuarios ? `${h.usuarios.nombre} ${h.usuarios.apellidos}` : 'Usuario';
      const ev = h.evaluaciones && h.evaluaciones.length > 0 ? h.evaluaciones[0] : null;

      return `
        <a href="hallazgo.html?id=${h.id}" class="aa-finding-item">
          ${foto
            ? `<img src="${foto}" class="aa-finding-thumb" alt="Foto" loading="lazy">`
            : `<div class="aa-finding-thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;">📷</div>`
          }
          <div class="aa-finding-info">
            <h3>${h.descripcion.substring(0, 60)}${h.descripcion.length > 60 ? '...' : ''}</h3>
            <p>Por: ${reportante} · ${formatearFecha(h.created_at)}</p>
            <div class="aa-finding-meta">
              <span class="badge ${claseEstado(h.estado)}">${textoEstado(h.estado)}</span>
              ${ev ? `<span class="badge badge-neutral">⭐ ${ev.valor_arqueologico}/10</span>` : ''}
            </div>
          </div>
        </a>
      `;
    }).join('');

  } catch (error) {
    console.error('Error:', error);
  }
}
