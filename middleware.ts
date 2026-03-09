import NextAuth from "next-auth";
// Import de configuration minimale (pas de DB adapter ni bcrypt) pour l'Edge Middleware.
// La config complète est dans lib/auth.ts
import authConfig from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

// Ces routes ne nécessitent pas d'être connecté.
const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/api/cron/reminders", // Spécial : protégé en interne par un Header secret
    "/api/cron/exchange-rates"
];

const authRoutes = [
    "/auth/login",
    "/auth/register",
];

const apiAuthPrefix = "/api/auth";

// Le middleware est appelé à chaque requête HTTP
export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    // 1. Toujours autoriser les routes techniques NextAuth (callbacks, etc.)
    if (isApiAuthRoute) {
        return;
    }

    // 2. Si on est sur la page de login/register
    if (isAuthRoute) {
        if (isLoggedIn) {
            // Sécurité/UX : Si déjà connecté, rediriger vers le dashboard
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return;
    }

    // 3. Si ce n'est NI une route publique, NI connecté -> Bloquer et rediriger
    if (!isLoggedIn && !isPublicRoute) {
        // Garde en mémoire d'où on vient (callback URL) mais redirige au login
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
    }

    // Autoriser la navigation normale
    return;
});

// Le matcher précise sur quels chemins l'Edge Middleware doit s'exécuter.
export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
