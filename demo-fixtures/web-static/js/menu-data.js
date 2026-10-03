// Shared menu-loading helper. Fetches data/menu.json; used by home.js and menu.js.
// Exposed as a global because this site intentionally has no build step.
window.Brewtown = window.Brewtown || {};

window.Brewtown.loadMenu = async function loadMenu() {
  const res = await fetch('data/menu.json');
  if (!res.ok) {
    throw new Error(`Failed to load menu: HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.items;
};

window.Brewtown.formatPrice = function formatPrice(price) {
  return `$${price.toFixed(2)}`;
};

window.Brewtown.renderCard = function renderCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.category = item.category;

  const title = document.createElement('h3');
  title.textContent = item.name;

  const desc = document.createElement('p');
  desc.textContent = item.description;

  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = window.Brewtown.formatPrice(item.price);

  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = item.category;

  card.append(title, desc, price, tag);
  return card;
};
