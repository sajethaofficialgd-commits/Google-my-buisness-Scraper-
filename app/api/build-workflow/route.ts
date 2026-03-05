import { NextRequest, NextResponse } from "next/server";
import { openai, N8N_SYSTEM_PROMPT } from "@/lib/openai";
import { createWorkflow, workflowUrl } from "@/lib/n8n";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Step 1: Ask GPT-4o to generate the n8n workflow JSON
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 8192,
      messages: [
        { role: "system", content: N8N_SYSTEM_PROMPT },
        { role: "user", content: `Build an n8n workflow for: ${prompt}` },
      ],
    });

    const rawText = completion.choices[0]?.message?.content ?? "";

    // Strip markdown code fences if Claude wrapped in them
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    let workflowJson: Record<string, unknown>;
    try {
      workflowJson = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { error: "Claude returned invalid JSON", raw: rawText },
        { status: 500 }
      );
    }

    // Check if Claude returned an error object
    if (workflowJson.error) {
      return NextResponse.json(
        { error: workflowJson.error as string },
        { status: 422 }
      );
    }

    // Step 2: Deploy to n8n (strip read-only fields the API rejects)
    delete workflowJson.active;
    delete workflowJson.tags;
    const workflow = await createWorkflow(workflowJson);

    return NextResponse.json({
      success: true,
      workflowId: workflow.id,
      workflowName: workflow.name,
      workflowUrl: workflowUrl(workflow.id),
      json: workflowJson,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
