<template>
	<v-container class="fill-height d-flex align-center justify-center">
		<v-card elevation="8" class="pa-6" max-width="420">
			<v-card-title class="text-center text-h5 font-weight-bold mb-4">
				Crear cuenta
			</v-card-title>

			<v-form ref="form" @submit.prevent="handleRegister">
				<v-text-field
					v-model="name"
					label="Nombre"
					prepend-icon="mdi-account"
					required
					:rules="nameRules"
				/>
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
					:label="'Contraseña'"
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
					block
					class="mt-4"
					:loading="loading"
				>
					Registrarme
				</v-btn>

				<v-btn variant="text" class="mt-2" to="/login" block>
					Ya tengo una cuenta
				</v-btn>
			</v-form>
		</v-card>
	</v-container>
</template>

<script setup>
import Swal from "sweetalert2";
import { useAuth } from "~/composables/useAuth";
import { useRouter } from "vue-router";
definePageMeta({ layout: "auth" });

const auth = useAuth();
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const showPassword = ref(false); // agregado
const form = ref(null);

// reglas de validación
const nameRules = [(v) => !!v || "El nombre es obligatorio"];
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

const handleRegister = async () => {
	// validar formulario antes de enviar
	if (form.value && !form.value.validate()) return;

	loading.value = true;
	try {
		await auth.register(name.value, email.value, password.value);
		await Swal.fire({
			icon: "success",
			title: "Cuenta creada",
			text: "Registro exitoso. Puedes iniciar sesión.",
		});
		router.push("/login");
	} catch (err) {
		await Swal.fire({
			icon: "error",
			title: "Error",
			text: "Error al registrarse",
		});
	} finally {
		loading.value = false;
	}
};
</script>
