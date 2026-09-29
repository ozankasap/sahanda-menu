(() => {
  const params = new URLSearchParams(location.search);
  const languageKey = 'sahanda-menu-language';
  let data = window.DEFAULT_MENU;
  if (params.has('onizleme')) {
    try { data = JSON.parse(localStorage.getItem('sahanda-menu-preview')) || data; } catch { /* Keep published data. */ }
  }
  let language = 'tr';
  try { if (localStorage.getItem(languageKey) === 'en') language = 'en'; } catch { /* Storage may be unavailable. */ }
  const nav = document.querySelector('#category-nav');
  const toggle = document.querySelector('#language-toggle');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const translate = value => language === 'en' ? (window.MENU_EN?.[value] ?? value) : value;
  // Always format the original price identically in both languages.
  const money = price => new Intl.NumberFormat('tr-TR', {minimumFractionDigits: 0, maximumFractionDigits: 2}).format(Number(price || 0)) + ' ₺';
  let sections = [];
  let activeId;
  let frame;
  function setActive(id) {
    if (!id || id === activeId) return;
    activeId = id;
    for (const link of nav.querySelectorAll('a')) {
      if (link.dataset.category === id) {
        link.setAttribute('aria-current', 'location');
        const box = link.getBoundingClientRect();
        const viewport = nav.getBoundingClientRect();
        // Move only the horizontal nav; never scroll the document here.
        if (box.left < viewport.left || box.right > viewport.right) {
          nav.scrollTo({left: nav.scrollLeft + box.left - viewport.left - (nav.clientWidth - box.width) / 2, behavior: 'instant'});
        }
      } else link.removeAttribute('aria-current');
    }
  }
  function updateActive() {
    frame = null;
    if (!sections.length) return;
    const threshold = nav.getBoundingClientRect().height + 12;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) current = section;
      else break;
    }
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
    setActive(current.id);
  }
  function scheduleActive() {
    if (!frame) frame = requestAnimationFrame(updateActive);
  }
  function render() {
    const english = language === 'en';
    document.documentElement.lang = language;
    document.title = data.brand + ' ' + data.year + (english ? ' | Menu' : ' | Menü');
    document.querySelector('meta[name="description"]').content = data.brand + ' ' + data.year + (english ? ' digital menu' : ' dijital menü');
    document.querySelector('.menu-header h1').textContent = data.brand;
    document.querySelector('.header-line b').textContent = data.year;
    toggle.textContent = english ? 'Türkçe Menü' : 'English Menu';
    toggle.lang = english ? 'tr' : 'en';
    document.querySelector('#instagram-callout').textContent = english ? 'Follow us on Instagram' : 'Bizi Instagram’dan takip edin';
    nav.setAttribute('aria-label', english ? 'Menu categories' : 'Menü kategorileri');
    nav.innerHTML = data.categories.map(category => '<a data-category="' + esc(category.id) + '" href="#' + esc(category.id) + '">' + esc(category.icon) + ' ' + esc(translate(category.title)) + '</a>').join('');
    document.querySelector('#menu-content').innerHTML = data.categories.map(category =>
      '<section id="' + esc(category.id) + '" class="menu-category"><div class="category-heading"><h2>' + esc(category.icon) + ' ' + esc(translate(category.title)) + '</h2></div><div class="items">' +
      category.items.map(item => '<article class="menu-item"><div><h3>' + esc(translate(item.name)) + '</h3>' + (item.description ? '<p>' + esc(translate(item.description)) + '</p>' : '') + '</div><strong>' + money(item.price) + '</strong></article>').join('') + '</div></section>'
    ).join('');
    document.querySelector('#menu-footer').innerHTML = '<p>ⓘ &nbsp;' + esc(translate(data.taxNote)) + '</p><p>▣ &nbsp;' + (english ? 'Prices updated on <b>' + esc(data.updatedAt) + '</b>.' : 'Fiyatlarımız <b>' + esc(data.updatedAt) + '</b> tarihinde güncellenmiştir.') + '</p><em>❧ &nbsp; ' + (english ? 'Enjoy your meal' : 'Afiyet Olsun') + ' &nbsp; ❧</em>';
    sections = Array.from(document.querySelectorAll('.menu-category'));
    activeId = undefined;
    updateActive();
  }
  nav.addEventListener('click', event => {
    const link = event.target.closest('a[data-category]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const section = document.getElementById(link.dataset.category);
    if (!section) return;
    setActive(section.id);
    history.replaceState(null, '', link.getAttribute('href'));
    // Immediate navigation keeps the highlighted category and visible section in sync.
    window.scrollTo({top: Math.max(0, window.scrollY + section.getBoundingClientRect().top - nav.offsetHeight - 10), behavior: 'instant'});
    scheduleActive();
  });
  toggle.addEventListener('click', () => {
    language = language === 'tr' ? 'en' : 'tr';
    try { localStorage.setItem(languageKey, language); } catch { /* Switching still works without storage. */ }
    render();
  });
  window.addEventListener('scroll', scheduleActive, {passive: true});
  window.addEventListener('resize', scheduleActive);
  if (window.ResizeObserver) new ResizeObserver(() => {
    document.documentElement.style.setProperty('--nav-height', nav.offsetHeight + 'px');
    scheduleActive();
  }).observe(nav);
  render();
})();
