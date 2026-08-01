<template>
	<v-app>
		<v-navigation-drawer
			v-model="drawer"
			app
			:permanent="!isMobile"
			width="260"
		>
			<v-list nav>
				<v-list-item>
					<v-list-item-content>
						<v-list-item-title class="text-h6"
							>Rutero</v-list-item-title
						>
						<v-list-item-subtitle>{{
							todayFormatted
						}}</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>

				<v-divider />

				<v-list-item link to="/dashboard">
					<v-list-item-icon
						><v-icon>mdi-home</v-icon></v-list-item-icon
					>
					<v-list-item-title>Inicio</v-list-item-title>
				</v-list-item>

				<v-list-item link>
					<v-list-item-icon
						><v-icon>mdi-map-marker-path</v-icon></v-list-item-icon
					>
					<v-list-item-title>Mis rutas</v-list-item-title>
				</v-list-item>

				<v-spacer />

				<v-list-item @click="logout">
					<v-list-item-icon
						><v-icon>mdi-logout</v-icon></v-list-item-icon
					>
					<v-list-item-title>Cerrar sesión</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>

		<v-app-bar app color="primary" dark>
			<v-app-bar-nav-icon @click="drawer = !drawer" />
			<v-toolbar-title>Rutero — Panel</v-toolbar-title>
			<v-spacer />
			<div class="d-none d-sm-flex align-center">
				<v-icon class="mr-2">mdi-clock-outline</v-icon>
				{{ time }}
			</div>
		</v-app-bar>

		<v-main>
			<v-container fluid class="pa-4">
				<slot />
			</v-container>
		</v-main>
	</v-app>
</template>

<script setup>
import { useAuth } from "~/composables/useAuth";
import { useRouter } from "vue-router";
const auth = useAuth();
const router = useRouter();

const drawer = ref(false);
const isMobile = ref(false);
const time = ref(new Date().toLocaleTimeString());
const todayFormatted = new Date().toLocaleDateString();

const updateIsMobile = () => (isMobile.value = window.innerWidth < 960);
onMounted(() => {
	updateIsMobile();
	window.addEventListener("resize", updateIsMobile);
	setInterval(() => (time.value = new Date().toLocaleTimeString()), 1000);
});
onBeforeUnmount(() => window.removeEventListener("resize", updateIsMobile));

const logout = async () => {
	if (auth?.logout) await auth.logout();
	router.push("/login");
};
</script>