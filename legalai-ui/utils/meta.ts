// client/utils/meta.ts
export async function saveMeta(docid: string, query: string) {
  try {
    await fetch("http://localhost:8000/meta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docid, query }),
    });
  } catch (err) {
    console.error("Failed to save metadata", err);
  }
}
