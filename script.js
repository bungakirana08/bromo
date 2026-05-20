/* ═══════════════════════════════════════════
   Bromo Élevé — script.js
═══════════════════════════════════════════ */

const S = {
  user: null,
  bookings: [],
  reviews: [],
  selectedRating: 0,
  preselectRoom: '',
  _nameCallback: null,
  booking: {
    fname: '', lname: '', email: '', phone: '',
    cin: '', cout: '', req: '',
    room: '', roomKey: '', bedConfig: '',
    price: '', nights: 0, total: '', payment: ''
  }
};

/* ═══ NAME MODAL ═══ */
function openNameModal(title, callback) {
  S._nameCallback = callback;
  document.getElementById('nameModalTitle').textContent = title ? 'Selamat Datang, ' + title : 'Selamat Datang';
  document.getElementById('nameModalInput').value = '';
  document.getElementById('nameModalError').style.display = 'none';
  document.getElementById('nameModal').classList.add('open');
  setTimeout(() => document.getElementById('nameModalInput').focus(), 100);
}

function confirmNameModal() {
  const val = document.getElementById('nameModalInput').value.trim();
  if (!val) {
    document.getElementById('nameModalError').style.display = 'block';
    document.getElementById('nameModalInput').focus();
    return;
  }
  document.getElementById('nameModalError').style.display = 'none';
  document.getElementById('nameModal').classList.remove('open');
  if (S._nameCallback) S._nameCallback(val);
  S._nameCallback = null;
}

function cancelNameModal() {
  document.getElementById('nameModal').classList.remove('open');
  S._nameCallback = null;
}

/* ═══ LOGIN ═══ */
function loginAs(method) {
  openNameModal(method, (name) => {
    S.user = { name, method };
    doLogin();
  });
}

function togglePhone() {
  document.getElementById('phoneArea').classList.toggle('open');
}

function loginPhone() {
  const v = document.getElementById('phoneNum').value.trim();
  if (!v) { toast('Nomor Kosong', 'Masukkan nomor telepon Anda terlebih dahulu.'); return; }
  openNameModal('', (name) => {
    S.user = { name, method: 'Nomor Telepon', phone: v };
    doLogin();
  });
}

function doLogin() {
  const loginPage = document.getElementById('page-login');
  loginPage.classList.remove('active');
  loginPage.style.display = 'none';

  document.getElementById('navbar').style.display = 'flex';

  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = '';
  });

  document.getElementById('page-main').classList.add('active');
  setNavTransparent(true);

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active-link'));
  document.getElementById('nl-home').classList.add('active-link');
  window.scrollTo({ top: 0 });

  updateNavUser();
  loadReviews();
  toast('Selamat Datang', 'Halo ' + S.user.name.split(' ')[0] + '! Selamat datang di Bromo Élevé.');
}

function logout() {
  S.user = null;
  S.bookings = [];
  S.reviews = [];
  closeProfileMenu();

  document.getElementById('navbar').style.display = 'none';
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = '';
  });

  const loginPage = document.getElementById('page-login');
  loginPage.style.display = '';
  loginPage.classList.add('active');
  window.scrollTo({ top: 0 });
}

function updateNavUser() {
  if (!S.user) return;
  const init = S.user.name.charAt(0).toUpperCase();
  document.getElementById('profileBtn').textContent = init;
  document.getElementById('ddName').textContent = S.user.name;
  document.getElementById('ddMethod').textContent = 'Login via ' + S.user.method;
  document.getElementById('pName').textContent = S.user.name;
  document.getElementById('pMethod').textContent = 'Login via ' + S.user.method;
  document.getElementById('pAvatar').textContent = init;
  document.getElementById('pf-name').textContent = S.user.name;
  document.getElementById('pf-method').textContent = S.user.method;
  updateStats();
}

function updateStats() {
  const nights = S.bookings.reduce((a, b) => a + (b.nights || 0), 0);
  document.getElementById('pBookings').textContent = S.bookings.length;
  document.getElementById('pNights').textContent = nights;
  document.getElementById('pf-status').textContent =
    S.bookings.length >= 3 ? 'Gold Member' :
    S.bookings.length >= 1 ? 'Silver Member' : 'Bronze Member';
}

/* ═══ NAVIGATION ═══ */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = '';
  });
  const target = document.getElementById('page-' + name);
  if (target) target.classList.add('active');
}

