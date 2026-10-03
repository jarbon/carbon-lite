// Method + path-pattern router. Patterns like '/books/:id'.
export class Router {
  constructor() {
    this.routes = [];
  }

  add(method, pattern, handler) {
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
    this.routes.push({
      method: method.toUpperCase(),
      regex: new RegExp(`^${regexSrc}/?$`),
      paramNames,
      handler,
    });
    return this;
  }

  get(pattern, handler) { return this.add('GET', pattern, handler); }
  post(pattern, handler) { return this.add('POST', pattern, handler); }
  put(pattern, handler) { return this.add('PUT', pattern, handler); }
  delete(pattern, handler) { return this.add('DELETE', pattern, handler); }

  // Returns { handler, params } or null. Also reports whether the path
  // matched any route with a different method (for 405 responses).
  match(method, path) {
    let pathMatched = false;
    for (const route of this.routes) {
      const m = path.match(route.regex);
      if (!m) continue;
      pathMatched = true;
      if (route.method !== method.toUpperCase()) continue;
      const params = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(m[i + 1]);
      });
      return { handler: route.handler, params };
    }
    return pathMatched ? { methodNotAllowed: true } : null;
  }
}
