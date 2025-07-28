const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export const isPublicRoute = (path) => PUBLIC_ROUTES.includes(path);