function navGo(target) {
  closeProfileMenu();
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active-link'));

  if (target === 'home') {
    showPage('main');
    setNavTransparent(true);
    document.getElementById('nl-home').classList.add('active-link');
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } else if (target === 'rooms') {
    showPage('main');
    setNavTransparent(false);
    document.getElementById('nl-rooms').classList.add('active-link');
    setTimeout(() => document.getElementById('sec-rooms').scrollIntoView({ behavior: 'smooth' }), 50);

  } else if (target === 'gallery') {
    showPage('main');
    setNavTransparent(false);
    document.getElementById('nl-gallery').classList.add('active-link');
    setTimeout(() => document.getElementById('sec-gallery').scrollIntoView({ behavior: 'smooth' }), 50);

  } else if (target === 'ratings') {
    showPage('main');
    setNavTransparent(false);
    document.getElementById('nl-ratings').classList.add('active-link');
    setTimeout(() => document.getElementById('sec-ratings').scrollIntoView({ behavior: 'smooth' }), 50);

  } else if (target === 'history') {
    showPage('history');
    setNavTransparent(false);
    document.getElementById('nl-history').classList.add('active-link');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderHistory();

  } else if (target === 'profile') {
    showPage('profile');
    setNavTransparent(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateStats();

  } else if (target === 'facilities') {
    showPage('facilities');
    setNavTransparent(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function setNavTransparent(on) {
  const nb = document.getElementById('navbar');
  on ? nb.classList.add('transparent') : nb.classList.remove('transparent');
}

window.addEventListener('scroll', () => {
  const activePage = document.querySelector('.page.active');
  if (activePage && activePage.id === 'page-main') {
    const hero = document.getElementById('sec-home');
    if (hero) setNavTransparent(hero.getBoundingClientRect().bottom > 70);
  }
}, { passive: true });

function toggleProfileMenu() {
  document.getElementById('profileDropdown').classList.toggle('open');
}

function closeProfileMenu() {
  document.getElementById('profileDropdown').classList.remove('open');
}

document.addEventListener('click', e => {
  const btn = document.getElementById('profileBtn');
  const dd = document.getElementById('profileDropdown');
  if (btn && !btn.contains(e.target) && dd && !dd.contains(e.target)) closeProfileMenu();
});

/* ═══ BOOKING MODAL ═══ */
function syncCheckout() {
  const cin = document.getElementById('b-cin').value;
  if (cin) {
    const cinDate = new Date(cin);
    cinDate.setDate(cinDate.getDate() + 1);
    const nextDay = cinDate.toISOString().split('T')[0];
    document.getElementById('b-cout').value = nextDay;
    document.getElementById('b-cout').min = nextDay;
  }
}

function openBookingModal(preselect) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  const fmt = d => d.toISOString().split('T')[0];

  // ═══ RESET semua field form Step 1 ═══
  document.getElementById('b-fname').value = '';
  document.getElementById('b-lname').value = '';
  document.getElementById('b-email').value = '';
  document.getElementById('b-phone').value = '';
  document.getElementById('b-req').value = '';

  document.getElementById('b-cin').value = fmt(tomorrow);
  document.getElementById('b-cin').min = fmt(today);
  document.getElementById('b-cout').value = fmt(dayAfter);
  document.getElementById('b-cout').min = fmt(dayAfter);

  S.preselectRoom = preselect || '';

  // ═══ RESET state booking ═══
  S.booking = {
    fname: '', lname: '', email: '', phone: '',
    cin: '', cout: '', req: '',
    room: '', roomKey: '', bedConfig: '',
    price: '', nights: 0, total: '', payment: ''
  };

  document.querySelectorAll('.room-opt-modal').forEach(o => o.classList.remove('sel'));
  document.querySelectorAll('.bed-opt').forEach(b => b.classList.remove('sel'));
  document.querySelectorAll('.pay-opt').forEach(p => p.classList.remove('sel'));

  goStep(1);
  document.getElementById('bookingModal').classList.add('open');
}

function getRoomData(k) {
  const m = {
    classic:   ['Kamar Bromo View', '680.000'],
    deluxe:    ['Kamar Semeru',     '1.100.000'],
    suite:     ['Suite Tengger',    '2.200.000'],
    penthouse: ['Villa Bromo Peak', '4.500.000']
  };
  return m[k] || ['', ''];
}

function filterRoomOptions(preselectKey) {
  ['classic', 'deluxe', 'suite', 'penthouse'].forEach(key => {
    const el = document.getElementById('ro-' + key);
    if (!el) return;
    el.style.display = (!preselectKey || key === preselectKey) ? '' : 'none';
  });

  if (preselectKey) {
    const el = document.getElementById('ro-' + preselectKey);
    if (el) {
      const data = getRoomData(preselectKey);
      pickRoom(preselectKey, data[0], data[1], el);
    }
  }
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('open');
}

function goStep(n) {
  for (let i = 1; i <= 4; i++) {
    const p = document.getElementById('p' + i);
    const s = document.getElementById('s' + i);
    p.classList.toggle('active', i === n);
    s.classList.remove('active', 'done');
    if (i === n) s.classList.add('active');
    else if (i < n) s.classList.add('done');
  }

  if (n === 2) {
    const fn = document.getElementById('b-fname').value.trim();
    const ln = document.getElementById('b-lname').value.trim();
    const em = document.getElementById('b-email').value.trim();
    const ph = document.getElementById('b-phone').value.trim();
    const ci = document.getElementById('b-cin').value;
    const co = document.getElementById('b-cout').value;

    if (!fn || !ln || !em || !ph || !ci || !co) {
      toast('Data Belum Lengkap', 'Mohon isi semua field yang diperlukan.');
      goStep(1); return;
    }
    if (new Date(co) <= new Date(ci)) {
      toast('Tanggal Tidak Valid', 'Check-out harus setelah check-in.');
      goStep(1); return;
    }

    S.booking.fname = fn;
    S.booking.lname = ln;
    S.booking.email = em;
    S.booking.phone = ph;
    S.booking.cin = ci;
    S.booking.cout = co;
    S.booking.req = document.getElementById('b-req').value;
    S.booking.nights = Math.round((new Date(co) - new Date(ci)) / (1000 * 60 * 60 * 24));

    filterRoomOptions(S.preselectRoom);
  }

  if (n === 3 && !S.booking.room) {
    toast('Pilih Kamar', 'Silakan pilih tipe kamar terlebih dahulu.');
    goStep(2); return;
  }

  if (n === 4) {
    if (!S.booking.payment) {
      toast('Pilih Pembayaran', 'Silakan pilih metode pembayaran.');
      goStep(3); return;
    }
    buildSummary();
  }
}

function pickRoom(key, name, price, el) {
  document.querySelectorAll('.room-opt-modal').forEach(o => o.classList.remove('sel'));
  if (el) el.classList.add('sel');
  S.booking.room = name;
  S.booking.roomKey = key;
  S.booking.price = price;
  if (key === 'suite') S.booking.bedConfig = '2 King Bed + 1 Single Bed';
  else S.booking.bedConfig = '';
}

function pickBed(roomKey, config, el) {
  const roomEl = document.getElementById('ro-' + roomKey);
  if (roomEl) roomEl.querySelectorAll('.bed-opt').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  S.booking.bedConfig = config;

  const roomDiv = document.getElementById('ro-' + roomKey);
  if (roomDiv && !roomDiv.classList.contains('sel')) {
    const data = getRoomData(roomKey);
    pickRoom(roomKey, data[0], data[1], roomDiv);
  }
}

function pickPay(el, method) {
  document.querySelectorAll('.pay-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  S.booking.payment = method;
}

function buildSummary() {
  const b = S.booking;
  const pn = parseInt(b.price.replace(/\./g, ''));
  const total = pn * b.nights;
  b.total = total.toLocaleString('id-ID');

  const bedLine = b.bedConfig
    ? `<div class="sum-row"><span class="lbl">Konfigurasi</span><span>${b.bedConfig}</span></div>`
    : '';

  document.getElementById('summaryBox').innerHTML = `
    <div class="sum-row"><span class="lbl">Nama Tamu</span><span>${b.fname} ${b.lname}</span></div>
    <div class="sum-row"><span class="lbl">Email</span><span>${b.email}</span></div>
    <div class="sum-row"><span class="lbl">Kamar</span><span>${b.room}</span></div>
    ${bedLine}
    <div class="sum-row"><span class="lbl">Check-in</span><span>${fmtDate(b.cin)}</span></div>
    <div class="sum-row"><span class="lbl">Check-out</span><span>${fmtDate(b.cout)}</span></div>
    <div class="sum-row"><span class="lbl">Durasi</span><span>${b.nights} malam</span></div>
    <div class="sum-row"><span class="lbl">Harga/malam</span><span>Rp ${b.price}</span></div>
    <div class="sum-row"><span class="lbl">Metode Bayar</span><span>${b.payment}</span></div>
    <div class="sum-total">
      <span class="lbl">Total Pembayaran</span>
      <span class="val">Rp ${total.toLocaleString('id-ID')}</span>
    </div>
  `;
}

function confirmBook() {
  const b = { ...S.booking };
  const code = 'BRE-' + Date.now().toString(36).toUpperCase().slice(-6);
  b.code = code;
  b.date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  S.bookings.push(b);
  closeModal();
  document.getElementById('successCode').textContent = code;
  document.getElementById('modal-success').classList.add('open');
  updateStats();
}

function closeSuccess() {
  document.getElementById('modal-success').classList.remove('open');
}

/* ═══ HISTORY ═══ */
function renderHistory() {
  const el = document.getElementById('historyList');

  if (!S.bookings.length) {
    el.innerHTML = `
      <div class="empty-state">
        <h3>Belum Ada Pemesanan</h3>
        <p>Anda belum memiliki riwayat pemesanan. Segera reservasi kamar impian Anda.</p>
        <div style="margin-top:32px;">
          <button class="btn-dark" onclick="navGo('rooms')">Lihat Kamar →</button>
        </div>
      </div>`;
    return;
  }

  el.innerHTML = S.bookings.slice().reverse().map(b => `
    <div class="history-entry">
      <div>
        <div class="h-badge">✓ Terkonfirmasi</div>
        <div class="h-room">${b.room}${b.bedConfig ? ' — ' + b.bedConfig : ''}</div>
        <div class="h-info">
          Nama: <strong>${b.fname} ${b.lname}</strong><br>
          Email: <strong>${b.email}</strong> &nbsp;·&nbsp; Tel: <strong>${b.phone}</strong><br>
          Check-in: <strong>${fmtDate(b.cin)}</strong> → Check-out: <strong>${fmtDate(b.cout)}</strong><br>
          Durasi: <strong>${b.nights} malam</strong> &nbsp;·&nbsp; Pembayaran: <strong>${b.payment}</strong>
          ${b.req ? `<br>Permintaan: <strong>${b.req}</strong>` : ''}
        </div>
        <div class="h-code">Kode Booking: ${b.code} &nbsp;·&nbsp; ${b.date}</div>
      </div>
      <div>
        <div class="h-price">Rp ${b.total}<small>Total Tagihan</small></div>
      </div>
    </div>
  `).join('');
}

/* ═══ REVIEWS ═══ */
function setStars(n) {
  S.selectedRating = n;
  document.querySelectorAll('.star-btn').forEach((b, i) => b.classList.toggle('lit', i < n));
}

function addReview() {
  const name = document.getElementById('rv-name').value.trim();
  const text = document.getElementById('rv-text').value.trim();
  if (!name || !text || !S.selectedRating) {
    toast('Lengkapi Ulasan', 'Isi nama, rating bintang, dan teks ulasan Anda.');
    return;
  }
  S.reviews.push({ name, text, rating: S.selectedRating });
  document.getElementById('rv-name').value = '';
  document.getElementById('rv-text').value = '';
  setStars(0);
  loadReviews();
  toast('Ulasan Terkirim', 'Terima kasih telah berbagi pengalaman Anda!');
}

function loadReviews() {
  if (!S.reviews.length) return;
  const grid = document.getElementById('reviewsGrid');
  const newItems = S.reviews.slice().reverse().slice(0, 6).map(r => `
    <div class="review-item">
      <div class="review-quote">Tamu Terdaftar</div>
      <div class="review-text-body">${r.text}</div>
      <div class="review-author">${r.name}</div>
      <div class="review-stars-sm">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
    </div>
  `).join('');
  const originals = Array.from(grid.querySelectorAll('.review-item'));
  grid.innerHTML = newItems;
  originals.forEach(o => grid.appendChild(o));
  document.getElementById('ratingTotal').textContent = `Berdasarkan ${312 + S.reviews.length} ulasan`;
}

/* ═══ UTILS ═══ */
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function toast(title, msg) {
  document.getElementById('t-title').textContent = title;
  document.getElementById('t-msg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3800);
}