import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s timeout for Vercel

const SERP_API_KEY = "1cc7e8a58cc8bb827bbf12d92c9450aa0ca623d4139eb1863c76c879ae6a0daf";
const SERP_BASE = "https://serpapi.com/search.json";

interface Review {
  reviewer_name: string;
  review_rating: number | null;
  review_date: string;
  review_text: string;
  sentence_count: number;
}

interface PlaceResult {
  place_name: string;
  place_rating: number | null;
  place_address: string;
  reviews: Review[];
}

export async function POST(req: NextRequest) {
  try {
    const { query, location } = await req.json();

    if (!query?.trim() || !location?.trim()) {
      return NextResponse.json({ error: "query and location are required" }, { status: 400 });
    }

    // Step 1: Search Google Maps for places
    const searchUrl = new URL(SERP_BASE);
    searchUrl.searchParams.set("engine", "google_maps");
    searchUrl.searchParams.set("q", `${query} in ${location}`);
    searchUrl.searchParams.set("type", "search");
    searchUrl.searchParams.set("hl", "en");
    searchUrl.searchParams.set("gl", "in");
    searchUrl.searchParams.set("api_key", SERP_API_KEY);

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) throw new Error(`SerpAPI search failed: ${searchRes.status}`);
    const searchData = await searchRes.json();

    const places = (searchData.local_results || []).slice(0, 5); // limit to 5 for speed
    if (places.length === 0) {
      return NextResponse.json({ error: "No places found for that search." }, { status: 404 });
    }

    // Step 2: Fetch reviews for each place (parallel, capped at 5)
    const results: PlaceResult[] = [];

    await Promise.all(
      places.map(async (place: Record<string, unknown>) => {
        const dataId = place.data_id as string;
        if (!dataId) return;

        const reviewUrl = new URL(SERP_BASE);
        reviewUrl.searchParams.set("engine", "google_maps_reviews");
        reviewUrl.searchParams.set("data_id", dataId);
        reviewUrl.searchParams.set("hl", "en");
        reviewUrl.searchParams.set("sort_by", "ratingHigh");
        reviewUrl.searchParams.set("api_key", SERP_API_KEY);

        const reviewRes = await fetch(reviewUrl.toString());
        if (!reviewRes.ok) return;
        const reviewData = await reviewRes.json();

        const placeInfo = reviewData.place_info || {};
        const rawReviews: Review[] = [];

        for (const r of reviewData.reviews || []) {
          const text: string = r.snippet || "";
          if (!text) continue;
          const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 5);
          if (sentences.length > 4) {
            rawReviews.push({
              reviewer_name: r.user?.name || "Anonymous",
              review_rating: r.rating || null,
              review_date: r.date || "",
              review_text: text,
              sentence_count: sentences.length,
            });
          }
        }

        if (rawReviews.length > 0) {
          results.push({
            place_name: placeInfo.title || (place.title as string) || "Unknown",
            place_rating: placeInfo.rating || (place.rating as number) || null,
            place_address: placeInfo.address || (place.address as string) || "",
            reviews: rawReviews,
          });
        }
      })
    );

    const totalReviews = results.reduce((sum, p) => sum + p.reviews.length, 0);

    return NextResponse.json({
      success: true,
      query,
      location,
      places_found: places.length,
      places_with_reviews: results.length,
      total_reviews: totalReviews,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
