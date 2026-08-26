/* ============================================
   MS STORE - Main JavaScript
   ============================================ */

/* ------------------------------------------------------------
   WEB3FORMS ACCESS KEY
   Get a free key at https://web3forms.com and paste it below.
   This single key powers both the cart checkout form (index.html)
   and the product-page Buy Now form (product.html) — orders will
   be emailed to whichever address you registered with Web3Forms.
   ------------------------------------------------------------ */
const WEB3FORMS_ACCESS_KEY = 'd0e6faff-ad8b-4f56-8b53-771177fe5f71';

let cart = [];
let products = [];

/* ===== REAL-TIME CLOCK ===== */
function updateClock() {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ms = now.getMilliseconds();
  
  const hourAngle = (hours * 30) + (minutes * 0.5);
  const minuteAngle = (minutes * 6) + (seconds * 0.1);
  const secondAngle = (seconds * 6) + (ms * 0.006);
  
  const hh = document.getElementById('handHour');
  const mm = document.getElementById('handMinute');
  const ss = document.getElementById('handSecond');
  if (hh) hh.style.transform = `translate(-50%, -100%) rotate(${hourAngle}deg)`;
  if (mm) mm.style.transform = `translate(-50%, -100%) rotate(${minuteAngle}deg)`;
  if (ss) ss.style.transform = `translate(-50%, -100%) rotate(${secondAngle}deg)`;
  
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const dt = document.getElementById('digitalTime');
  if (dt) dt.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 50);
updateClock();

/* ===== LOAD PRODUCTS ===== */
function loadProducts() {
  if (typeof PRODUCTS !== 'undefined') {
    products = PRODUCTS;
    renderProducts();
  }
  renderCategories();
  applyFilterFromURL();
}

/* Lets nav links like "Featured" (index.html?filter=featured#products) jump
   straight to a pre-filtered view of the shop grid. */
function applyFilterFromURL() {
  const filter = new URLSearchParams(window.location.search).get('filter');
  if (!filter) return;
  const btn = document.querySelector(`.cat-btn[data-filter="${filter}"]`);
  filterProducts(filter, btn || null);
}

/* ===== SHOWCASE VIDEO (homepage "Our Collection" card, admin-managed) ===== */
function renderShowcase() {
  const section = document.getElementById('showcase');
  const wrap = document.getElementById('showcaseWrap');
  if (!section || !wrap) return;
  const videos = (typeof _siteSettings !== 'undefined' && _siteSettings.videos) ? _siteSettings.videos : [];
  const v = videos[0];
  if (!v || !v.sources || !v.sources.length) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');
  wrap.innerHTML = `
    <div class="showcase-media">
      <video class="showcase-video" autoplay muted loop playsinline ${v.poster ? `poster="${v.poster}"` : ''}>
        ${v.sources.map(s => `<source src="${s}">`).join('')}
      </video>
    </div>
    <div class="showcase-content">
      <div class="showcase-eyebrow">★ In Motion ★</div>
      <div class="showcase-title">${v.title || 'The Beautiful Collection'}</div>
      <p class="showcase-desc">${v.subtitle || 'Discover the artistry behind every MS STORE timepiece — a beautiful collection of watches crafted for those who wear time with pride.'}</p>
      <a href="#products" class="btn btn-primary">Shop the Collection</a>
    </div>
  `;
}

/* ===== CATEGORIES (admin-managed only — no hardcoded categories) ===== */
function renderCategories() {
  const bar = document.getElementById('categoryBar');
  if (!bar) return;
  const cats = (typeof CATEGORIES !== 'undefined' && CATEGORIES.length > 0) ? CATEGORIES : [];
  bar.innerHTML = `<button class="cat-btn active" onclick="filterProducts('all', this)">⌚ All</button>` +
    `<button class="cat-btn" data-filter="featured" onclick="filterProducts('featured', this)">★ Featured</button>` +
    cats.map(c => `<button class="cat-btn" onclick="filterProducts('${c.replace(/'/g, "\\'")}', this)">${c}</button>`).join('');
}

