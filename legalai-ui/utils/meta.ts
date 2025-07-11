
export async function saveMeta(docid: string, query: string) {
  try {
    await fetch(`https://maamla-legal-hai-api.onrender.com/meta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docid, query }),
    });
  } catch (err) {
    console.error("Failed to save metadata", err);
  }
}