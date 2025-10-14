const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup"];

export const checkIsPublicRoute = (path) => PUBLIC_ROUTES.includes(path);
