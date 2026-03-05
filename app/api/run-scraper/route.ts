import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { query, location } = await req.json();

    if (!query?.trim() || !location?.trim()) {
      return NextResponse.json(
        { error: "query and location are required" },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_SCRAPER_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "N8N_SCRAPER_WEBHOOK_URL is not configured" },
        { status: 500 }
      );
    }

    const n8nRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, location }),
    });

    if (!n8nRes.ok) {
      const text = await n8nRes.text();
      return NextResponse.json(
        { error: `n8n workflow failed: ${text}` },
        { status: 500 }
      );
    }

    const data = await n8nRes.json().catch(() => ({ success: true }));
    return NextResponse.json({ success: true, message: data.message ?? "Done" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
