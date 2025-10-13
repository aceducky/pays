const PUBLIC_ROUTES = ["/", "/auth"];

export const isPublicRoute = (path) => PUBLIC_ROUTES.includes(path);