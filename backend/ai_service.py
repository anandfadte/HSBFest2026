import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv
import openai

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(Path(__file__).resolve().parent / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def get_openai_client() -> Optional[openai.OpenAI]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    return openai.OpenAI(api_key=api_key)


# Curated presets in case of API failure or fast default loading
PRESET_THEMES: Dict[str, Dict[str, Any]] = {
    "tokyo": {
        "theme_name": "Tokyo Cyberpunk Rain",
        "tagline": "NEON CHROME // HIGH VOLTAGE",
        "primary": "#06b6d4",
        "secondary": "#ec4899",
        "accent": "#f59e0b",
        "background_hue": "rgba(6, 182, 212, 0.22)",
        "laser_gradient": ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"],
        "particle_color": "#22d3ee",
        "particle_speed": 1.4,
        "vibe_description": "Electric blue laser rain with deep synthetic magenta reflections across rain-soaked cyber asphalt.",
    },
    "gold": {
        "theme_name": "Royal Golden Championship",
        "tagline": "PRESTIGE // GRAND ARENA",
        "primary": "#f59e0b",
        "secondary": "#fbbf24",
        "accent": "#fef08a",
        "background_hue": "rgba(245, 158, 11, 0.25)",
        "laser_gradient": ["#f59e0b", "#fbbf24", "#d97706", "#fef08a", "#f59e0b"],
        "particle_color": "#fcd34d",
        "particle_speed": 1.1,
        "vibe_description": "Radiant molten gold luxury aesthetic radiating triumphant stadium prestige.",
    },
    "matrix": {
        "theme_name": "Matrix Deep Core",
        "tagline": "HEX STREAM // DATA OVERCLOCK",
        "primary": "#10b981",
        "secondary": "#34d399",
        "accent": "#6ee7b7",
        "background_hue": "rgba(16, 185, 129, 0.22)",
        "laser_gradient": ["#10b981", "#059669", "#34d399", "#047857", "#10b981"],
        "particle_color": "#34d399",
        "particle_speed": 1.6,
        "vibe_description": "Phosphor emerald terminal streams piercing through deep cyber mainframe architectures.",
    },
    "crimson": {
        "theme_name": "Crimson Blood Moon",
        "tagline": "HYPER DRIVE // REDLINE WARFARE",
        "primary": "#f43f5e",
        "secondary": "#fb7185",
        "accent": "#f59e0b",
        "background_hue": "rgba(244, 63, 94, 0.25)",
        "laser_gradient": ["#f43f5e", "#e11d48", "#be123c", "#fb7185", "#f43f5e"],
        "particle_color": "#fb7185",
        "particle_speed": 1.8,
        "vibe_description": "Blazing crimson battle lasers surging with unfiltered adrenaline and competitive fury.",
    },
    "nebula": {
        "theme_name": "Galactic Nebula Void",
        "tagline": "DEEP COSMOS // STELLAR HORIZON",
        "primary": "#a855f7",
        "secondary": "#c084fc",
        "accent": "#38bdf8",
        "background_hue": "rgba(168, 85, 247, 0.25)",
        "laser_gradient": ["#a855f7", "#7c3aed", "#38bdf8", "#e879f9", "#a855f7"],
        "particle_color": "#c084fc",
        "particle_speed": 0.9,
        "vibe_description": "Floating stardust constellations drifting across deep interstellar violet voids.",
    },
}


def generate_theme_from_prompt(prompt: str) -> Dict[str, Any]:
    """Use OpenAI to generate a rich, cohesive cyber atmosphere palette from any user prompt."""
    prompt_clean = (prompt or "").strip().lower()
    
    # Check if a preset key matches directly
    for key, preset in PRESET_THEMES.items():
        if key in prompt_clean:
            return preset

    client = get_openai_client()
    if not client:
        return PRESET_THEMES["tokyo"]

    system_prompt = """You are an elite Cyberpunk & Futuristic Festival Visual Director for HSB FEST 2026.
Given a mood, aesthetic, theme, or concept, design a cohesive, jaw-dropping high-contrast neon visual scheme for a dark-mode website.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "theme_name": "Creative evocative title (e.g. Cyberpunk Tokyo Rain)",
  "tagline": "Short uppercase sci-fi subtitle (e.g. NEON CHROME // HIGH VOLTAGE)",
  "primary": "Vibrant neon hex color for main highlights (e.g. #06b6d4)",
  "secondary": "Complementary neon hex color for secondary badges/buttons (e.g. #ec4899)",
  "accent": "Tertiary highlight hex color for warnings/stars (e.g. #f59e0b)",
  "background_hue": "Subtle RGBA string for ambient background halos with 0.15-0.25 opacity (e.g. rgba(6, 182, 212, 0.22))",
  "laser_gradient": ["array", "of exactly 5", "vibrant hex colors", "forming a seamless loop", "first equals last"],
  "particle_color": "Hex color for background constellation particles",
  "particle_speed": float between 0.8 and 2.2 representing particle motion velocity,
  "vibe_description": "1 punchy, cinematic sentence describing the visual atmosphere."
}

Ensure all colors are high-saturation, luminescent, and look magnificent against a dark #030712 slate background."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Theme prompt: {prompt}"},
            ],
            temperature=0.8,
            max_tokens=400,
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        
        # Validate critical fields
        if not data.get("laser_gradient") or len(data.get("laser_gradient", [])) < 3:
            data["laser_gradient"] = [data.get("primary", "#06b6d4"), data.get("secondary", "#ec4899"), data.get("accent", "#f59e0b"), data.get("primary", "#06b6d4")]
        if not data.get("particle_speed"):
            data["particle_speed"] = 1.3
        return data
    except Exception as e:
        print(f"OpenAI theme generation error: {e}")
        return PRESET_THEMES["tokyo"]


def chat_with_zenith(message: str, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    """Festival assistant bot capable of answering inquiries and driving page actions."""
    client = get_openai_client()
    if not client:
        return {
            "reply": "ZENITH AI offline. Please verify OPENAI_API_KEY in backend.",
            "action": None,
        }

    system_prompt = """You are ZENITH AI, the official high-tech autonomous festival concierge for HSB FEST 2026.
Tone: Energetic, cyberpunk, festival-hyped, authoritative, welcoming.

Festival Details:
- Name: HSB FEST 2026 (College Fest Management System)
- Dates: November 14-15, 2026
- Venue: Campus Grounds, Main Auditorium, Tech Arenas, Sports Complex
- Total Prize Pool: ₹150,000+ Guaranteed Cash Pools across 15 Arenas
- 5 Mega Zones: Technical, Cultural, Gaming, Sports, Workshops
- 15 Premier Arenas:
  1. Code Sprint 2.0 (Hackathon, ₹20k prize)
  2. Robo Race 2.0 (Autonomous battle track, ₹15k prize)
  3. Web3 Hackathon (Smart contracts & dApps, ₹10k prize)
  4. Bug Hunter (Code debugging race, ₹5k prize)
  5. Valorant Clash (5v5 Tactical Shooter, ₹18k prize)
  6. BGMI Showdown (Battle Royale, ₹12k prize)
  7. FIFA 24 Console Cup (PS5 bracket, ₹5k prize)
  8. Battle of the Bands (Live rock/metal showcase, ₹18k prize)
  9. Step Up Dance Crew (Choreography battle, ₹10k prize)
  10. Haute Couture Fashion (Runway theme, ₹7k prize)
  11. 5-A-Side Football (Turf championship, ₹10k prize)
  12. Best Manager 2026 (Corporate crisis case study, ₹12k prize)
  13. UI/UX Designathon (Figma sprint, ₹8k prize)
  14. AI Prompt Battle (Generative art & LLM speedrun, ₹6k prize)
  15. Campus Quiz Bowl (Mega trivia battle, ₹5k prize)
- Registration: 100% Free online registration with instant printable Holographic VIP Entry Pass.

You can trigger interactive UI actions on the website!
If the user wants to see events, view prizes, launch the fest countdown, or change the theme, specify an 'action':
Allowed action types:
- {"type": "scroll_to", "target": "events" | "countdown" | "stats"}
- {"type": "filter_category", "category": "Technical" | "Cultural" | "Gaming" | "Sports" | "Workshop" | "All"}
- {"type": "open_prize_modal"}
- {"type": "trigger_launch_sim"}
- {"type": "morph_theme", "prompt": "<theme prompt>"}

Always reply in strict JSON format:
{
  "reply": "Your concise, enthusiastic response with markdown/emojis (max 2-3 sentences).",
  "action": null or action object
}"""

    messages = [{"role": "system", "content": system_prompt}]
    if history:
        for item in history[-4:]:
            messages.append({"role": item.get("role", "user"), "content": item.get("content", "")})
    messages.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=messages,
            temperature=0.7,
            max_tokens=350,
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return data
    except Exception as e:
        print(f"OpenAI chat error: {e}")
        return {
            "reply": "Systems temporarily calibrating! Ask me anything about HSB FEST 2026 events, prizes, or schedules.",
            "action": None,
        }
