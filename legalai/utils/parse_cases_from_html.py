from bs4 import BeautifulSoup
from typing import List, Dict

def parse_search_results(html: str) -> List[Dict]:
    soup = BeautifulSoup(html, "html.parser")
    results = []

    for div in soup.find_all("div", class_="result"):
        title_tag = div.find("a")
        if not title_tag:
            continue

        title = title_tag.text.strip()
        href = title_tag["href"]
        docid = href.split("/")[-2] if href else None

        court_info_tag = div.find("span", class_="docsource")
        court_info = court_info_tag.text.strip() if court_info_tag else ""

        snippet = div.find("p", class_="snippet")
        summary = snippet.text.strip() if snippet else ""

        results.append({
            "title": title,
            "docid": docid,
            "url": f"https://indiankanoon.org{href}",
            "court_info": court_info,
            "summary": summary,
        })

    return results
