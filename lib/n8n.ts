const N8N_API_URL = process.env.N8N_API_URL?.replace(/\/$/, "");
const N8N_API_KEY = process.env.N8N_API_KEY;

function headers() {
  return {
    "Content-Type": "application/json",
    "X-N8N-API-KEY": N8N_API_KEY ?? "",
  };
}

export interface N8NWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function createWorkflow(workflowJson: object): Promise<N8NWorkflow> {
  if (!N8N_API_URL) throw new Error("N8N_API_URL is not set");
  if (!N8N_API_KEY) throw new Error("N8N_API_KEY is not set");

  const res = await fetch(`${N8N_API_URL}/api/v1/workflows`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(workflowJson),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`n8n API error ${res.status}: ${text}`);
  }

  return res.json();
}

export function workflowUrl(workflowId: string): string {
  return `${N8N_API_URL}/workflow/${workflowId}`;
}
