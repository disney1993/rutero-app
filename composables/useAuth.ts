import { ref } from "vue";

const user = ref<any | null>(null);
const tokenCookie = useCookie("token", {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
});

export function useAuth() {
    const config = useRuntimeConfig();
    const base = (config.public?.apiBase || "http://localhost:8000").replace(
        /\/$/,
        ""
    );
    const apiRoot = base.endsWith("/api") ? base : `${base}/api`;

    const fetchUser = async (token?: string) => {
        const t = token || tokenCookie.value;
        console.debug("[useAuth] fetchUser start tokenPresent:", !!t);
        try {
            const opts: any = { method: "GET", credentials: "include" };
            if (t) opts.headers = { Authorization: `Bearer ${t}` };

            console.debug("[useAuth] GET ->", `${apiRoot}/user`, opts);
            const resp = await $fetch(`${apiRoot}/user`, opts);
            user.value = resp;
            console.debug("[useAuth] /user ->", resp);
            return resp;
        } catch (err: any) {
            console.error("[useAuth] fetchUser error:", err?.data ?? err);
            tokenCookie.value = null;
            user.value = null;
            return null;
        }
    };

    const setSession = async (resp: any) => {
        if (!resp) return;
        const token =
            resp?.access_token ||
            resp?.token ||
            resp?.data?.access_token ||
            resp?.data?.token;
        const maybeUser = resp?.user || resp?.data?.user || resp?.data || null;

        if (token) {
            tokenCookie.value = token;
            console.debug(
                "[useAuth] token guardado (cliente):",
                token.slice?.(0, 8) ?? "[token]"
            );
        }
        if (
            maybeUser &&
            typeof maybeUser === "object" &&
            (maybeUser.id || maybeUser.email)
        ) {
            user.value = maybeUser;
            console.debug(
                "[useAuth] user poblado desde respuesta:",
                user.value
            );
            return user.value;
        }

        if (token) {
            // si solo hay token, intentar poblar user vía /user usando el token recién guardado
            return await fetchUser(token);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            console.debug("[useAuth] POST /login", { email });
            const resp = await $fetch(`${apiRoot}/login`, {
                method: "POST",
                body: { email, password },
                credentials: "include",
            });
            console.debug("[useAuth] /login resp raw:", resp);
            await setSession(resp);
            return resp;
        } catch (e) {
            console.error("[useAuth] login error:", e);
            throw e;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const resp = await $fetch(`${apiRoot}/register`, {
                method: "POST",
                body: { name, email, password },
                credentials: "include",
            });
            await setSession(resp);
            return resp;
        } catch (e) {
            console.error("[useAuth] register error:", e);
            throw e;
        }
    };

    const loginWithGoogle = (redirectToProvider = true) => {
        const url = `${apiRoot}/auth/google/redirect`;
        if (redirectToProvider && typeof window !== "undefined")
            window.location.href = url;
    };

    const logout = async () => {
        try {
            await $fetch(`${apiRoot}/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (e) {
            console.warn("[useAuth] logout error:", e);
        } finally {
            tokenCookie.value = null;
            user.value = null;
        }
    };

    return {
        user,
        login,
        register,
        loginWithGoogle,
        fetchUser,
        logout,
        setSession,
    };
}
