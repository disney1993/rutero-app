<template>
	<v-app>
		<v-navigation-drawer app>
			<v-list>
				<v-list-item
					to="/dashboard"
					prepend-icon="mdi-home"
					title="Inicio"
				/>
				<v-list-item
					to="/viajes"
					prepend-icon="mdi-map"
					title="Mis viajes"
				/>
				<v-list-item
					to="/perfil"
					prepend-icon="mdi-account"
					title="Perfil"
				/>
			</v-list>
		</v-navigation-drawer>

		<v-app-bar app color="primary" dark>
			<v-toolbar-title>Rutero</v-toolbar-title>
			<v-spacer />
			<v-btn icon @click="logout">
				<v-icon>mdi-logout</v-icon>
			</v-btn>
		</v-app-bar>

		<v-main>
			<NuxtPage />
		</v-main>
	</v-app>
</template>

<script setup>
import { useAuth } from "~/composables/useAuth";
const { logout } = useAuth();
</script>