function isFeatured(p) {
  const tags = (p.tags || []).map(t => String(t).toLowerCase());
  return (p.badge || '').toLowerCase() === 'featured' || tags.includes('featured');
}

function renderProducts(filter = 'all') {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const filtered = filter === 'all' ? products
    : filter === 'featured' ? products.filter(isFeatured)
    : products.filter(p => p.category === filter);
  if (!filtered.length) {
    grid.innerHTML = `<p class="muted" style="grid-column:1/-1;text-align:center;padding:40px 0">No products found${filter === 'featured' ? ' — mark some as Featured in the admin panel' : ''}.</p>`;
    return;
  }
  grid.innerHTML = filtered.map(p => {
    const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
    const imgSrc = (p.images && p.images[0]) ? p.images[0] : (p.bgImage || '');
    return `
      <div class="product-card" data-category="${p.category}">
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        <a href="product.html?id=${p.id}" class="product-image" style="text-decoration:none">
          <img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'"/>
        </a>
        <div class="product-body">
          <div class="product-cat">${p.category}</div>
          <a href="product.html?id=${p.id}" style="text-decoration:none;color:inherit">
            <div class="product-name">${p.name}</div>
          </a>
          <div class="product-rating">
            <span class="stars">${'★'.repeat(Math.round(p.rating || 5))}</span>
            <span class="rating-text">(${p.reviews || 0})</span>
          </div>
          <div class="product-price-row">
            <span class="price-current">Rs. ${(p.price || 0).toLocaleString()}</span>
            ${p.oldPrice ? `<span class="price-old">Rs. ${p.oldPrice.toLocaleString()}</span>` : ''}
            ${discount > 0 ? `<span class="price-discount">-${discount}%</span>` : ''}
          </div>
          <button class="add-cart-btn" onclick="addToCart(${p.id})" id="cartBtn${p.id}">
            <span>🛒</span> Add to Cart
          </button>
        </div>
      </div>`;
  }).join('');
}

function filterProducts(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProducts(cat);
}

/* ===== CART ===== */
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.quantity++;
  else cart.push({...product, quantity: 1});
  updateCartUI();
  showToast(`${product.name} added!`);
  const btn = document.getElementById('cartBtn' + id);
  if (btn) {
    btn.classList.add('added');
    btn.innerHTML = '<span>✓</span> Added!';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = '<span>🛒</span> Add to Cart';
    }, 1500);
  }
}

function updateCartUI() {
  const count = cart.reduce((s,i) => s + i.quantity, 0);
  const cc = document.getElementById('cartCount');
  if (cc) cc.textContent = count;
  const items = document.getElementById('cartItems');
  if (!items) return;
  if (cart.length === 0) {
    items.innerHTML = `<div class="cart-empty"><div style="font-size:50px;margin-bottom:12px;opacity:0.4">⌚</div><p>Your cart is empty</p></div>`;
  } else {
    items.innerHTML = cart.map(i => {
      const img = (i.images && i.images[0]) || i.bgImage || '';
      return `
        <div class="cart-item">
          <div class="cart-item-img" style="background-image:url('${img}')"></div>
          <div class="cart-item-info">
            <div class="cart-item-name">${i.name}</div>
            <div class="cart-item-price">Rs. ${(i.price * i.quantity).toLocaleString()}</div>
            <div class="qty-control">
              <button class="qty-btn" onclick="updateQty(${i.id}, -1)">−</button>
              <span class="qty-val">${i.quantity}</span>
              <button class="qty-btn" onclick="updateQty(${i.id}, 1)">+</button>
            </div>
          </div>
          <button class="cart-remove" onclick="removeFromCart(${i.id})">🗑</button>
        </div>`;
    }).join('');
  }
  const subtotal = cart.reduce((s,i) => s + (i.price * i.quantity), 0);
  const SHIPPING_FEE = 250;
  const total = cart.length > 0 ? subtotal + SHIPPING_FEE : 0;
  const ct = document.getElementById('cartTotal');
  if (ct) ct.innerHTML = cart.length > 0
    ? `<span style="display:block;font-size:13px;color:var(--sage-600);font-weight:400">Subtotal: Rs. ${subtotal.toLocaleString()}</span><span style="display:block;font-size:13px;color:var(--sage-600);font-weight:400">Shipping: Rs. ${SHIPPING_FEE.toLocaleString()}</span>Rs. ${total.toLocaleString()}`
    : `Rs. 0`;
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
    updateCartUI();
  }
}
function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
  showToast('Item removed');
}
function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('active');
  document.getElementById('cartOverlay').classList.toggle('active');
}

