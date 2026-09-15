(() => {
  if (!new URLSearchParams(location.search).has('yonetim') && !location.pathname.endsWith('/admin.html')) return;
  const key = 'sahanda-menu-preview';
  let menu = JSON.parse(localStorage.getItem(key) || JSON.stringify(window.DEFAULT_MENU));
  const $ = selector => document.querySelector(selector);
  const categories = $('#categories');
  const makeId = title => `${title.toLocaleLowerCase('tr-TR').replace(/[^a-z0-9ğüşıöç]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-5)}`;
  const save = () => { localStorage.setItem(key, JSON.stringify(menu)); };
  const bindGeneral = () => ['brand','year','updatedAt','taxNote'].forEach(field => { $(`#${field}`).value = menu[field] || ''; $(`#${field}`).oninput = event => { menu[field] = event.target.value; save(); }; });
  const draw = focusCategoryId => {
    categories.innerHTML = '';
    menu.categories.forEach((category, ci) => {
      const card = document.createElement('section'); card.className = 'category-card';
      card.innerHTML = `<div class="category-top"><label class="icon">Simge<input class="category-icon" value="${category.icon || ''}"></label><label>Kategori adı<input class="category-title" value="${category.title}"></label></div><div class="category-actions"><button class="move-up" ${ci === 0 ? 'disabled' : ''}>↑ Yukarı taşı</button><button class="move-down" ${ci === menu.categories.length - 1 ? 'disabled' : ''}>↓ Aşağı taşı</button><button class="add-item">+ Ürün ekle</button><button class="remove-category">Kategoriyi sil</button></div><div class="item-list"></div>`;
      const list = card.querySelector('.item-list');
      category.items.forEach((item, ii) => addItemRow(list, item, ci, ii));
      card.querySelector('.category-icon').oninput = event => { category.icon = event.target.value; save(); };
      card.querySelector('.category-title').oninput = event => { category.title = event.target.value; save(); };
      card.querySelector('.move-up').onclick = () => { if (ci > 0) { [menu.categories[ci - 1], menu.categories[ci]] = [menu.categories[ci], menu.categories[ci - 1]]; save(); draw(); } };
      card.querySelector('.move-down').onclick = () => { if (ci < menu.categories.length - 1) { [menu.categories[ci], menu.categories[ci + 1]] = [menu.categories[ci + 1], menu.categories[ci]]; save(); draw(); } };
      card.querySelector('.add-item').onclick = () => { category.items.push({name:'Yeni ürün',description:'',price:0}); save(); draw(category.id); };
      card.querySelector('.remove-category').onclick = () => { if (confirm(`“${category.title}” kategorisi silinsin mi?`)) { menu.categories.splice(ci, 1); save(); draw(); } };
      categories.append(card);
      if (focusCategoryId === category.id) requestAnimationFrame(() => card.scrollIntoView({behavior: 'smooth', block: 'start'}));
    });
  };
  const addItemRow = (list, item, ci, ii) => {
    const row = $('#item-template').content.firstElementChild.cloneNode(true);
    row.querySelector('.item-name').value = item.name || '';
    row.querySelector('.item-price').value = item.price ?? 0;
    row.querySelector('.item-description').value = item.description || '';
    row.querySelector('.item-name').oninput = event => { item.name = event.target.value; save(); };
    row.querySelector('.item-price').oninput = event => { item.price = Number(event.target.value); save(); };
    row.querySelector('.item-description').oninput = event => { item.description = event.target.value; save(); };
    row.querySelector('.remove-item').onclick = () => { if (confirm(`“${item.name}” ürünü silinsin mi?`)) { menu.categories[ci].items.splice(ii, 1); save(); draw(); } };
    list.append(row);
  };
  $('#add-category').onclick = () => { const title = 'Yeni kategori'; const id = makeId(title); menu.categories.unshift({id,title,icon:'☕',items:[]}); save(); draw(id); };
  $('#download').onclick = () => { const file = new Blob([`window.DEFAULT_MENU = ${JSON.stringify(menu, null, 2)};\n`], {type:'text/javascript'}); const link = document.createElement('a'); link.href = URL.createObjectURL(file); link.download = 'menu-data.js'; link.click(); URL.revokeObjectURL(link.href); };
  $('#preview').onclick = () => window.open('index.html?onizleme', '_blank');
  $('#reset').onclick = () => { if (confirm('Bu bilgisayardaki tüm yerel düzenlemeler silinsin mi?')) { menu = JSON.parse(JSON.stringify(window.DEFAULT_MENU)); save(); bindGeneral(); draw(); } };
  bindGeneral(); draw();
})();

