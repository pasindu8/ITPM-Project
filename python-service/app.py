import os
import json
import base64
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime
import traceback
from typing import List, Dict, Any
import time

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ─── OpenAI client ────────────────────────────────────────────────────────────
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    print("❌ OPENAI_API_KEY not found")
    openai_client = None
else:
    openai_client = OpenAI(api_key=openai_api_key)
    print("✅ OpenAI client initialized")

# ─── Reference data ───────────────────────────────────────────────────────────
MODULE_DATABASE = {
    "IT3040": {"name": "ITPM", "full_name": "IT Project Management"},
    "IT3020": {"name": "DS",   "full_name": "Data Structures"},
    "IT3030": {"name": "PAF",  "full_name": "Programming and Frameworks"},
    "IT3010": {"name": "NDM",  "full_name": "Network Design and Management"},
    "IT3050": {"name": "ESD",  "full_name": "Enterprise Systems Development"},
    "IT3060": {"name": "OS",   "full_name": "Operating Systems"},
    "IT3070": {"name": "DBMS", "full_name": "Database Management Systems"},
    "IT3080": {"name": "CN",   "full_name": "Computer Networks"},
    "IT3090": {"name": "AI",   "full_name": "Artificial Intelligence"},
    "IT3100": {"name": "CC",   "full_name": "Cloud Computing"},
}

VALID_DAYS  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
VALID_TIMES = ["08:30","09:30","10:30","11:30","12:30","13:30","14:30","15:30","16:30","19:00","20:00"]
VALID_TYPES = ["Lecture","Practical","Tutorial","Lab","Seminar","Workshop"]

TIME_FIXES = {
    "8:30":"08:30","9:30":"09:30","9:00":"09:30","09:0":"09:30","09.30":"09:30",
    "10:0":"10:30","10.30":"10:30","I0:30":"10:30","10:00":"10:30",
    "11.30":"11:30","12.30":"12:30","13.30":"13:30","14.30":"14:30",
    "15.30":"15:30","16.30":"16:30","19.00":"19:00","20.00":"20:00",
}
VENUE_FIXES = {
    "F30l":"F301","F3O1":"F301","Gl06":"GIO6","GI06":"GIO6",
    "F13O3":"F1303","F13O4":"F1304","FI303":"F1303","FI304":"F1304",
    "F13O3+F13O4":"F1303+F1304","F1303+F13O4":"F1303+F1304",
}

