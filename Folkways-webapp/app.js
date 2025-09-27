// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}

// Simple install prompt for Chromium; iOS gets a manual tip
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn?.addEventListener('click', async () => {
  installBtn.hidden = true;
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  }
});

// iOS “Add to Home Screen” hint
const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
if (isiOS && !isStandalone) {
  document.getElementById('iosTip').hidden = false; // Safari has no native prompt
}

// Search → Folkways site
document.getElementById('searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = document.getElementById('q').value.trim();
  if (!q) return;
  const u = new URL('https://folkways.si.edu/search');
  u.searchParams.set('query', q);
  window.open(u.toString(), '_blank', 'noopener');
});

// Favorites (localStorage)
const favKey = 'folkways:favorites';
const favList = document.getElementById('favList');

function loadFavs() {
  const arr = JSON.parse(localStorage.getItem(favKey) || '[]');
  favList.innerHTML = '';
  arr.forEach((f, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="fav">
        <img src="${f.art || 'icons/placeholder.png'}" alt="" />
        <div style="flex:1">
          <a href="${f.url}" target="_blank" rel="noopener">${f.title || f.url}</a>
          <div><small>${new URL(f.url).hostname}</small></div>
        </div>
        <button data-i="${i}" aria-label="Remove">✕</button>
      </div>`;
    favList.appendChild(li);
  });
  favList.querySelectorAll('button[data-i]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = +e.currentTarget.getAttribute('data-i');
      const arr = JSON.parse(localStorage.getItem(favKey) || '[]');
      arr.splice(i, 1);
      localStorage.setItem(favKey, JSON.stringify(arr));
      loadFavs();
    });
  });
}
loadFavs();

document.getElementById('addFavForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('favUrl').value.trim();
  const title = document.getElementById('favTitle').value.trim();
  if (!/^https?:\/\/(www\.)?folkways\.si\.edu\//i.test(url)) {
    alert('Please paste a URL from folkways.si.edu');
    return;
  }
  const arr = JSON.parse(localStorage.getItem(favKey) || '[]');
  // Best-effort grab of artwork via <meta property="og:image"> — same-origin restrictions prevent fetch here; user can edit later.
  arr.push({ url, title });
  localStorage.setItem(favKey, JSON.stringify(arr));
  document.getElementById('favUrl').value = '';
  document.getElementById('favTitle').value = '';
  loadFavs();
});

// “Open Folkways” convenience
document.getElementById('openCurrent').addEventListener('click', () => {
  window.open('https://folkways.si.edu/', '_blank', 'noopener');
});
