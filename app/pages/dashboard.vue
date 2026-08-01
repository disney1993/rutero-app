<template>
	<v-container>
		<v-card class="pa-4" elevation="4">
			<v-card-title
				>Bienvenido, {{ auth.user?.value?.name }}</v-card-title
			>
			<v-card-subtitle>{{ auth.user?.value?.email }}</v-card-subtitle>
			<v-btn class="mt-4" color="error" @click="handleLogout">
				Cerrar sesión
			</v-btn>
		</v-card>

		<v-row class="mt-6">
			<v-col cols="12" class="d-flex justify-space-between align-center">
				<div></div>
				<v-btn color="primary" @click="openNew"> Nueva ruta </v-btn>
			</v-col>

			<v-col cols="12">
				<RoutesTable />
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup>
definePageMeta({ layout: "app", middleware: ["auth"] });

import { onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useRouter } from "vue-router";
import RoutesTable from "~/components/RoutesTable.vue";

const auth = useAuth();
const router = useRouter();

onMounted(async () => {
	await auth.fetchUser();
	if (!auth.user.value) {
		console.debug("[dashboard] sin user, redirigir a /login");
		router.push("/login");
	}
});

const openNew = () => {};
const handleLogout = async () => {
	await auth.logout();
	router.push("/login");
};
</script>