# ─── Image encoding ────────────────────────────────────────────────────────────
def encode_image(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

# ─── Parse JSON safely ────────────────────────────────────────────────────────
def parse_json(text: str) -> List[Dict]:
    text = re.sub(r"```(?:json)?", "", text).strip()
    text = re.sub(r",\s*}", "}", text)
    text = re.sub(r",\s*]", "]", text)
    try:
        data = json.loads(text)
        if isinstance(data, list):
            return data
        for key in ("entries","timetable","data","sessions"):
            if key in data and isinstance(data[key], list):
                return data[key]
        for v in data.values():
            if isinstance(v, list):
                return v
    except Exception:
        m = re.search(r"\[\s*\{.*?\}\s*\]", text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                pass
    return []

# ─── Extract ONE day ──────────────────────────────────────────────────────────
def extract_day(base64_image: str, day: str, target_group: str) -> List[Dict]:
    print(f"  📅 Extracting {day} ...")

    system_prompt = """You are an expert at reading SLIIT (Sri Lanka Institute of Information Technology)
university timetable images. You will be given a full timetable image and asked to focus
on ONE specific day column only.

TIMETABLE STRUCTURE YOU MUST UNDERSTAND:
- Left-most column = TIME slots: 08:30, 09:30, 10:30, 11:30, 12:30, 13:30, 14:30, 15:30, 16:30, 19:00, 20:00
- Day columns: Monday, Tuesday, Wednesday, Thursday, Friday
- A day column can be SPLIT into two sub-columns side by side, each for a different student group
  (group codes look like: Y3.S1.WD.IT.0101, Y3.S1.WD.IT.0102, Y3.S1.WD.IT.03, etc.)
- When a cell is split, read BOTH sub-columns as SEPARATE entries
- A cell spanning multiple rows = ONE session starting at the FIRST row's time
- Cells showing "---" or "-x-" = no session, SKIP them
- Online sessions (19:00, 20:00) are valid, include them

FIELD RULES:
- day:        the day name you are reading (given to you)
- time:       HH:MM from the left column (e.g. 08:30, 13:30)
- group:      exact group code from inside the cell (e.g. Y3.S1.WD.IT.0101).
              If no group shown in cell, use the column header group.
- moduleCode: IT + 4 digits. Fix OCR: "1T" -> "IT", letter-O <-> digit-0
- moduleName: short code after the dash (ITPM, DS, NDM, PAF, ESD, etc.)
- type:       Lecture | Practical | Tutorial | Lab | Seminar | Workshop
- venue:      room code exactly as shown (F301, F1303+F1304, GIO6, B502, G602...)
- lecturers:  array of all lecturer names in that cell

Return ONLY a valid JSON array. No extra text. No markdown."""

    user_prompt = f"""FOCUS ONLY ON THE "{day}" COLUMN in this timetable image.

Read every single time slot from 08:30 down to 20:00 in the {day} column.
For each non-empty, non-"---", non-"-x-" cell, produce one JSON entry.
If the {day} column is split into two sub-columns, produce entries for BOTH sub-columns.

Student group context: {target_group}

Return JSON array:
[
  {{
    "day": "{day}",
    "time": "08:30",
    "group": "Y3.S1.WD.IT.0101",
    "moduleCode": "IT3040",
    "moduleName": "ITPM",
    "type": "Practical",
    "venue": "F1303+F1304",
    "lecturers": ["Ms. Tasikala Rathnayake", "Ms. Poorna Gayathri Panduwawala"]
  }}
]

If there are NO sessions at all for {day}, return: []"""

    try:
        resp = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "high",
                            },
                        },
                    ],
                },
            ],
            temperature=0.0,
            max_tokens=2000,
        )
        raw = resp.choices[0].message.content.strip()
        entries = parse_json(raw)
        print(f"    -> {len(entries)} entries found for {day}")
        return entries
    except Exception as e:
        print(f"    ERROR on {day}: {e}")
        return []

# ─── Full extraction: Monday to Friday ────────────────────────────────────────
def extract_full_timetable(image_path: str, target_group: str) -> List[Dict]:
    print(f"\nDay-by-day extraction for group: {target_group}")
    base64_image = encode_image(image_path)
    print(f"Image encoded ({os.path.getsize(image_path)//1024} KB)\n")

    all_entries = []
    for day in VALID_DAYS:
        day_entries = extract_day(base64_image, day, target_group)
        all_entries.extend(day_entries)
        time.sleep(0.5)

    print(f"\nTotal raw entries collected: {len(all_entries)}")
    return all_entries

# ─── Validate + normalise one entry ───────────────────────────────────────────
def validate_entry(entry: Dict, target_group: str):
    day = str(entry.get("day","")).strip().capitalize()
    day_map = {
        "Mon":"Monday","Tue":"Tuesday","Wed":"Wednesday",
        "Thu":"Thursday","Fri":"Friday",
        "Monday":"Monday","Tuesday":"Tuesday","Wednesday":"Wednesday",
        "Thursday":"Thursday","Friday":"Friday",
    }
    day = day_map.get(day, day)
    if day not in VALID_DAYS:
        return None, False, f"Bad day: {day}"

    t = str(entry.get("time","")).strip()
    t = TIME_FIXES.get(t, t)
    if t not in VALID_TIMES:
        return None, False, f"Bad time: {t}"

    code = str(entry.get("moduleCode","")).upper().strip()
    code = code.replace("1T","IT")
    code = re.sub(r"[^A-Z0-9]","",code)
    if code.startswith("IT") and len(code) >= 6:
        code = "IT" + code[2:].replace("O","0")
    if not (code.startswith("IT") and len(code)==6 and code[2:].isdigit()):
        return None, False, f"Bad code: {entry.get('moduleCode')}"

    tl = str(entry.get("type","")).lower()
    if   "lecture"   in tl: type_ = "Lecture"
    elif "practical" in tl: type_ = "Practical"
    elif "tutorial"  in tl: type_ = "Tutorial"
    elif "lab"       in tl: type_ = "Lab"
    elif "seminar"   in tl: type_ = "Seminar"
    elif "workshop"  in tl: type_ = "Workshop"
    else:                   type_ = "Lecture"

    venue = VENUE_FIXES.get(str(entry.get("venue","")).strip(), str(entry.get("venue","")).strip())
    group = str(entry.get("group", target_group)).strip()

    lec_raw = entry.get("lecturers", entry.get("lecturer",[]))
    if isinstance(lec_raw, str):
        lecturers = [lec_raw] if lec_raw.strip() else []
    elif isinstance(lec_raw, list):
        lecturers = [str(l).strip() for l in lec_raw if str(l).strip()]
    else:
        lecturers = []

    mod = MODULE_DATABASE.get(code, {})
    result = {
        "day":        day,
        "time":       t,
        "group":      group,
        "moduleCode": code,
        "moduleName": mod.get("name", entry.get("moduleName", code[:4])),
        "type":       type_,
        "venue":      venue,
        "lecturers":  lecturers,
        "lecturer":   ", ".join(lecturers),
        "endTime":    "",
        "year":       "",
        "semester":   "",
        "program":    "",
    }
    return result, True, "OK"

