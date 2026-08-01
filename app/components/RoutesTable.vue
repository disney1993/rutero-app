<template>
	<v-card>
		<v-card-title>
			Rutas registradas
			<v-spacer />
			<v-select
				v-model="defaultRate"
				:items="rateOptions"
				label="Precio €/km"
				dense
				style="max-width: 140px"
			/>
		</v-card-title>

		<v-data-table
			:items="routes"
			:headers="headers"
			item-key="id"
			class="elevation-1"
		>
			<template #item.fechaHora="{ item }">
				<div>
					<div>{{ formatDate(item.fechaHora) }}</div>
					<small class="text--secondary">{{
						formatTime(item.fechaHora)
					}}</small>
				</div>
			</template>

			<template #item.distancia="{ item }">
				<div>
					<span v-if="item.distanciaKm !== null"
						>{{ item.distanciaKm.toFixed(2) }} km</span
					>
					<v-btn small text @click="calcDistance(item)"
						>Calcular</v-btn
					>
				</div>
			</template>

			<template #item.precio="{ item }">
				<v-text-field
					v-model.number="item.precio"
					dense
					type="number"
					hide-details
				/>
			</template>

			<template #item.telefono="{ item }">
				<div class="d-flex gap-2">
					<v-btn small icon :href="`tel:${item.telefono}`">
						<v-icon>mdi-phone</v-icon>
					</v-btn>
					<v-btn small icon :href="whatsappLink(item.telefono, item)">
						<v-icon color="green">mdi-whatsapp</v-icon>
					</v-btn>
				</div>
			</template>

			<template #item.actions="{ item }">
				<v-btn small color="primary" @click="edit(item)">Editar</v-btn>
			</template>
		</v-data-table>
	</v-card>
</template>

<script setup>
import { useFetch } from "#app";
const headers = [
	{ title: "ID", key: "id", value: "id" },
	{ title: "Cliente", key: "cliente", value: "cliente" },
	{ title: "Teléfono", key: "telefono", value: "telefono" },
	{ title: "Origen", key: "origen", value: "origen" },
	{ title: "Destino", key: "destino", value: "destino" },
	{ title: "Fecha / Hora", key: "fechaHora", value: "fechaHora" },
	{ title: "Distancia", key: "distancia", value: "distancia" },
	{ title: "Precio", key: "precio", value: "precio" },
	{ title: "Acciones", key: "actions", value: "actions" },
].map((h) => ({ text: h.title, value: h.value }));

const rateOptions = [0.8, 1.0, 1.2, 1.5];
const defaultRate = ref(1.2);

const routes = ref([
	{
		id: 1,
		cliente: "Juan Pérez",
		telefono: "+34600111222",
		origen: "Calle Alcalá 1, Madrid, España",
		destino: "Gran Vía, Madrid, España",
		fechaHora: new Date().toISOString(),
		distanciaKm: null,
		precio: null,
	},
	{
		id: 2,
		cliente: "María López",
		telefono: "+34900122334",
		origen: "Plaza Cataluña, Barcelona, España",
		destino: "Sagrada Familia, Barcelona, España",
		fechaHora: new Date().toISOString(),
		distanciaKm: null,
		precio: null,
	},
]);

const formatDate = (iso) => new Date(iso).toLocaleDateString();
const formatTime = (iso) => new Date(iso).toLocaleTimeString();

const whatsappLink = (phone, item) => {
	const text = `Hola ${item.cliente}, te escribo sobre tu transporte de ${
		item.origen
	} a ${item.destino} el ${formatDate(item.fechaHora)} a las ${formatTime(
		item.fechaHora
	)}.`;
	// wa.me expects numbers without + and special chars
	const clean = phone.replace(/\D+/g, "");
	return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
};

const edit = (item) => {
	// abrir modal de edición (no implementado aquí)
	console.log("Editar", item);
};

const calcDistance = async (item) => {
	try {
		item._loading = true;
		const res = await $fetch("/api/distance", {
			method: "POST",
			body: { origin: item.origen, destination: item.destino },
		});
		if (res?.distanceKm) {
			item.distanciaKm = Number(res.distanceKm);
			if (!item.precio || item.precio === null)
				item.precio = item.distanciaKm * Number(defaultRate.value);
		} else {
			console.warn("No distance", res);
		}
	} catch (e) {
		console.error(e);
	} finally {
		item._loading = false;
	}
};
</script>

<style scoped>
.v-data-table .v-text-field {
	max-width: 130px;
}
</style>