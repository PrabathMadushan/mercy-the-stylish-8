type RouteHandler = (params: Record<string, string>) => void | Promise<void>;

const routes: { pattern: RegExp; keys: string[]; handler: RouteHandler }[] = [];

export function route(path: string, handler: RouteHandler) {
  const keys: string[] = [];
  const pattern = new RegExp(
    "^" +
      path.replace(/:[^/]+/g, (match) => {
        keys.push(match.slice(1));
        return "([^/]+)";
      }) +
      "$"
  );
  routes.push({ pattern, keys, handler });
}

export function navigate(path: string) {
  window.location.hash = path;
}

async function resolve() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  for (const r of routes) {
    const match = hash.match(r.pattern);
    if (match) {
      const params: Record<string, string> = {};
      r.keys.forEach((key, i) => (params[key] = decodeURIComponent(match[i + 1])));
      await r.handler(params);
      return;
    }
  }
  navigate("/");
}

export function startRouter() {
  window.addEventListener("hashchange", resolve);
  resolve();
}
