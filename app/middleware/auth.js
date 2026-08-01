export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie("token");
    console.debug(
        "[middleware auth] destino:",
        to.fullPath,
        "token presente:",
        !!token.value
    );

    // permitir acceso público a login/register
    if (!token.value && to.path !== "/login" && to.path !== "/register") {
        console.debug(
            "[middleware auth] redirigiendo a /login (redirect):",
            to.fullPath
        );
        return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
    }

    // si hay token permitimos (fetchUser debe validar token real)
    return;
});
