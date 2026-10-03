// Tiny hash router. Routes are patterns like '/task/:id'.
export class Router {
  constructor() {
    this.routes = [];
    this.notFound = () => {};
    window.addEventListener('hashchange', () => this.resolve());
  }

  on(pattern, handler) {
    const paramNames = [];
    const regexSrc = pattern
      .split('/')
      .map((part) => {
        if (part.startsWith(':')) {
          paramNames.push(part.slice(1));
          return '([^/]+)';
        }
        return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('/');
    this.routes.push({ regex: new RegExp(`^${regexSrc}$`), paramNames, handler });
    return this;
  }

  otherwise(handler) {
    this.notFound = handler;
    return this;
  }

  resolve() {
    const path = window.location.hash.slice(1) || '/board';
    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });
        route.handler(params);
        this.highlightNav(path);
        return;
      }
    }
    this.notFound(path);
    this.highlightNav(path);
  }

  highlightNav(path) {
    document.querySelectorAll('#main-nav a').forEach((a) => {
      const target = a.getAttribute('href').slice(1);
      a.classList.toggle('active', path === target || path.startsWith(`${target}/`));
    });
  }
}
