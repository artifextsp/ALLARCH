let deferredPrompt = null;

function esPWAInstalada() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

function esIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('btnInstalarPWA');
  if (btn) btn.style.display = 'flex';
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  const btn = document.getElementById('btnInstalarPWA');
  if (btn) btn.style.display = 'none';
  mostrarAlerta('¡AllArch instalada correctamente!', 'success');
});

async function instalarPWA() {
  if (esIOS()) {
    mostrarGuiaIOS();
    return;
  }
  if (!deferredPrompt) {
    if (esPWAInstalada()) {
      mostrarAlerta('AllArch ya está instalada en tu dispositivo', 'info');
    } else {
      mostrarAlerta('Abre el menú de tu navegador y selecciona "Instalar aplicación"', 'info', 5000);
    }
    return;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
}

function mostrarGuiaIOS() {
  const modal = document.createElement('div');
  modal.id = 'modalGuiaIOS';
  modal.innerHTML = `
    <div class="aa-modal-overlay" onclick="this.parentElement.remove()">
      <div class="aa-modal-card" onclick="event.stopPropagation()">
        <h3>📲 Instalar AllArch en iOS</h3>
        <div class="aa-ios-steps">
          <div class="aa-ios-step"><span class="aa-step-num">1</span><p>Toca el botón <strong>Compartir</strong> (↑)</p></div>
          <div class="aa-ios-step"><span class="aa-step-num">2</span><p>Selecciona <strong>"Agregar a inicio"</strong></p></div>
          <div class="aa-ios-step"><span class="aa-step-num">3</span><p>Toca <strong>"Agregar"</strong></p></div>
        </div>
        <button class="aa-btn aa-btn-primary" onclick="this.closest('#modalGuiaIOS').remove()" style="width:100%;margin-top:16px">Entendido</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function crearBotonInstalar() {
  if (esPWAInstalada() || document.getElementById('btnInstalarPWA')) return;

  const btn = document.createElement('button');
  btn.id = 'btnInstalarPWA';
  btn.className = 'aa-fab-install';
  btn.innerHTML = '📲 Instalar App';
  btn.style.display = 'none';
  btn.addEventListener('click', instalarPWA);
  document.body.appendChild(btn);

  if (esIOS()) btn.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', crearBotonInstalar);
