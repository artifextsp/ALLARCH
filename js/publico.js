document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth('publico');
  if (!user) return;
  renderHeader(user);
  await cargarMisHallazgos(user);
});

async function cargarMisHallazgos(user) {
  const container = document.getElementById('listaHallazgos');
  const contador = document.getElementById('contadorHallazgos');

  try {
    const r = await fetch(
      `${CONFIG.API_BASE}/hallazgos?usuario_id=eq.${user.id}&order=created_at.desc&select=*,hallazgo_fotos(foto_url,orden),evaluaciones(valor_arqueologico,veredicto)`,
      { headers: CONFIG.HEADERS }
    );

    if (!r.ok) throw new Error('Error cargando hallazgos');
    const hallazgos = await r.json();

    contador.textContent = hallazgos.length;

    if (!hallazgos || hallazgos.length === 0) {
      container.innerHTML = `
        <div class="aa-empty">
          <div class="aa-empty-icon">🔍</div>
          <h3>No tienes hallazgos aún</h3>
          <p>¿Encontraste algo interesante? Toca el botón ＋ para reportarlo.</p>
          <a href="nuevo_hallazgo.html" class="aa-btn aa-btn-primary">📷 Reportar mi primer hallazgo</a>
        </div>
      `;
      return;
    }

    container.innerHTML = '<div class="aa-finding-list">' + hallazgos.map(h => {
      const foto = h.hallazgo_fotos && h.hallazgo_fotos.length > 0
        ? h.hallazgo_fotos.sort((a, b) => a.orden - b.orden)[0].foto_url
        : null;

      const ev = h.evaluaciones && h.evaluaciones.length > 0 ? h.evaluaciones[0] : null;

      let evalBadge = '';
      if (ev) {
        evalBadge = `<span class="badge badge-success" style="font-size:0.7rem;">⭐ ${ev.valor_arqueologico}/10</span>`;
      }

      return `
        <a href="hallazgo.html?id=${h.id}" class="aa-finding-item">
          ${foto
            ? `<img src="${foto}" class="aa-finding-thumb" alt="Foto" loading="lazy">`
            : `<div class="aa-finding-thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;">📷</div>`
          }
          <div class="aa-finding-info">
            <h3>${h.descripcion.substring(0, 60)}${h.descripcion.length > 60 ? '...' : ''}</h3>
            <p>${formatearFecha(h.created_at)}</p>
            <div class="aa-finding-meta">
              <span class="badge ${claseEstado(h.estado)}">${textoEstado(h.estado)}</span>
              ${evalBadge}
            </div>
          </div>
        </a>
      `;
    }).join('') + '</div>';

  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = `
      <div class="aa-empty">
        <div class="aa-empty-icon">⚠️</div>
        <h3>Error al cargar</h3>
        <p>No se pudieron cargar tus hallazgos. Verifica tu conexión e intenta de nuevo.</p>
      </div>
    `;
  }
}