# ─── Deduplication ────────────────────────────────────────────────────────────
def deduplicate(entries: List[Dict]) -> List[Dict]:
    seen = {}
    for e in entries:
        key = f"{e['day']}|{e['time']}|{e['moduleCode']}|{e['group']}"
        if key not in seen:
            seen[key] = e
    day_ord  = {d:i for i,d in enumerate(VALID_DAYS)}
    time_ord = {t:i for i,t in enumerate(VALID_TIMES)}
    return sorted(seen.values(),
                  key=lambda x: (day_ord.get(x["day"],99), time_ord.get(x["time"],99)))

# ─── Flask endpoint ────────────────────────────────────────────────────────────
@app.route("/process", methods=["POST"])
def process_timetable():
    print("\n" + "="*70)
    print(f"NEW REQUEST  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)

    data         = request.json or {}
    file_path    = data.get("filePath","")
    student_info = data.get("studentInfo",{})
    target_group = student_info.get("group","0101")

    if not file_path or not os.path.exists(file_path):
        return jsonify({"error":"File not found"}), 400
    if not openai_client:
        return jsonify({"error":"OpenAI API not configured"}), 500

    print(f"File  : {os.path.basename(file_path)}")
    print(f"Group : {target_group}\n")

    try:
        raw_entries = extract_full_timetable(file_path, target_group)
        if not raw_entries:
            return jsonify([]), 200

        valid, skipped = [], 0
        for entry in raw_entries:
            enhanced, ok, msg = validate_entry(entry, target_group)
            if ok:
                valid.append(enhanced)
                print(f"  OK  {enhanced['day']:10} {enhanced['time']}  "
                      f"{enhanced['moduleCode']}  {enhanced['type']:12}  "
                      f"{enhanced['group']}  {enhanced['venue']}")
            else:
                skipped += 1
                print(f"  SKIP  {msg}  raw={entry}")

        final = deduplicate(valid)
        print(f"\nDone: {len(final)} valid entries  ({skipped} skipped)\n")
        return jsonify(final), 200

    except Exception as e:
        print(f"Unhandled error: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":  "healthy",
        "openai":  "available" if openai_client else "not_configured",
        "model":   "gpt-4o",
        "strategy":"day-by-day (5 calls)",
    }), 200


if __name__ == "__main__":
    print("\n" + "="*70)
    print("SLIIT TIMETABLE EXTRACTION  -  DAY-BY-DAY STRATEGY")
    print("="*70)
    print(f"Model    : gpt-4o  (high-detail vision)")
    print(f"Strategy : 5 focused calls  (Mon -> Fri)")
    print(f"OpenAI   : {'CONFIGURED' if openai_client else 'NOT CONFIGURED'}")
    print(f"Endpoint : POST http://localhost:5001/process")
    print("="*70 + "\n")
    if not openai_client:
        print("Set OPENAI_API_KEY=<your-key> in your .env file\n")
    app.run(host="0.0.0.0", port=5001, debug=False)
