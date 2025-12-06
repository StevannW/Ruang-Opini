from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
import google.generativeai as genai
import os
from typing import Literal
import base64
from PIL import Image
import io
from dotenv import load_dotenv
import json
import re

# Load environment variables
load_dotenv()

app = FastAPI(title="GovSense API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")

genai.configure(api_key=GEMINI_API_KEY)

# Models - Use available Gemini 2.0 models
text_model = genai.GenerativeModel('gemini-2.0-flash')
vision_model = genai.GenerativeModel('gemini-2.0-flash')  # This model supports both text and images


class TextInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class ClassificationResponse(BaseModel):
    classification: Literal["constructive", "neutral", "hate_speech", "unrelated"]
    confidence: float = Field(..., ge=0.0, le=1.0)
    explanation: str
    raw_output: str
    timestamp: str
    scores: dict = None
    reasoning: dict = None
    key_findings: list = None
    context_references: list = None
    red_flags: list = None
    overall_impression: str = None
    final_scores: dict = None


@app.on_event("startup")
async def startup_event():
    """Initialize API on startup"""
    print("🚀 GovSense API started successfully")
    print(f"📅 Server time: {datetime.now().isoformat()}")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "GovSense API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/classify_text", response_model=ClassificationResponse)
async def classify_text(input_data: TextInput):
    """
    Classify text as constructive, neutral, hate_speech, or unrelated
    """
    try:
        # Build enhanced prompt for detailed analysis
        prompt = f"""Analisis teks berikut tentang pemerintahan/politik dan berikan penilaian detail dalam Bahasa Indonesia:

Teks: "{input_data.text}"

Berikan analisis komprehensif dalam format JSON dengan field berikut (gunakan Bahasa Indonesia untuk semua penjelasan):
{{
  "scores": {{
    "keterkaitan_fakta": 0-100,
    "kejujuran_intelektual": 0-100,
    "mendorong_berpikir_kritis": 0-100,
    "kesadaran_kekuasaan": 0-100,
    "kreativitas": 0-100,
    "informasi_salah": 0-100,
    "kebencian_perpecahan": 0-100,
    "penghinaan_pribadi": 0-100,
    "hasutan_bahaya": 0-100
  }},
  "classification": "constructive/neutral/hate_speech/unrelated",
  "confidence": 0.0-1.0,
  "explanation": "ringkasan singkat dalam Bahasa Indonesia",
  "key_findings": ["temuan1 dalam Bahasa Indonesia", "temuan2", "temuan3"],
  "context_references": ["referensi konteks politik terkini yang relevan", "sumber verifikasi fakta jika ada", "kontradiksi atau dukungan konteks"],
  "red_flags": ["bendera merah jika ada masalah serius dalam konten"],
  "overall_impression": "analisis detail dalam Bahasa Indonesia",
  "final_scores": {{
    "constructive_percentage": 0-100,
    "destructive_percentage": 0-100,
    "classification": "Sangat Membangun/Membangun/Netral/Destruktif"
  }}
}}

Jika tidak bisa memberikan JSON, gunakan format:
CLASSIFICATION: [category]
CONFIDENCE: [0.0-1.0]
EXPLANATION: [penjelasan singkat dalam Bahasa Indonesia]
"""

        # Send to Gemini
        response = text_model.generate_content(prompt)
        raw_output = response.text

        # Try to parse JSON first
        import json
        import re
        
        json_match = re.search(r'\{[\s\S]*\}', raw_output)
        if json_match:
            try:
                json_data = json.loads(json_match.group())
                
                # Ensure reasoning exists - generate from scores if not provided
                reasoning = json_data.get("reasoning", {})
                scores = json_data.get("scores", {})
                
                if not reasoning and scores:
                    # Generate default reasoning based on scores
                    reasoning = {}
                    for key, value in scores.items():
                        if value >= 80:
                            reasoning[key] = f"Skor sangat baik ({value}/100). Konten menunjukkan kualitas tinggi pada aspek ini."
                        elif value >= 60:
                            reasoning[key] = f"Skor baik ({value}/100). Konten memenuhi standar pada aspek ini."
                        elif value >= 40:
                            reasoning[key] = f"Skor cukup ({value}/100). Konten perlu peningkatan pada aspek ini."
                        else:
                            reasoning[key] = f"Skor rendah ({value}/100). Konten memiliki masalah signifikan pada aspek ini."
                
                return ClassificationResponse(
                    classification=json_data.get("classification", "neutral"),
                    confidence=float(json_data.get("confidence", 0.75)),
                    explanation=json_data.get("explanation", ""),
                    raw_output=raw_output,
                    timestamp=datetime.now().isoformat(),
                    scores=scores if scores else None,
                    reasoning=reasoning if reasoning else None,
                    key_findings=json_data.get("key_findings", []),
                    context_references=json_data.get("context_references", []),
                    red_flags=json_data.get("red_flags", []),
                    overall_impression=json_data.get("overall_impression", ""),
                    final_scores=json_data.get("final_scores")
                )
            except:
                pass

        # Fallback to simple parsing
        lines = raw_output.strip().split('\n')
        classification = None
        confidence = 0.0
        explanation = ""

        for line in lines:
            if line.startswith("CLASSIFICATION:"):
                classification = line.split(":", 1)[1].strip().lower()
            elif line.startswith("CONFIDENCE:"):
                try:
                    confidence = float(line.split(":", 1)[1].strip())
                except ValueError:
                    confidence = 0.75
            elif line.startswith("EXPLANATION:"):
                explanation = line.split(":", 1)[1].strip()

        # Validate classification
        valid_classifications = ["constructive", "neutral", "hate_speech", "unrelated"]
        if classification not in valid_classifications:
            raw_lower = raw_output.lower()
            for cat in valid_classifications:
                if cat in raw_lower:
                    classification = cat
                    break
            if classification not in valid_classifications:
                classification = "neutral"

        if not explanation:
            explanation = raw_output[:200]

        return ClassificationResponse(
            classification=classification,
            confidence=min(max(confidence, 0.0), 1.0),
            explanation=explanation,
            raw_output=raw_output,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")


@app.post("/classify_image", response_model=ClassificationResponse)
async def classify_image(file: UploadFile = File(...)):
    """
    Classify image content as constructive, neutral, hate_speech, or unrelated
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Invalid image format. Only JPG and PNG are supported."
            )

        # Read and validate file size (5MB limit)
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Image size exceeds 5MB limit."
            )

        # Open image
        image = Image.open(io.BytesIO(contents))

        # Build prompt for vision model with detailed analysis
        prompt = """Analisis gambar ini tentang pemerintahan/politik dan berikan penilaian detail dalam Bahasa Indonesia:

Berikan analisis komprehensif dalam format JSON dengan field berikut (gunakan Bahasa Indonesia untuk semua penjelasan):
{
  "scores": {
    "keterkaitan_fakta": 0-100,
    "kejujuran_intelektual": 0-100,
    "mendorong_berpikir_kritis": 0-100,
    "kesadaran_kekuasaan": 0-100,
    "kreativitas": 0-100,
    "informasi_salah": 0-100,
    "kebencian_perpecahan": 0-100,
    "penghinaan_pribadi": 0-100,
    "hasutan_bahaya": 0-100
  },
  "classification": "constructive/neutral/hate_speech/unrelated",
  "confidence": 0.0-1.0,
  "explanation": "ringkasan singkat dalam Bahasa Indonesia",
  "key_findings": ["temuan1 dalam Bahasa Indonesia", "temuan2", "temuan3"],
  "context_references": ["referensi konteks politik terkini yang relevan", "sumber verifikasi fakta jika ada", "kontradiksi atau dukungan konteks"],
  "red_flags": ["bendera merah jika ada masalah serius dalam konten"],
  "overall_impression": "analisis detail dalam Bahasa Indonesia",
  "final_scores": {
    "constructive_percentage": 0-100,
    "destructive_percentage": 0-100,
    "classification": "Sangat Membangun/Membangun/Netral/Destruktif"
  }
}

Jika tidak bisa memberikan JSON, gunakan format:
CLASSIFICATION: [category]
CONFIDENCE: [0.0-1.0]
EXPLANATION: [penjelasan singkat dalam Bahasa Indonesia]
"""

        # Send to Gemini Vision
        response = vision_model.generate_content([prompt, image])
        raw_output = response.text

        # Try to parse JSON first
        json_match = re.search(r'\{[\s\S]*\}', raw_output)
        if json_match:
            try:
                json_data = json.loads(json_match.group())
                
                # Ensure reasoning exists - generate from scores if not provided
                reasoning = json_data.get("reasoning", {})
                scores = json_data.get("scores", {})
                
                if not reasoning and scores:
                    reasoning = {}
                    for key, value in scores.items():
                        if value >= 80:
                            reasoning[key] = f"Skor sangat baik ({value}/100). Konten menunjukkan kualitas tinggi pada aspek ini."
                        elif value >= 60:
                            reasoning[key] = f"Skor baik ({value}/100). Konten memenuhi standar pada aspek ini."
                        elif value >= 40:
                            reasoning[key] = f"Skor cukup ({value}/100). Konten perlu peningkatan pada aspek ini."
                        else:
                            reasoning[key] = f"Skor rendah ({value}/100). Konten memiliki masalah signifikan pada aspek ini."
                
                return ClassificationResponse(
                    classification=json_data.get("classification", "neutral"),
                    confidence=float(json_data.get("confidence", 0.75)),
                    explanation=json_data.get("explanation", ""),
                    raw_output=raw_output,
                    timestamp=datetime.now().isoformat(),
                    scores=scores if scores else None,
                    reasoning=reasoning if reasoning else None,
                    key_findings=json_data.get("key_findings", []),
                    context_references=json_data.get("context_references", []),
                    red_flags=json_data.get("red_flags", []),
                    overall_impression=json_data.get("overall_impression", ""),
                    final_scores=json_data.get("final_scores")
                )
            except:
                pass

        # Fallback to simple parsing
        lines = raw_output.strip().split('\n')
        classification = None
        confidence = 0.0
        explanation = ""

        for line in lines:
            if line.startswith("CLASSIFICATION:"):
                classification = line.split(":", 1)[1].strip().lower()
            elif line.startswith("CONFIDENCE:"):
                try:
                    confidence = float(line.split(":", 1)[1].strip())
                except ValueError:
                    confidence = 0.75
            elif line.startswith("EXPLANATION:"):
                explanation = line.split(":", 1)[1].strip()

        # Validate classification
        valid_classifications = ["constructive", "neutral", "hate_speech", "unrelated"]
        if classification not in valid_classifications:
            raw_lower = raw_output.lower()
            for cat in valid_classifications:
                if cat in raw_lower:
                    classification = cat
                    break
            if classification not in valid_classifications:
                classification = "neutral"

        if not explanation:
            explanation = raw_output[:200]

        return ClassificationResponse(
            classification=classification,
            confidence=min(max(confidence, 0.0), 1.0),
            explanation=explanation,
            raw_output=raw_output,
            timestamp=datetime.now().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image classification error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
