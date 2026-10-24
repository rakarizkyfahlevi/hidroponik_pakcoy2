// user-info.js — pengganti data user yang sebelumnya di-render server-side via $__sgUser (PHP session).
// Karena versi ini murni statis (tanpa PHP/session), data user diambil dari localStorage.
// Isi localStorage.setItem('sgUser', JSON.stringify({name: '...', username: '...'})) setelah proses login via API.

document.addEventListener('DOMContentLoaded', () => {
  try {
    const raw = localStorage.getItem('sgUser');
    if (raw) {
      const user = JSON.parse(raw);
      const nameEl = document.getElementById('sidebarUserName');
      const handleEl = document.getElementById('sidebarUserHandle');
      if (nameEl && user.name) nameEl.textContent = user.name;
      if (handleEl && user.username) handleEl.textContent = '@' + user.username;
    }
  } catch (e) {
    console.warn('Gagal memuat data user dari localStorage:', e);
  }
});
