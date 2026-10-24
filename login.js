// login.js — logika yang sebelumnya ditangani PHP (login.php) sekarang dipindah ke client-side.

// ══════════════════════════════════════════════════════
// PWA: daftarkan service worker sejak halaman LOGIN (titik
// masuk pertama aplikasi), bukan cuma di dashboard. Ini yang
// membuat browser mendeteksi aplikasi sebagai "installable"
// sejak awal, dan mengaktifkan sw.js lebih dini.
// ══════════════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('[SmartGarden] Service worker terdaftar dari halaman login.');
    } catch (err) {
      console.warn('[SmartGarden] Gagal mendaftarkan service worker:', err);
    }
  });
}

// ══════════════════════════════════════════════════════
// PWA: tombol Install / Download aplikasi (mulai dari login)
// ══════════════════════════════════════════════════════
let deferredInstallPrompt = null;
const installAppBtn = document.getElementById('install-app-btn');

function isRunningStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true; // iOS Safari
}

function hideInstallButton() {
  if (installAppBtn) installAppBtn.style.display = 'none';
}

function showInstallButton() {
  if (installAppBtn && !isRunningStandalone()) installAppBtn.style.display = 'flex';
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallButton();
});

if (installAppBtn) {
  installAppBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) {
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      alert(isIOS
        ? 'Ketuk tombol Bagikan (Share) di Safari, lalu pilih "Add to Home Screen".'
        : 'Buka menu (⋮) browser, lalu pilih "Install app" / "Tambahkan ke layar utama".');
      return;
    }
    installAppBtn.disabled = true;
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installAppBtn.disabled = false;
    if (choice.outcome === 'accepted') hideInstallButton();
  });
}

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  hideInstallButton();
});

if (isRunningStandalone()) hideInstallButton();

function togglePw(id, btn) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
  btn.textContent = el.type === 'password' ? 'Lihat' : 'Sembunyikan';
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const alertBox = document.getElementById('alertBox');
  const redirectField = document.getElementById('redirectField');

  // Set nilai redirect dari query string (?redirect=...), default ke /dashboard.php
  const redirect = params.get('redirect') || 'dashboard.html';
  redirectField.value = redirect;

  // Tampilkan pesan alert sesuai query string, meniru switch di login.php
  const errorCode = params.get('error');
  let message = '';
  let isSuccess = false;

  if (errorCode === '1') {
    message = '⚠️ Username atau password salah. Coba lagi.';
  } else if (errorCode === '2') {
    message = '⚠️ Username dan password wajib diisi.';
  } else if (params.has('registered')) {
    message = '✅ Akun berhasil dibuat. Silakan masuk.';
    isSuccess = true;
  } else if (params.has('logged_out')) {
    message = '✅ Anda berhasil keluar (logout).';
    isSuccess = true;
  }

  if (message) {
    alertBox.textContent = message;
    alertBox.classList.toggle('success', isSuccess);
    alertBox.style.display = 'block';
  }

  // ══════════════════════════════════════════════════════
  // Proses login — ditangani sepenuhnya di sisi client (auth.js),
  // tidak lagi mengirim request ke server PHP yang tidak ada.
  // ══════════════════════════════════════════════════════
  const loginForm = document.getElementById('loginForm');
  const usernameField = document.getElementById('username');
  const passwordField = document.getElementById('password');

  function showAlert(text, success) {
    alertBox.textContent = text;
    alertBox.classList.toggle('success', success);
    alertBox.style.display = 'block';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = usernameField.value.trim();
      const password = passwordField.value;
      if (!email || !password) { showAlert('Email dan password wajib diisi.', false); return; }
      const submitBtn = loginForm.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        const mod = await import('./firebase-core.js');
        const user = await mod.loginWithFirebase(email, password);
        localStorage.setItem('sgAuthToken', user.uid);
        localStorage.setItem('sgUser', JSON.stringify({ name: user.displayName || 'Admin Kebun', username: user.email || email }));
        window.location.href = redirectField.value || 'dashboard.html';
      } catch (err) {
        console.error('[Firebase login]', err);
        const code = err && err.code ? err.code : '';
        let msg = 'Login Firebase gagal. Periksa koneksi dan akun Firebase Authentication.';
        if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password') || code.includes('auth/user-not-found')) msg = 'Email atau password Firebase salah.';
        else if (code.includes('auth/unauthorized-domain')) msg = 'Domain GitHub Pages belum diizinkan di Firebase Authentication → Settings → Authorized domains.';
        else if (code.includes('auth/invalid-email')) msg = 'Format email tidak valid.';
        showAlert('⚠️ ' + msg, false);
      } finally { if (submitBtn) submitBtn.disabled = false; }
    });
  }
});
