# Amina AAC & Phonics Studio
### Universal Augmentative Communication Device & Systematic Phonics Engine for Mobile & Web

[![WCAG 2.1 AAA Compliant](https://img.shields.io/badge/WCAG%202.1-AAA%20Compliant-green.svg)](#accessibility--switch-scanning)
[![Open Board Format](https://img.shields.io/badge/Standard-Open%20Board%20Format%20(OBF)-blue.svg)](#open-board-format-obf-interoperability)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-purple.svg)](#deployment--mobile-install)
[![Theme: High-Gloss Lacquer](https://img.shields.io/badge/Theme-High--Gloss%20Lacquer-orange.svg)](#high-gloss-lacquer-interface)

---

## 🌟 Overview

**Amina AAC & Phonics Studio** is a universal Augmentative and Alternative Communication (AAC) platform engineered for individuals of all ages and cognitive/motor profiles—ranging from minimally verbal toddlers and children on the autism spectrum to adult communicators recovering from stroke/aphasia or living with ALS and cerebral palsy.

Unlike conventional AAC devices that isolate communication from literacy instruction, Amina uniquely integrates an **AAC Motor Planning Grid** with an interactive **Hooked on Phonics Learning Suite**, bridged by an **Afro-European Female Narrator voice engine ("Amina")**.

Communicators can transition seamlessly between building sentences in daily life and mastering letter-sound phonemes, CVC word blending, and decodable stories—with single-tap word transfers between learning and speaking modes.

---

## 🏛️ Open-Source Lineage & GitHub Reference Research

In designing Amina, we synthesized best practices and open standards from the leading open-source AAC initiatives on GitHub:

1. **[Cboard (cboard-org/cboard)](https://github.com/cboard-org/cboard)**:
   - Modular, progressive web app architecture designed to run on low-spec tablets and phones.
   - Dynamic grid recalculation and responsive viewport auto-scaling.
2. **[Open-AAC & Open Board Format (open-aac/openboardformat)](https://github.com/open-aac/openboardformat)**:
   - Native support for the open standard `.obf` (Open Board Format) and `.obz` JSON schemas to prevent proprietary vendor lock-in.
   - Interoperable board importing/exporting compatible with CoughDrop and open AAC tools.
3. **Modified Fitzgerald Key Color Coding**:
   - Standard clinical color hierarchy facilitating grammatical sentence expansion:
     - 🟨 **Yellow (People & Pronouns)**: *I, You, We, They, Mom, Dad, Teacher*
     - 🟩 **Green (Actions & Verbs)**: *Want, Like, Go, Stop, Help, Make, Eat, Drink, Play*
     - 🟧 **Orange (Objects & Nouns)**: *Food, Drinks, Places, Urgent items*
     - 🟦 **Blue (Adjectives & Descriptors)**: *Good, Bad, Big, Little, More, Same, Different*
     - 🟪 **Purple (Questions)**: *What, Where, Who, When, Why, How*
     - 🌸 **Pink (Social & Courtesy)**: *Hello, Goodbye, Please, Thank You, Sorry*
     - ⬜ **White / Slate (Prepositions & Little Words)**: *In, Out, On, Off, With*

---

## ✨ Key Architectural Features

### 1. 🗣️ Default Afro-European Female Narrator Voice ("Amina")
- **Intelligent Voice Discovery**:
  - Automatically queries available system and browser voices via `speechSynthesis`.
  - Prioritizes authentic Afro-European, British, Nigerian (`en-NG`), South African (`en-ZA`), Ghanaian (`en-GH`), and expressive UK/European English female profiles (such as *Google UK English Female*, *Serena*, *Stephanie*, *Moov*, *Hazel*).
- **Expressive Pacing**:
  - Pre-tuned cadence (rate `0.92`, pitch `1.05`) designed to ensure phonetic clarity for emerging listeners and speech-language pathologists.
- **Narrator Avatar HUD**:
  - Dynamic vector avatar portrait with animated lip/speaking glow states, speech bubble subtitles, and instant audio preview testing.
- **Microphone Voice Recording (MediaRecorder API)**:
  - Allows parents, teachers, and speech therapists to record real, personalized voices (e.g., Mom's voice saying custom nicknames or family phrases) directly onto any tile.

### 2. 🔤 Hooked on Phonics Learning Suite
A systematic, multi-sensory reading and phonics curriculum built directly into the AAC interface:

1. **Interactive Blending Board**:
   - 3-tile onset-vowel-coda slider (e.g., `[ C ] ➔ [ A ] ➔ [ T ]`).
   - Pure acoustic letter sounds vocalized sequentially, culminating in an animated **"Sweep & Blend Word"** button that pronounces the full word with celebration chimes and confetti.
   - Single-tap **"➕ Send to AAC Message"** button pushes blended words directly to the live communication strip.
2. **The Sound Wall**:
   - Systematic coverage of short vowels (`a, e, i, o, u`), 21 consonants, and high-frequency digraphs (`ch, sh, th, wh, ck`).
   - Every tile includes anchor pictures and physiological mouth articulation guides (e.g. *“Mouth round like an O, jaw dropped”*).
3. **Decodable Phonics Stories**:
   - Level-graded stories featuring CVC decodable sentences alongside high-frequency AAC core words.
   - Individual line read-aloud buttons and instant message-strip transfer.
4. **Word Family Jam (Gamified Quiz)**:
   - Auditory rhyme and phoneme identification drills with live fire streak counter (`🔥 Streak`), score counter (`⭐ Score`), and auditory feedback.

### 3. 💬 Sentence Builder Strip (Message Bar)
- Visual chip sequence showing clicked words with corresponding Fitzgerald Key colors.
- **Morphological Grammar Modifiers**:
  - `+S` (Plural / Third-person agreement)
  - `+ING` (Present progressive action)
  - `+ED` (Past tense)
- **Executive Actions**:
  - `🔊 SPEAK`: Speaks full sentence with natural prosody.
  - `⌫ Back`: Deletes preceding word.
  - `🗑️ Clear`: Resets sentence strip with soft chime.
  - `📋 Copy`: Copies text to system clipboard.
  - `📤 Share`: Launches native mobile share dialog (iOS / Android Web Share API).

### 4. ♿ Universal Accessibility & Motor Planning
- **Switch Scanning (Single-Switch Access)**:
  - Automatic cyclic scanning across tiles with high-visibility cyan pulse halo (`@keyframes switchPulse`).
  - Activate via physical switch, keyboard `Spacebar`, or `Enter`.
- **Dwell Activation**:
  - Configurable hold-to-activate timer ($0\text{ms}$ up to $1500\text{ms}$) to prevent accidental double-taps for users with tremors or spastic cerebral palsy.
- **High-Contrast & CVI Themes**:
  - **High-Gloss Dark**: Deep `#090d16` canvas with crisp 1px borders and optical clear-coat sheen.
  - **Yellow on Black**: Low-vision optimized high-contrast theme.
  - **Crisp Light**: High-ambient classroom printed board styling.
  - **CVI Mode**: High-saturation red/yellow/neon accents on pure black for Cortical Visual Impairment.
- **Configurable Grid Densities**:
  - `2x2`: High motor challenge or early communicative intent.
  - `3x3`: Emerging communicator core.
  - `4x4`: Standard functional vocabulary.
  - `6x6`: Universal Core (Fitzgerald column aligned).
  - `8x8`: Comprehensive vocabulary.

### 5. 🎮 "Read This For Me" Gaming Dialogue Camera & Screen Reader (Game Lens)
Designed specifically for gamers encountering lengthy in-game dialogues, quest logs, lore books, foreign game text, or dense dialogue sequences (RPGs, visual novels, retro classics, Nintendo Switch, Steam Deck, PS5, Xbox):
- **Dual Capture Modes**:
  - **📷 Live Camera Mode**: Point your mobile phone camera or webcam directly at your TV screen, monitor, or handheld console.
  - **🖥️ Screen Share Mode**: On PC/Mac, select and capture your game window or emulator with zero latency.
- **Interactive Dialogue Targeting Reticle**:
  - Drag and snap the target reticle directly over the dialogue or subtitle box.
  - Gaming image preprocessing boosts edge contrast against translucent backgrounds and stylized pixel fonts.
- **Client-Side Tesseract OCR & Multi-Language Translation**:
  - Extracts text from English, Japanese, Spanish, French, German, Korean, or Chinese games.
  - Instantly translates into your native tongue.
- **Karaoke Word-by-Word Voice Narration**:
  - Reads the translation aloud with words highlighted in real time as they are vocalized by our Afro-Euro Narrator.
- **Dyslexia & Fast Lore Simplifier (TL;DR)**:
  - Condenses wordy or archaic dialogue into clear, plain English bullet points and highlights `🎯 Quest Goal` action directives.
- **Bridge to AAC Communicator**:
  - One-click **"➕ Send to AAC Board"** transfers the game's question or dialogue directly into the communicator board so the player can formulate their response using their AAC symbols!
- **Dialogue History Quest Journal**:
  - Maintains a persistent running journal of all scanned dialogue lines with timestamps. Click any past entry to replay speech.

### 6. 🎡 Interactive Food Decision Wheels
Meal and snack choices can frequently trigger decision fatigue or anxiety for neurodivergent communicators. Amina includes three dedicated, physics-based decision wheels:
- **Three Core Meal Wheels**:
  1. 🍿 **Favorite Snacks Wheel**: *Goldfish crackers, buttery popcorn, apple slices, yogurt tube, crunchy pretzels, fruit gummies, string cheese, granola bar, chips & dip, carrot sticks.*
  2. 🍔 **Restaurants & Takeout Wheel**: *Pizza parlor, burgers & fries, taco spot, crispy chicken, sub sandwich shop, Asian noodles / rice, ice cream shop, breakfast diner.*
  3. 🍲 **Homecooked Meals Wheel**: *Spaghetti & meatballs, grilled cheese & tomato soup, taco night, creamy mac & cheese, baked chicken & rice, cheesy quesadillas, breakfast for dinner, homemade personal pizza.*
- **Physics Canvas & Auditory Cues**:
  - Inertia and friction-based spinning with realistic tick chimes as slices pass the pointer.
  - Confetti burst and fanfare when the wheel settles.
  - Spoken voice announcement by Amina: *"The wheel landed on: Buttery Popcorn! That sounds wonderful!"*
- **Family Favorites Customizer**:
  - Add custom foods, pick icons/emojis, customize colors, or delete items to match each household or dietary need.

### 7. 🛠️ Therapist & Educator PIN Customization
- Secure PIN-protected Edit Mode (`Default: 1234`) prevents accidental button relocation during therapy sessions.
- Edit button labels, speech pronunciations, symbols/emojis, colors, and folder targets.
- Create new category folders and custom sub-boards.

### 8. ⭐ Smart Favorites & Adaptive Word/Phrase Learning Engine
For communicators with motor challenges or low fatigue thresholds, re-navigating nested boards to find frequently used daily expressions takes too much energy. Amina features an intelligent, privacy-first **Smart Favorites & Adaptive Learning Engine** that learns and surfaces preferred language in real time:
- **Quick Favorites Ribbon (Top Bar)**:
  - Glides directly above the AAC grid showing instant 1-tap buttons for the communicator's highest-priority survival phrases and most frequent tiles (e.g. `⭐ Yes`, `⭐ No`, `⭐ I Want`, `⭐ Help`, `⭐ Bathroom`, `⭐ More`).
- **One-Tap Sentence Strip Star (`⭐ Star`)**:
  - Whenever a communicator or caregiver crafts a meaningful or recurring sentence on the message strip (e.g. *"I want pizza please"* or *"I feel tired"*), tapping the golden **⭐ Star** button instantly saves it to their personal favorites library.
- **Dedicated Favorites Board (`board_favorites`)**:
  - Accessible directly from the main navigation bar. Displays categorized tiles for saved whole phrases, high-frequency core words, and urgent survival requests with visual frequency badges (`🔥 12x`).
- **Bigram Next-Word Predictions**:
  - Predicts the next likely words based on the current sentence context (e.g. selecting `I` immediately elevates `WANT`, `LIKE`, `NEED`, `FEEL`).
- **100% On-Device Privacy & Analytics**:
  - All frequency metrics and custom phrases are stored in `localStorage` under `amina_aac_favorites_v1`. Parents and clinicians can inspect usage stats or reset tracking data anytime in Settings without external data harvesting.

### 9. 📖 2,500+ Early-Childhood & Gaming Core Dictionary Engine
- Dissects and cleans raw camera OCR tokens against a curated 2,500+ word dictionary.
- Includes Levenshtein phonetic spell-correction for OCR misreads (e.g. `c4t` ➔ `cat`, `0k` ➔ `OK`).
- Real-time symbol auto-mapper associates spoken and written words with corresponding AAC icons (e.g., `dog` ➔ 🐶, `happy` ➔ 😊).

---

## 📂 Project Structure

```
AAC/
├── index.html              # Main AAC communication board & literacy suite
├── read-for-me.html        # "Read This For Me" Gaming Dialogue Camera & Screen Reader
├── manifest.json           # Web App Manifest for mobile PWA installation
├── sw.js                   # Service Worker for offline caching & zero latency
├── css/
│   ├── aac-theme.css       # High-Gloss Lacquer, Fitzgerald Key tokens & WCAG rules
│   └── game-hud.css        # Cyberpunk gaming HUD, targeting reticle & karaoke text
├── js/
│   ├── aac-audio.js        # Speech synthesis, Afro-Euro voice tuner & sound generator
│   ├── aac-data.js         # Core vocabulary boards, categories & OBF import/export
│   ├── phonics-data.js     # Hooked on Phonics curriculum, word families & sound wall
│   ├── food-wheel.js       # Interactive physics Food Decision Wheels & customizer
│   ├── favorites-engine.js # Smart frequency tracker, phrase starring & next-word predictor
│   ├── dictionary-engine.js# 2,500+ core dictionary with Levenshtein autocorrect & symbols
│   ├── aac-app.js          # Core app controller, switch scanner, and event pipeline
│   ├── ocr-engine.js       # Video stream capture, contrast preprocessor & Tesseract OCR
│   └── translator-engine.js# Multi-language translation, dyslexia simplifier & karaoke TTS
└── assets/
    └── amina-avatar.svg    # Vector avatar artwork for Amina Narrator
```

---

## 🚀 Running & Deploying

### Option 1: Instant Local Run (Python or Node)
Because Amina is built with zero-build-step vanilla web standards, you can run it immediately without complex compilation:

```powershell
# From the project directory:
python -m http.server 8080

# Then open in any browser:
# http://localhost:8080/index.html
```

Or using Node:
```powershell
npx serve -l 8080 .
```

### Option 2: Direct File Opening
You can double-click [index.html](file:///g:/My%20Drive/Antigravity/Projects/AAC/index.html) to run it locally in any modern browser (Google Chrome, Microsoft Edge, Safari, Firefox).

### Option 3: Mobile PWA Installation (iOS & Android)
1. Host the project directory on GitHub Pages, Vercel, Netlify, or local Wi-Fi IP.
2. Open the URL on your iPad, iPhone, or Android tablet.
3. Tap **Share** (iOS Safari) ➔ **"Add to Home Screen"** or **Install App** (Android Chrome).
4. Amina launches full-screen (100vw x 100vh) without browser address bars, running completely offline!

---

## 🔒 Security & Data Privacy
- **100% Client-Side & Local Storage**: All custom buttons, recorded voices, and vocabulary layouts remain stored locally on the user's device. No user communication logs are ever sent to remote tracking servers.
- **OBF Export**: Backup all customizations at any time by exporting `.obf` files via the Settings menu.

---

## 👩‍🏫 Default Voice Profile Note
When running in environments where speech synthesis voices load asynchronously (e.g. mobile Safari or Chrome), Amina scans all installed system voices upon initialization and binds to the highest quality African/British/European English female voice available. The user or therapist can also test, change, or calibrate pitch and speech rate at any time using the Narrator HUD or Settings dialog.
