import httpx
import os
from dotenv import load_dotenv
from typing import Dict, Any
from bs4 import BeautifulSoup

load_dotenv()

API_KEY = os.getenv("INDIAN_KANOON_API_KEY")
BASE_URL = "https://api.indiankanoon.org/search/"

def clean_html_doc(html_doc: str) -> str:
    soup = BeautifulSoup(html_doc, "html.parser")
    clean_text = soup.get_text(separator="\n")
    clean_text = "\n".join(line.strip() for line in clean_text.splitlines() if line.strip())
    return clean_text

async def fetch_cases(params: Dict[str, Any]) -> Dict[str, Any]:
    headers = {
        "Authorization": f"Token {API_KEY}",
        "Accept": "application/json"
    }

    async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
        try:
            response = await client.post(BASE_URL, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            return data

        except httpx.HTTPStatusError as e:
            print(f"HTTP ERROR: {e.response.status_code} - {e.response.text}")
            return {"error": f"HTTP error {e.response.status_code}: {e.response.text}"}
        except httpx.RequestError as e:
            print(f"Request ERROR: {e}")
            return {"error": f"Request error: {str(e)}"}
        except Exception as e:
            print(f"General ERROR: {e}")
            return {"error": f"Unexpected error: {str(e)}"}

async def fetch_case_by_docid(docid: str) -> Dict[str, Any]:
    url = f"https://api.indiankanoon.org/doc/{docid}/"
    headers = {
        "Authorization": f"Token {API_KEY}",
        "Accept": "application/json"
    }

    async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
        try:
            response = await client.post(url, headers=headers)
            response.raise_for_status()
            data = response.json()

            # Clean the 'doc' HTML field if present
            if "doc" in data:
                data["clean_doc"] = clean_html_doc(data["doc"])

            return data

        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP error {e.response.status_code}: {e.response.text}"}
        except httpx.RequestError as e:
            return {"error": f"Request error: {str(e)}"}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}
