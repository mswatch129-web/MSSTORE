/* ============================================
   MS STORE - Product Page Logic
   ============================================ */

function loadProduct() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'), 10);
  
  if (!productId || typeof PRODUCTS === 'undefined') {
    document.getElementById('productDetail').innerHTML = '<p style="text-align:center;padding:40px">Product not found. <a href="index.html">Back to home</a></p>';
    return;
  }

  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) {
    document.getElementById('productDetail').innerHTML = '<p style="text-align:center;padding:40px">Product not found. <a href="index.html">Back to home</a></p>';
    return;
  }

  document.getElementById('breadcrumbCurrent').textContent = product.name;
  document.title = `MS STORE — ${product.name}`;

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const images = product.images && product.images.length > 0 ? product.images : (product.bgImage ? [product.bgImage] : []);

  // Build a single ordered list of gallery media: all photos first, then the video (if any).
  GALLERY = images.map(src => ({ type: 'image', src }));
  if (product.video) GALLERY.push({ type: 'video', src: product.video });
  GALLERY_INDEX = 0;

  document.getElementById('productDetail').innerHTML = `
    <div class="product-gallery">
      <div class="product-main-image" id="productMainImage">
        ${GALLERY.length > 0 ? renderGalleryMedia(GALLERY[0]) : '<div style="color:var(--sage-700)">No image</div>'}
        ${GALLERY.length > 1 ? `
          <button type="button" class="gallery-nav gallery-nav-prev" onclick="galleryStep(-1)" aria-label="Previous">&#10094;</button>
          <button type="button" class="gallery-nav gallery-nav-next" onclick="galleryStep(1)" aria-label="Next">&#10095;</button>
        ` : ''}
      </div>
      ${GALLERY.length > 1 ? `
        <div class="product-thumbs">
          ${GALLERY.map((m, i) => `
            <div class="product-thumb ${i === 0 ? 'active' : ''}" onclick="goToGalleryItem(${i})">
              ${m.type === 'video'
                ? `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:var(--sage-700);color:white">▶</div>`
                : `<img src="${m.src}" alt="thumb">`}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    <div class="product-info-detail">
      <div class="product-detail-cat">${product.category}${product.brand ? ' • ' + product.brand : ''}</div>
      <h1 class="product-detail-name">${product.name}</h1>
      <div class="product-detail-rating">
        <span class="stars" style="font-size:18px">${'★'.repeat(Math.round(product.rating || 5))}${'☆'.repeat(5-Math.round(product.rating || 5))}</span>
        <span style="font-size:14px;color:var(--sage-600)">${product.rating || 5}.0 (${product.reviews || 0} reviews)</span>
      </div>
      <div class="product-detail-price">
        <span class="price-current">Rs. ${(product.price || 0).toLocaleString()}</span>
        ${product.oldPrice ? `<span class="price-old">Rs. ${product.oldPrice.toLocaleString()}</span>` : ''}
        ${discount > 0 ? `<span class="price-discount" style="margin-left:0">-${discount}% OFF</span>` : ''}
      </div>
      <div style="font-size:13px;color:var(--sage-600);margin-top:-6px;margin-bottom:4px">🚚 + Rs. 250 shipping • Total: <strong>Rs. ${(product.price + 250).toLocaleString()}</strong></div>
      <p class="product-detail-desc">${product.desc || ''}</p>
      ${product.features && product.features.length > 0 ? `
        <div class="product-features">
          <h4>Key Features</h4>
          ${product.features.map(f => `<div class="feature-item">${f}</div>`).join('')}
        </div>
      ` : ''}
      <div class="product-actions">
        <button class="btn btn-primary" onclick="addToCart(${product.id})">🛒 Add to Cart</button>
        <button class="btn btn-bronze" onclick="buyNow(${product.id})">⚡ Buy Now</button>
        <a href="https://wa.me/${(typeof _siteConfig !== 'undefined' && _siteConfig.whatsappNumber) || '923001234567'}?text=${encodeURIComponent('Hi MS STORE! Interested in ' + product.name + ' Rs.' + product.price)}" target="_blank" rel="noopener" class="btn btn-whatsapp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.20 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp Order
        </a>
      </div>
    </div>
  `;

  // Load suggestions
  loadSuggestions(product);
}

// GALLERY holds every photo + the video (if any) for the product currently on screen,
// in display order. GALLERY_INDEX is which one is showing in the main frame.
let GALLERY = [];
let GALLERY_INDEX = 0;

function renderGalleryMedia(item) {
  if (!item) return '';
  return item.type === 'video'
    ? `<video src="${item.src}" controls autoplay style="width:100%;height:100%;object-fit:cover" id="mainMediaEl"></video>`
    : `<img src="${item.src}" alt="product image" id="mainMediaEl">`;
}

function showGalleryItem(index) {
  if (!GALLERY.length) return;
  GALLERY_INDEX = ((index % GALLERY.length) + GALLERY.length) % GALLERY.length; // wrap around both directions
  const frame = document.getElementById('productMainImage');
  const oldEl = document.getElementById('mainMediaEl');
  if (oldEl && oldEl.tagName === 'VIDEO') oldEl.pause();
  if (oldEl) oldEl.remove();
  frame.insertAdjacentHTML('afterbegin', renderGalleryMedia(GALLERY[GALLERY_INDEX]));
  document.querySelectorAll('.product-thumb').forEach((t, i) => t.classList.toggle('active', i === GALLERY_INDEX));
}

function goToGalleryItem(index) { showGalleryItem(index); }
function galleryStep(delta) { showGalleryItem(GALLERY_INDEX + delta); }

// Swipe support for touch devices.
(function enableGallerySwipe() {
  let startX = null;
  document.addEventListener('touchstart', e => {
    if (!e.target.closest('#productMainImage')) return;
    startX = e.touches[0].clientX;
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (startX === null || !e.target.closest('#productMainImage')) return;
    const deltaX = e.changedTouches[0].clientX - startX;
    if (Math.abs(deltaX) > 40) galleryStep(deltaX < 0 ? 1 : -1);
    startX = null;
  }, { passive: true });
})();

function buyNow(id) {
  const product = (typeof PRODUCTS !== 'undefined') ? PRODUCTS.find(p => p.id === id) : null;
  if (!product) return;
  cart = [{...product, quantity: 1}];
  updateCartUI();
  setTimeout(openCheckout, 100);
}

function loadSuggestions(currentProduct) {
  const grid = document.getElementById('suggestionsGrid');
  if (!grid || typeof PRODUCTS === 'undefined') return;
  
  // Get 4 suggestions from same category or random
  let suggestions = PRODUCTS.filter(p => p.id !== currentProduct.id && p.category === currentProduct.category);
  if (suggestions.length < 4) {
    const others = PRODUCTS.filter(p => p.id !== currentProduct.id && p.category !== currentProduct.category);
    suggestions = [...suggestions, ...others];
  }
  suggestions = suggestions.slice(0, 4);
  
  grid.innerHTML = suggestions.map(p => {
    const img = (p.images && p.images[0]) || p.bgImage || '';
    return `
      <a href="product.html?id=${p.id}" style="text-decoration:none;color:inherit">
        <div class="product-card">
          ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
          <div class="product-image">
            <img src="${img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
          </div>
          <div class="product-body">
            <div class="product-cat">${p.category}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-price-row">
              <span class="price-current">Rs. ${(p.price || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </a>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', loadProduct);
