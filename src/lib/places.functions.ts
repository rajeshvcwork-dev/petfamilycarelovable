import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type ProviderResult = {
  id: string;
  name: string;
  category: string;
  address: string;
  mapsUrl: string;
  searchUrl: string;
  lat: number;
  lng: number;
};

const schema = z.object({
  query: z.string().trim().min(2).max(120),
  near: z.string().trim().max(120).optional(),
});

/**
 * Free provider search — uses OpenStreetMap's Nominatim service (no API key,
 * no billing) and links out to Google search / Google Maps for each result.
 */
export const searchProviders = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<{ results: ProviderResult[]; error?: string }> => {
    const term = data.near ? `${data.query} ${data.near}` : data.query;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&format=jsonv2&limit=20&addressdetails=1`;

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "PetCareFamily/1.0 (pet healthcare app provider search)",
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        console.error("[search] nominatim failed", res.status);
        return { results: [], error: "Search is temporarily unavailable. Please try again." };
      }

      const json = (await res.json()) as Array<{
        place_id: number;
        display_name: string;
        name?: string;
        type?: string;
        category?: string;
        lat: string;
        lon: string;
      }>;

      const results: ProviderResult[] = json.map((p) => {
        const name = p.name && p.name.trim() ? p.name : p.display_name.split(",")[0]!;
        const label = `${name} ${p.display_name.split(",").slice(1, 3).join(",").trim()}`;
        return {
          id: String(p.place_id),
          name,
          category: (p.type ?? p.category ?? "place").replace(/_/g, " "),
          address: p.display_name,
          lat: Number(p.lat),
          lng: Number(p.lon),
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`,
          searchUrl: `https://www.google.com/search?q=${encodeURIComponent(label)}`,
        };
      });

      return { results };
    } catch (err) {
      console.error("[search] error", err);
      return { results: [], error: "Search is temporarily unavailable. Please try again." };
    }
  });
