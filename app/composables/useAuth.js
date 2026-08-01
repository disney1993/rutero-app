import axios from "axios";

export const useAuth = () => {
    const config = useRuntimeConfig();
    const base = (config.public?.apiBase || "http://localhost:8000").replace(
        /\/$/,
        ""
    );
    const apiRoot = base.endsWith("/api") ? base : `${base}/api`;

    // axios con timeout y withCredentials
    const http = axios.create({
        baseURL: apiRoot,
        withCredentials: true,
        timeout: 8000, // evita colgar si backend no responde
    });

    const user = useState("user", () => null);
    const token = useCookie("token", { path: "/", sameSite: "lax" });

    const setAuthHeader = (t) => {
        if (t) http.defaults.headers.common["Authorization"] = `Bearer ${t}`;
        else delete http.defaults.headers.common["Authorization"];
    };

    // interceptores para log/debug
    http.interceptors.request.use(
        (req) => {
            console.debug("[http] request:", req.method, req.url);
            return req;
        },
        (err) => Promise.reject(err)
    );

    http.interceptors.response.use(
        (res) => {
            console.debug("[http] response:", res.status, res.config.url);
            return res;
        },
        (err) => {
            console.error("[http] response error:", err?.message || err);
            return Promise.reject(err);
        }
    );

    const login = async (email, password) => {
        try {
            const { data } = await http.post("/login", { email, password });
            const t = data?.access_token || data?.token || null;
            if (t) {
                token.value = t;
                setAuthHeader(t);
            }
            if (data?.user) user.value = data.user;
            else await fetchUser(t);
            return data;
        } catch (err) {
            console.error(
                "[useAuth] login error:",
                err?.response?.data || err.message || err
            );
            throw err;
        }
    };

    const fetchUser = async (explicitToken) => {
        const t = explicitToken || token.value;
        try {
            if (t) setAuthHeader(t);
            const { data } = await http.get("/user");
            user.value = data;
            return data;
        } catch (err) {
            console.error(
                "[useAuth] fetchUser error:",
                err?.response?.status,
                err?.response?.data || err.message || err
            );
            // limpiar sesión local si falla
            token.value = null;
            user.value = null;
            setAuthHeader(null);
            return null;
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await http.post("/register", {
                name,
                email,
                password,
            });
            const t = data?.access_token || data?.token || null;
            if (t) {
                token.value = t;
                setAuthHeader(t);
            }
            if (data?.user) user.value = data.user;
            else await fetchUser(t);
            return data;
        } catch (err) {
            console.error(
                "[useAuth] register error:",
                err?.response?.data || err.message || err
            );
            throw err;
        }
    };

    const logout = async () => {
        try {
            await http.post("/logout").catch(() => {});
        } catch (e) {}
        token.value = null;
        user.value = null;
        setAuthHeader(null);
    };

    const loginWithGoogle = () => {
        window.location.href = `${apiRoot}/auth/google/redirect`;
    };

    if (token.value) setAuthHeader(token.value);

    return { user, token, login, register, fetchUser, logout, loginWithGoogle };
};
