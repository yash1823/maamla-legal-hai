import os
import asyncio
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SAMBA_API_KEY = os.getenv("SAMBA_API_KEY")
SAMBA_BASE_URL = "https://api.sambanova.ai/v1"
SAMBA_MODEL = "Llama-4-Maverick-17B-128E-Instruct"
SAMBA_DELAY = float(os.getenv("SAMBA_DELAY", "2.0"))
MAX_TOKENS_PER_SUMMARY = 3000

client = OpenAI(
    api_key=SAMBA_API_KEY,
    base_url=SAMBA_BASE_URL,
)


async def call_sambonva(prompt: str, max_tokens: int = 256, temperature: float = 0.3) -> str:
    if not SAMBA_API_KEY:
        return "SambaNova API key not found."

    await asyncio.sleep(SAMBA_DELAY)

    try:
        response = client.chat.completions.create(
            model=SAMBA_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"SambaNova API call failed: {e}")


async def extract_keywords(text: str) -> list[str]:
    prompt = (
        "Extract the main legal keywords from this query for Indian Kanoon search. "
        "Return the keywords as a comma-separated list only:\n"
        f"{text}"
    )
    response = await call_sambonva(prompt, max_tokens=32, temperature=0.2)
    return [kw.strip() for kw in response.split(",") if kw.strip()]


async def explain_relevance(query: str, case_text: str) -> str:
    prompt = (
        f"User query: {query}\n\n"
        f"Case text: {case_text}\n\n"
        "Explain in 2-3 sentences why this case is relevant to the user's query."
    )
    return await call_sambonva(prompt, max_tokens=128, temperature=0.3)


def chunk_text(text: str, max_chars: int = MAX_TOKENS_PER_SUMMARY) -> list[str]:
    paragraphs = text.split("\n")
    chunks = []
    current_chunk = ""
    for para in paragraphs:
        if len(current_chunk) + len(para) < max_chars:
            current_chunk += para + "\n"
        else:
            chunks.append(current_chunk.strip())
            current_chunk = para + "\n"
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks


async def summarize_chunk(chunk: str) -> str:
    prompt = (
        "Summarize the following portion of a legal document in 2-3 sentences:\n\n"
        f"{chunk}"
    )
    return await call_sambonva(prompt, max_tokens=256)


async def summarize_case(text: str) -> str:
    chunks = chunk_text(text)
    if len(chunks) == 1:
        return await summarize_chunk(chunks[0])

    first_pass_summaries = []
    for chunk in chunks:
        summary = await summarize_chunk(chunk)
        first_pass_summaries.append(summary)

    combined_summary = "\n".join(first_pass_summaries)
    final_prompt = (
        "You are a legal assistant. Based on the following section-wise summaries of a legal judgment, "
        "generate a clear and concise 3-4 sentence overall summary. Avoid repeating points, and write in plain English "
        "so that a non-lawyer can understand the key outcomes and significance of the case:\n\n"
        f"{combined_summary}"
    )
    return await call_sambonva(final_prompt, max_tokens=256)


async def hierarchical_relevance(query: str, text: str) -> str:
    chunks = chunk_text(text)
    relevant_reasons = []

    for chunk in chunks:
        prompt = (
            f"User query: {query}\n\n"
            f"Case snippet: {chunk}\n\n"
            "In 1-2 sentences, explain if and why this snippet is relevant to the user query. "
            "If it's not relevant, respond only with 'Not relevant'."
        )
        reason = await call_sambonva(prompt, max_tokens=128, temperature=0.4)
        if reason.strip().lower() != "not relevant":
            relevant_reasons.append(reason.strip())

    if not relevant_reasons:
        return "This case does not appear to be relevant to the user's query."

    final_prompt = (
        "Based on the following relevance explanations of a legal case to a user's query, "
        "generate a short summary (2-3 sentences) explaining why the case is relevant:\n\n"
        + "\n".join(relevant_reasons)
    )
    return await call_sambonva(final_prompt, max_tokens=128, temperature=0.3)
