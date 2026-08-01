import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    css: ["vuetify/styles", "@mdi/font/css/materialdesignicons.css"],
    build: { transpile: ["vuetify"] },
    runtimeConfig: {
        // variables privadas aquí
        apiSecret: process.env.API_SECRET || "",
        public: {
            // expone la URL base al cliente
            apiBase: process.env.API_BASE_URL || "http://127.0.0.1:8000",
            appName: process.env.NUXT_PUBLIC_APP_NAME || "Rutero",
        },
    },
});