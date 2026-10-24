// Helper sesi UI. Autentikasi sesungguhnya dilakukan oleh Firebase Authentication.
const SG_AUTH_KEY = 'sgAuthToken';
const SG_USER_KEY = 'sgUser';
function sgIsLoggedIn() { return !!localStorage.getItem(SG_AUTH_KEY); }
async function sgLogout() {
  try { if (window.sgFirebase) await window.sgFirebase.logoutFirebase(); } catch (e) { console.warn(e); }
  localStorage.removeItem(SG_AUTH_KEY);
  localStorage.removeItem(SG_USER_KEY);
  window.location.href = 'login.html?logged_out=1';
}
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('logoutBtn');
  if (btn) btn.addEventListener('click', e => { e.preventDefault(); sgLogout(); });
});