/* ===== CHECKOUT ===== */
function openCheckout() {
  if (cart.length === 0) { showToast('Cart is empty!'); return; }
  document.getElementById('cartSidebar').classList.remove('active');
  document.getElementById('cartOverlay').classList.remove('active');
  const SHIPPING_FEE = 250;
  const subtotal = cart.reduce((s,i) => s + (i.price * i.quantity), 0);
  const total = subtotal + SHIPPING_FEE;
  document.getElementById('orderSummary').innerHTML = `
    <div class="order-title">Order Summary</div>
    ${cart.map(i => `<div class="order-row"><span>${i.name} × ${i.quantity}</span><span>Rs. ${(i.price*i.quantity).toLocaleString()}</span></div>`).join('')}
    <div class="order-row"><span>Shipping</span><span>Rs. ${SHIPPING_FEE.toLocaleString()}</span></div>
    <div class="order-row order-total"><span>Total</span><span>Rs. ${total.toLocaleString()}</span></div>`;
  document.getElementById('checkoutModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('active');
  document.body.style.overflow = 'auto';
}

function submitOrder(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const SHIPPING_FEE = 250;
  const subtotal = cart.reduce((s,i) => s + (i.price * i.quantity), 0);
  const total = subtotal + SHIPPING_FEE;
  const items = cart.map(i => `${i.name} × ${i.quantity}`).join(', ');
  const fd = new FormData();
  fd.append('access_key', WEB3FORMS_ACCESS_KEY);
  fd.append('subject', `🛍️ New Order — ${data.name}`);
  fd.append('from_name', 'MS STORE');
  fd.append('Customer', data.name);
  fd.append('WhatsApp', data.whatsapp);
  fd.append('City', data.city);
  fd.append('Postal', data.postal);
  fd.append('Address', data.address);
  fd.append('Notes', data.notes || 'None');
  fd.append('Items', items);
  fd.append('Subtotal', `Rs. ${subtotal.toLocaleString()}`);
  fd.append('Shipping', `Rs. ${SHIPPING_FEE.toLocaleString()}`);
  fd.append('Total', `Rs. ${total.toLocaleString()}`);
  fetch('https://api.web3forms.com/submit', {method:'POST', body:fd})
    .then(r => r.json())
    .then(() => showSuccess(data, total))
    .catch(() => showSuccess(data, total));
}

function showSuccess(data, total) {
  closeCheckout();
  cart = [];
  updateCartUI();
  document.body.insertAdjacentHTML('beforeend', `
    <div style="position:fixed;inset:0;background:rgba(26,31,24,0.9);backdrop-filter:blur(10px);z-index:6000;display:flex;align-items:center;justify-content:center;padding:20px">
      <div style="background:#F0F0F0;border-radius:20px;padding:30px 24px;max-width:380px;width:100%;text-align:center">
        <div style="width:70px;height:70px;background:linear-gradient(135deg,#C9A876,#8B6840,#553E22);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:30px;color:white">✓</div>
        <h2 style="font-family:'Cormorant Garamond',serif;font-size:24px;margin-bottom:10px;background:linear-gradient(135deg,#C9A876,#8B6840,#553E22);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;font-weight:600">Order Placed!</h2>
        <p style="color:#3A4236;margin-bottom:20px;line-height:1.6;font-size:14px">Thank you <strong>${data.name}</strong>!<br>Order: <strong style="color:#6B4F2D">Rs. ${total.toLocaleString()}</strong><br>We'll contact you on WhatsApp.</p>
        <button class="btn btn-primary" onclick="this.closest('div').parentElement.remove()" style="margin:0 auto;width:100%">Continue Shopping</button>
      </div>
    </div>`);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = msg;
  t.classList.add('active');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('active'), 2500);
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('active');
  document.getElementById('navOverlay').classList.toggle('active');
  document.getElementById('hamburger').classList.toggle('active');
}
function closeMenu() {
  document.getElementById('navLinks').classList.remove('active');
  document.getElementById('navOverlay').classList.remove('active');
  document.getElementById('hamburger').classList.remove('active');
}

