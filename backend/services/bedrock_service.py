import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()

# ── Environment variables ──────────────────────────────────────────────────────
AWS_BEARER_TOKEN = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION       = os.getenv("AWS_REGION", "us-east-1")
MODEL_ID         = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

# ── Prompt template ────────────────────────────────────────────────────────────
ITINERARY_PROMPT = (
    "You are an experienced travel planner. "
    "Plan a {days}-day itinerary for {destination}.\n"
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
    Build and return a boto3 Bedrock Runtime client.
    Uses AWS_BEARER_TOKEN_BEDROCK as the bearer token (inline credential helper)
    together with the configured region.
    """
    if not AWS_BEARER_TOKEN:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK is not set in the environment.")

    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_BEARER_TOKEN,   # token used as access-key credential
        aws_secret_access_key="bedrock",       # required placeholder for boto3
    )
    return client


def get_ai_recommendation(
    destination: str,
    days: int,
    budget: float,
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
