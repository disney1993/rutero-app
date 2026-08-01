import { defineEventHandler, readBody } from "h3";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { origin, destination } = body || {};

    // useRuntimeConfig es auto-importado en Nuxt/Nitro — NO importarlo desde 'h3'
    const config = useRuntimeConfig();
    const key =
        config?.GOOGLE_MAPS_API_KEY || config?.private?.GOOGLE_MAPS_API_KEY;

    if (!origin || !destination) {
        return { error: "origin and destination required" };
    }
    if (!key) {
        return { error: "Google API key not configured on server" };
    }

    const params = new URLSearchParams({
        origins: origin,
        destinations: destination,
        key,
        units: "metric",
    });

    try {
        const resp = await $fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`
        );
        const elem = resp.rows?.[0]?.elements?.[0];
        if (!elem || elem.status !== "OK") return { error: "No route" };
        const distanceMeters = elem.distance?.value ?? null;
        const distanceKm =
            distanceMeters !== null ? distanceMeters / 1000 : null;
        return { distanceKm, duration: elem.duration?.text ?? null, raw: elem };
    } catch (err) {
        return { error: String(err) };
    }
});