window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  renderShowcase();
  updateCartUI();
  // Apply contact info from config
  if (typeof _siteConfig !== 'undefined') {
    const cfg = _siteConfig;
    const phone = cfg.phone || '+92 300 1234567';
    const wa = cfg.whatsappNumber || '923001234567';
    document.querySelectorAll('.js-whatsapp-link').forEach(a => {
      a.href = `https://wa.me/${wa}?text=${encodeURIComponent(cfg.whatsappMessage || 'Hello MS STORE')}`;
    });
    document.querySelectorAll('.js-contact-email').forEach(el => el.textContent = cfg.contactEmail || '');
    document.querySelectorAll('.js-contact-phone').forEach(el => el.textContent = phone);
    document.querySelectorAll('.js-contact-address').forEach(el => el.textContent = cfg.address || '');
    document.querySelectorAll('.js-contact-phone-hours').forEach(el => el.textContent = cfg.phoneHours || '');
  }
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth >= 1024) closeMenu();
  }, 250);
});

/* ===== SOCIAL LINKS (applied after config loads) ===== */
function applySocialLinks() {
  if (typeof _siteConfig === 'undefined') return;
  const cfg = _siteConfig;

  // Extract clean username from a URL, e.g. https://www.instagram.com/ms_store11111/ → ms_store11111
  function igUsername(url) {
    try { return new URL(url).pathname.replace(/\//g, '').split('?')[0]; } catch(e) { return null; }
  }
  function ttUsername(url) {
    try { return new URL(url).pathname.replace(/\//g, '').replace('@','').split('?')[0]; } catch(e) { return null; }
  }

  // On mobile, use deep links so the app opens directly
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const socialMap = {
    '.js-instagram-link': () => {
      if (!cfg.instagramUrl || !cfg.instagramUrl.trim()) return null;
      const user = igUsername(cfg.instagramUrl);
      if (isMobile && user) return `instagram://user?username=${user}`;
      return cfg.instagramUrl.trim();
    },
    '.js-tiktok-link': () => {
      if (!cfg.tiktokUrl || !cfg.tiktokUrl.trim()) return null;
      const user = ttUsername(cfg.tiktokUrl);
      if (isMobile && user) return `snssdk1233://user/profile?uniqueId=${user}`;
      return cfg.tiktokUrl.trim();
    },
    '.js-facebook-link': () => cfg.facebookUrl && cfg.facebookUrl.trim() ? cfg.facebookUrl.trim() : null,
    '.js-youtube-link':  () => cfg.youtubeUrl  && cfg.youtubeUrl.trim()  ? cfg.youtubeUrl.trim()  : null,
  };

  Object.entries(socialMap).forEach(([selector, getUrl]) => {
    document.querySelectorAll(selector).forEach(a => {
      const url = getUrl();
      if (url) {
        a.href = url;
        a.style.display = '';
        // Fallback: if deep link fails (app not installed), open web URL after 1.5s
        if (isMobile && (selector === '.js-instagram-link' || selector === '.js-tiktok-link')) {
          a.addEventListener('click', function(e) {
            const webUrl = selector === '.js-instagram-link' ? cfg.instagramUrl : cfg.tiktokUrl;
            setTimeout(() => { window.open(webUrl.trim(), '_blank'); }, 1500);
          });
        }
      } else {
        a.style.display = 'none';
      }
    });
  });

  // Email card button on contact page
  if (cfg.contactEmail) {
    document.querySelectorAll('.js-email-link').forEach(a => {
      a.href = `mailto:${cfg.contactEmail}`;
    });
  }
}
document.addEventListener('DOMContentLoaded', applySocialLinks);
document.addEventListener('config:ready', applySocialLinks);
