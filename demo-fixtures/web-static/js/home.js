// Landing page: render featured items.
(async function () {
  const grid = document.getElementById('featured-grid');
  try {
    const items = await window.Brewtown.loadMenu();
    const featured = items.filter((item) => item.featured);
    grid.innerHTML = '';
    featured.forEach((item) => grid.appendChild(window.Brewtown.renderCard(item)));
  } catch (err) {
    grid.innerHTML = '';
    const msg = document.createElement('p');
    msg.className = 'error';
    msg.textContent = 'Could not load the menu. Is the site being served over HTTP?';
    grid.appendChild(msg);
    console.error(err);
  }
})();
