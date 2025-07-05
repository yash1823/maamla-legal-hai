from pinecone import Pinecone, ServerlessSpec, CloudProvider, AwsRegion, VectorType
from dotenv import load_dotenv
import os

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "legal-cases-index"

pc = Pinecone(api_key=PINECONE_API_KEY)

# Create the index if it doesn't exist
if INDEX_NAME not in [i.name for i in pc.list_indexes()]:
    pc.create_index(
        name=INDEX_NAME,
        dimension=1536,
        spec=ServerlessSpec(
            cloud=CloudProvider.AWS,
            region=AwsRegion.US_EAST_1
        ),
        vector_type=VectorType.DENSE
    )

# Get index client (important: after creation, get by host)
index_description = pc.describe_index(INDEX_NAME)
index = pc.Index(host=index_description.host)

# Dummy embedding function — replace with real model later
def get_embedding(text: str):
    return [0.1] * 1536  # Placeholder

def embed_and_store_cases(cases: list):
    vectors = []
    for case in cases:
        vectors.append((
            case["id"],
            get_embedding(case["text"]),
            {"title": case["title"]}
        ))
    index.upsert(vectors=vectors, namespace="legalai")

def query_similar_cases(query: str, top_k: int = 5):
    embedding = get_embedding(query)
    results = index.query(
        vector=embedding,
        top_k=top_k,
        include_metadata=True,
        namespace="legalai"
    )
    return results
