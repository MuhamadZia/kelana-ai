import os
import boto3
from dotenv import load_dotenv

load_dotenv()

# ── Environment variables ──────────────────────────────────────────────────────
AWS_BEARER_TOKEN       = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_ACCESS_KEY_ID      = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY  = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION             = os.getenv("AWS_REGION", "us-east-1")
MODEL_ID               = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")
KNOWLEDGE_BASE_ID      = os.getenv("KNOWLEDGE_BASE_ID")
KNOWLEDGE_BASE_MODEL_ARN = os.getenv("KNOWLEDGE_BASE_MODEL_ARN")

# ── Prompt template ────────────────────────────────────────────────────────────
ITINERARY_PROMPT = (
    "You are an experienced travel planner. "
    "Plan a {days}-day itinerary for {destination}.\n"
    "Travel Style: USD {travel_style}\n"
    "Budget: USD {budget}\n\n"
    "For each day, structure the plan into three sections:\n"
    "- **Morning**: Provide exactly 2-3 specific morning activities with brief descriptions.\n"
    "- **Afternoon**: Include recommendations for cultural sites and local experiences "
    "(e.g. museums, temples, markets, traditional crafts, or local neighbourhoods).\n"
    "- **Evening**: Suggest dinner spots that fit the budget and travel style, "
    "plus nightlife or evening entertainment options.\n\n"
    "Format your response in Markdown format. "
)


def get_bedrock_client():
    """
    Bedrock Runtime client — uses AWS_BEARER_TOKEN_BEDROCK as access key.
    Used for itinerary generation (converse API).
    """
    if not AWS_BEARER_TOKEN:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK is not set in the environment.")

    return boto3.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_BEARER_TOKEN,
        aws_secret_access_key="bedrock",
    )


def get_knowledge_base_client():
    """
    Bedrock Agent Runtime client — uses proper IAM credentials.
    Used for Knowledge Base retrieve-and-generate (RAG).
    """
    if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        raise ValueError(
            "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set for Knowledge Base."
        )

    return boto3.client(
        service_name="bedrock-agent-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )


def get_ai_recommendation(
    destination: str,
    days: int,
    budget: float,
    travel_style: str, 
) -> str:
    """
    Send a travel-planning prompt to AWS Bedrock and return the model's response.

    Args:
        destination:   City / country to visit.
        days:          Number of travel days.
        budget:        Total trip budget in USD.

    Returns:
        The AI-generated itinerary as a plain string.

    Raises:
        ValueError:  If required environment variables are missing.
        RuntimeError: If the Bedrock API call fails.
    """
    prompt = ITINERARY_PROMPT.format(
        days=days,
        destination=destination,
        budget=budget,
        travel_style=travel_style
    )

    client = get_bedrock_client()

    # Bedrock Converse API — works with all Nova / Titan / Claude models
    try:
        response = client.converse(
            modelId=MODEL_ID,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": prompt}],
                }
            ],
        )

        # Extract the assistant's reply text
        reply: str = response["output"]["message"]["content"][0]["text"]
        return reply

    except Exception as exc:
        raise RuntimeError(f"Bedrock API call failed: {exc}") from exc


def ask_knowledge_base(question: str) -> str:
    """
    RAG using managed Knowledge Base:
    1. retrieve() — fetch relevant passages from the KB
    2. converse() — send passages + question to the model to generate an answer

    Args:
        question: The user's question string.

    Returns:
        The generated answer as a plain string.

    Raises:
        ValueError:  If required environment variables are missing.
        RuntimeError: If the Bedrock API call fails.
    """
    if not KNOWLEDGE_BASE_ID:
        raise ValueError("KNOWLEDGE_BASE_ID is not set in the environment.")

    kb_client      = get_knowledge_base_client()
    runtime_client = boto3.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )

    try:
        # Step 1 — retrieve relevant passages from the Knowledge Base
        retrieve_response = kb_client.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={"text": question},
            retrievalConfiguration={
                "managedSearchConfiguration": {"numberOfResults": 5}
            },
        )

        results = retrieve_response.get("retrievalResults", [])

        # Build context block from retrieved passages
        if results:
            context_parts = []
            for i, r in enumerate(results, 1):
                passage = r.get("content", {}).get("text", "").strip()
                if passage:
                    context_parts.append(f"[{i}] {passage}")
            context = "\n\n".join(context_parts)
        else:
            context = "No relevant information found in the knowledge base."

        # Step 2 — generate answer using the model
        prompt = (
            "You are a helpful travel assistant. "
            "Use the following knowledge base excerpts to answer the user's question. "
            "If the excerpts do not contain enough information, say so clearly.\n\n"
            f"Knowledge Base Context:\n{context}\n\n"
            f"Question: {question}"
        )

        converse_response = runtime_client.converse(
            modelId=MODEL_ID,
            messages=[{"role": "user", "content": [{"text": prompt}]}],
        )

        answer: str = converse_response["output"]["message"]["content"][0]["text"]
        return answer

    except Exception as exc:
        raise RuntimeError(f"Knowledge Base query failed: {exc}") from exc
