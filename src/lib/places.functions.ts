import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type ProviderResult = {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  reviewsCount: number | null;
  phone: string | null;
  openNow: boolean | null;
  mapsUrl: string;
  website: string | null;
};

const schema = z.object({
  query: z.string().trim().min(2).max(120),
  near: z.string().trim().max(120).optional(),
});

/** Live provider search powered by Google Places (Text Search). */
export const searchProviders = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<{ configured: boolean; results: ProviderResult[]; error?: string }> => {
    const key = process.env["GOOGLE_MAPS_API_KEY"];
    if (!key) return { configured: false, results: [] };

    const textQuery = data.near ? `${data.query} near ${data.near}` : data.query;

    try {
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.currentOpeningHours.openNow,places.googleMapsUri,places.websiteUri",
        },
        body: JSON.stringify({ textQuery, maxResultCount: 20 }),
      });

      if (!res.ok) {
        console.error("[places] search failed", res.status, await res.text());
        return { configured: true, results: [], error: "Search is temporarily unavailable." };
      }

      const json = (await res.json()) as {
        places?: Array<{
          id: string;
          displayName?: { text?: string };
          formattedAddress?: string;
          rating?: number;
          userRatingCount?: number;
          nationalPhoneNumber?: string;
          currentOpeningHours?: { openNow?: boolean };
          googleMapsUri?: string;
          websiteUri?: string;
        }>;
      };

      const results: ProviderResult[] = (json.places ?? []).map((p) => ({
        id: p.id,
        name: p.displayName?.text ?? "Unnamed provider",
        address: p.formattedAddress ?? "",
        rating: p.rating ?? null,
        reviewsCount: p.userRatingCount ?? null,
        phone: p.nationalPhoneNumber ?? null,
        openNow: p.currentOpeningHours?.openNow ?? null,
        mapsUrl:
          p.googleMapsUri ??
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.displayName?.text ?? textQuery)}`,
        website: p.websiteUri ?? null,
      }));

      return { configured: true, results };
    } catch (err) {
      console.error("[places] search error", err);
      return { configured: true, results: [], error: "Search is temporarily unavailable." };
    }
  });
