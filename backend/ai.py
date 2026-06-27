import os, json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY")) 
MODEL = "openai/gpt-oss-20b" 

def get_sentiment(text: str) -> float:
    """
    Returns sentiment score 0-100 for a single post.
    0 = very negative
    50 = neutral
    100 = very positive
    """
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            max_tokens = 100,
            response_format={"type": "json_object"}, 
            messages=[
                {
                    "role": "system",
                    "content": "You are a sentiment analyzer. Always respond with valid JSON only. No explanation."
                },
                {
                    "role": "user",
                    "content": f"""Analyze the sentiment of this text.
                    Return ONLY a JSON object with a single field 'score' (0-100).
                    0 = very negative, 50 = neutral, 100 = very positive.

                    Text: "{text}"

                    Example response: {{"score": 72}}"""
                }
            ]
            
        )
        raw_content = response.choices[0].message.content
        result = json.loads(raw_content)
        score = float(result["score"])

        return score
    
    except:
        return 50.0     # default neutral if AI fails
    
def get_topic_summary(posts: list[str], retries: int = 2) -> dict:
    if not posts:
        return {"summary": None, "score": None}

    posts_text = "\n".join([f"- {p}" for p in posts])

    for attempt in range(retries + 1):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                max_tokens=300,
                response_format={"type": "json_object"},
                messages=[
                    {
                        "role": "system",
                        "content": "You are a community mood analyzer. Always respond with valid JSON only, no explanation."
                    },
                    {
                        "role": "user",
                        "content": f"""Here are recent community vibes about a topic:

{posts_text}

Return ONLY a JSON object with:
- "summary": a 2 sentence summary of the community mood
- "score": overall vibe score from 0 to 100

Example: {{"summary": "People are mostly positive. A few concerns about price.", "score": 65}}"""
                    }
                ]
            )

            raw_content = response.choices[0].message.content
            print(f"🤖 Raw topic summary response (attempt {attempt + 1}): {raw_content}")

            result = json.loads(raw_content)
            return {"summary": result["summary"], "score": float(result["score"])}

        except Exception as e:
            print(f"❌ AI topic summary FAILED (attempt {attempt + 1}): {type(e).__name__}: {e}")
            continue   # try again

    # All retries failed
    return {"summary": None, "score": None}