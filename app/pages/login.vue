<template>
	<v-container class="fill-height d-flex align-center justify-center">
		<v-card elevation="8" class="pa-6" max-width="420">
			<v-card-title class="text-center text-h5 font-weight-bold mb-4">
				Iniciar sesión
			</v-card-title>

			<v-form ref="form" @submit.prevent="handleLogin">
				<v-text-field
					v-model="email"
					label="Correo electrónico"
					prepend-icon="mdi-email"
					type="email"
					required
					:rules="emailRules"
				/>
				<v-text-field
					v-model="password"
					label="Contraseña"
					prepend-icon="mdi-lock"
					:type="showPassword ? 'text' : 'password'"
					:append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
					@click:append="showPassword = !showPassword"
					required
					:rules="passwordRules"
				/>

				<v-btn
					type="submit"
					color="primary"
					class="mt-4"
					block
					:loading="loading"
				>
					Entrar
				</v-btn>

				<v-divider class="my-4" />

				<v-btn
					color="red-darken-1"
					block
					prepend-icon="mdi-google"
					@click="auth.loginWithGoogle()"
				>
					Iniciar con Google
				</v-btn>
				<v-btn variant="text" class="mt-2" to="/register" block>
					Crear una cuenta
				</v-btn>
			</v-form>
		</v-card>

		<v-snackbar
			v-model="snackbar"
			:timeout="snackTimeout"
			:color="snackColor"
			location="bottom"
		>
			{{ snackMessage }}
		</v-snackbar>
	</v-container>
</template>

<script setup>
import { ref } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useRouter, useRoute, isNavigationFailure } from "vue-router";
definePageMeta({ layout: "auth" });

const auth = useAuth();
const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const loading = ref(false);
const showPassword = ref(false);
const form = ref(null);

const snackbar = ref(false);
const snackMessage = ref("");
const snackColor = ref("success");
const snackTimeout = 900;

const emailRules = [
	(v) => !!v || "El correo es obligatorio",
	(v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Correo inválido",
];
const passwordRules = [
	(v) => !!v || "La contraseña es obligatoria",
	(v) =>
		(v && v.length >= 6) ||
		"La contraseña debe tener al menos 6 caracteres",
];

const safeRedirectFromQuery = () => {
	const raw = route.query.redirect;
	const candidate = Array.isArray(raw) ? raw[0] : raw;
	let redirectTo = "/dashboard";
	if (candidate) {
		const str = String(candidate).trim();
		if (!/^https?:\/\//i.test(str)) {
			const candidatePath = str.startsWith("/") ? str : `/${str}`;
			try {
				const resolved = router.resolve(candidatePath);
				if (resolved && resolved.matched && resolved.matched.length > 0)
					redirectTo = candidatePath;
			} catch (e) {
				// fallback
			}
		}
	}
	return redirectTo;
};

const handleLogin = async () => {
	if (form.value && !form.value.validate()) return;
	loading.value = true;

	try {
		const resp = await auth.login(email.value, password.value);
		console.debug("[login.vue] /login resp:", resp);

		// if login returned token, force fetchUser with that token
		const tokenFromResp =
			resp?.access_token ||
			resp?.token ||
			resp?.data?.access_token ||
			resp?.data?.token;
		if (tokenFromResp) {
			console.debug(
				"[login.vue] token recibido, llamando fetchUser(token)"
			);
			await auth.fetchUser(tokenFromResp);
		} else {
			await auth.fetchUser();
		}

		console.debug(
			"[login.vue] auth.user final:",
			auth.user?.value,
			"token cookie:",
			useCookie("token").value
		);

		if (!auth.user.value) {
			console.warn(
				"[login.vue] No se obtuvo user tras login; navegando de todos modos a dashboard (dashboard intentará fetchUser)."
			);
			snackMessage.value =
				"Inicio correcto. Cargando datos de usuario...";
			snackColor.value = "warning";
			snackbar.value = true;
			// continuar para navegar aunque auth.user esté vacío
		}

		snackMessage.value = "Sesión iniciada correctamente";
		snackColor.value = "success";
		snackbar.value = true;

		const redirectTo = safeRedirectFromQuery();
		const result = await router.replace(redirectTo).catch((e) => e);
		if (isNavigationFailure(result))
			await router.push(redirectTo).catch(() => {});
	} catch (err) {
		console.error("[login.vue] login error:", err);
		snackMessage.value =
			err && err.data && err.data.message
				? err.data.message
				: "Credenciales inválidas";
		snackColor.value = "error";
		snackbar.value = true;
	} finally {
		loading.value = false;
	}
};
</script>
