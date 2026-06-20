import os, json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY")) 
MODEL = "llama3-8b-8192" 

def get_sentiment(text: str) -> float:
    """
    Returns sentiment score 0-100 for a single post.
    0 = very negative
    50 = neutral
    100 = very positive
    """
    
    try:
        print(f"🔍 Analyzing sentiment for: {text}")   # DEBUG
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
        print(f"🤖 Raw AI response: {raw_content}")     # DEBUG

        result = json.loads(raw_content)
        score = float(result["score"])
        print(f"✅ Parsed score: {score}")               # DEBUG

        return score
    
    except:
        print(f"❌ AI sentiment FAILED: {type(e).__name__}: {e}")  # DEBUG
        return 50.0     # default neutral if AI fails
    
def get_topic_summary(posts: list[str]) -> dict:
    """
    Return AI summary and vibe score for a topic
    based on its recent posts. 
    """
    
    if not posts:
        return {"summary": None, "score": None}
    
    try:
        posts_text = "\n".join([f"- {p}" for p in posts])
        
        response = client.chat.completions.create(
            model=MODEL,
            max_tokens=200,
            response_format={"type": "json_object"}, 
            messages = [
                {
                    "role": "system",
                    "content": f"""Here are recent community vibes about a topic:
                    
                    {posts_text}
                    
                    
                    Return ONLY a JSON object with:
                    - "summary": 2 sentence summary of the community mood
                    - "score": overall vibe score 0-100
                    
                    Example: {{"summary": "People are mostly positive. A few concerns about price.", "score": 65}}"""                    
                }
            ]
        )
        
        result = json.loads(response.choices[0].message.content)
        return {"summary": result["summary"], "score": float(result["score"])}
    
    
    except Exception:
        return {"summary": None, "score": None}
        
    