import re
import json
import time
import google.generativeai as genai

TECH_DICTIONARY = {
    "react": "React", "python": "Python", "aws": "AWS", 
    "postgres": "System Design", "database": "System Design",
    "vulnerability": "Security", "compromise": "Security", "zero-day": "Security"
}

def analyze_text_deterministically(title, text):
    combined_content = (title + " " + text).lower()
    local_tags = set()
    for keyword, tag_name in TECH_DICTIONARY.items():
        if re.search(r'\b' + re.escape(keyword) + r'\b', combined_content):
            local_tags.add(tag_name)
            
    final_tags = list(local_tags)[:3] if local_tags else ["Tech News"]
    reading_time = max(1, round(len(text.split()) / 200))
    
    base_score = 5
    if "Security" in final_tags: base_score += 3 
    if any(word in title.lower() for word in ["compromise", "vulnerability", "breach"]): base_score += 2 
    
    return {"tags": final_tags, "score": min(10, max(1, base_score)), "reading_time": reading_time, "is_relevant": len(local_tags) > 0}

def process_with_ai(title, text, model_instance, retries=3):
    prompt = f"""
    Analyze this tech article. Title: {title} | Text: {text}
    Provide a JSON response with 3 keys:
    1. "summary": A concise 3-bullet point summary array.
    2. "score": An integer from 1 to 10 rating relevance.
    3. "tags": An array of up to 3 short tags.
    Format strictly as raw JSON without markdown.
    """
    for attempt in range(retries):
        try:
            response = model_instance.generate_content(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            clean_json = re.sub(r',\s*([\]}])', r'\1', clean_json)
            data = json.loads(clean_json)
            if "tags" not in data: data["tags"] = ["Tech News"]
            return data
        except Exception as e:
            if "429" in str(e) or "Quota" in str(e):
                time.sleep(15 * (attempt + 1))
            else: return {"summary": ["Error generating summary."], "score": 5, "tags": ["Error"]}
    return {"summary": ["Rate limit exceeded."], "score": 5, "tags": ["Error"]}

def generate_embedding(text, retries=3):
    for attempt in range(retries):
        try:
            result = genai.embed_content(model="models/gemini-embedding-001", content=text, task_type="retrieval_document")
            embedding = result.get('embedding')
            if embedding and isinstance(embedding[0], list): embedding = embedding[0]
            if embedding and len(embedding) > 768: embedding = embedding[:768]
            return embedding
        except Exception as e:
            if "429" in str(e) or "Quota" in str(e): time.sleep(15 * (attempt + 1))
            else: return None
    return None