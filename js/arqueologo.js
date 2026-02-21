let tabActual = 'pendientes';

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth('arqueologo');
  if (!user) return;
  renderHeader(user);

  if (!user.aprobado) {
    document.getElementById('bannerPendiente').style.display = 'block';
    document.getElementById('contenidoPrincipal').style.display = 'none';
    return;
  }

  await Promise.all([cargarStats(user), cargarPendientes(), cargarMisEvaluaciones(user)]);
});

function cambiarTab(tab) {
  tabActual = tab;
  document.querySelectorAll('.aa-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'pendientes') || (i === 1 && tab === 'evaluados'));
  });
  document.getElementById('tabPendientes').style.display = tab === 'pendientes' ? 'block' : 'none';
  document.getElementById('tabEvaluados').style.display = tab === 'evaluados' ? 'block' : 'none';
}

async function cargarStats(user) {
  try {
    const [rPendientes, rEvaluados] = await Promise.all([
      fetch(`${CONFIG.API_BASE}/hallazgos?estado=eq.pendiente&select=id`, { headers: CONFIG.HEADERS }),
      fetch(`${CONFIG.API_BASE}/evaluaciones?arqueologo_id=eq.${user.id}&select=id`, { headers: CONFIG.HEADERS })
    ]);

    const pendientes = await rPendientes.json();
    const evaluados = await rEvaluados.json();

    document.getElementById('statsArqueologo').innerHTML = `
      <div class="aa-stat">
        <div class="aa-stat-number">${pendientes.length}</div>
        <div class="aa-stat-label">Pendientes</div>
      </div>
      <div class="aa-stat">
        <div class="aa-stat-number">${evaluados.length}</div>
        <div class="aa-stat-label">Mis evaluaciones</div>
      </div>
    `;
  } catch (e) {
    console.error('Error stats:', e);
  }
}

async function cargarPendientes() {
  const container = document.getElementById('listaPendientes');

  try {
    const r = await fetch(
      `${CONFIG.API_BASE}/hallazgos?estado=eq.pendiente&order=created_at.asc&select=*,usuarios(nombre,apellidos),hallazgo_fotos(foto_url,orden)`,
      { headers: CONFIG.HEADERS }
    );
    const hallazgos = await r.json();

    if (!hallazgos || hallazgos.length === 0) {
      container.innerHTML = `
        <div class="aa-empty">
          <div class="aa-empty-icon">✅</div>
          <h3>Todo al día</h3>
          <p>No hay hallazgos pendientes de evaluación.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '<div class="aa-finding-list">' + hallazgos.map(h => {
      const foto = h.hallazgo_fotos && h.hallazgo_fotos.length > 0
        ? h.hallazgo_fotos.sort((a, b) => a.orden - b.orden)[0].foto_url
        : null;
      const reportante = h.usuarios ? `${h.usuarios.nombre} ${h.usuarios.apellidos}` : 'Usuario';

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
              <span class="badge badge-warning">⏳ Pendiente</span>
            </div>
          </div>
        </a>
      `;
    }).join('') + '</div>';

  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<div class="aa-empty"><div class="aa-empty-icon">⚠️</div><h3>Error al cargar</h3></div>';
  }
}

async function cargarMisEvaluaciones(user) {
  const container = document.getElementById('listaEvaluados');

  try {
    const r = await fetch(
      `${CONFIG.API_BASE}/evaluaciones?arqueologo_id=eq.${user.id}&order=created_at.desc&select=*,hallazgos(id,descripcion,estado,hallazgo_fotos(foto_url,orden))`,
      { headers: CONFIG.HEADERS }
    );
    const evaluaciones = await r.json();

    if (!evaluaciones || evaluaciones.length === 0) {
      container.innerHTML = `
        <div class="aa-empty">
          <div class="aa-empty-icon">📋</div>
          <h3>Sin evaluaciones aún</h3>
          <p>Tus evaluaciones aparecerán aquí.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '<div class="aa-finding-list">' + evaluaciones.map(ev => {
      const h = ev.hallazgos;
      if (!h) return '';
      const foto = h.hallazgo_fotos && h.hallazgo_fotos.length > 0
        ? h.hallazgo_fotos.sort((a, b) => a.orden - b.orden)[0].foto_url
        : null;

      return `
        <a href="hallazgo.html?id=${h.id}" class="aa-finding-item">
          ${foto
            ? `<img src="${foto}" class="aa-finding-thumb" alt="Foto" loading="lazy">`
            : `<div class="aa-finding-thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;">📷</div>`
          }
          <div class="aa-finding-info">
            <h3>${h.descripcion.substring(0, 60)}${h.descripcion.length > 60 ? '...' : ''}</h3>
            <p>Valor: ${ev.valor_arqueologico}/10 · ${formatearFecha(ev.created_at)}</p>
            <div class="aa-finding-meta">
              <span class="badge badge-success" style="color:${colorValor(ev.valor_arqueologico)}">${textoValor(ev.valor_arqueologico)}</span>
            </div>
          </div>
        </a>
      `;
    }).join('') + '</div>';

  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<div class="aa-empty"><div class="aa-empty-icon">⚠️</div><h3>Error al cargar</h3></div>';
  }
}
