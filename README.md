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

### 1. 🗣️ Default Afro-European Female Narrator Voice ("Amina") & Voice Studio
- **Amina Voice Studio (1-Tap Header Access)**:
  - Tapping the **Amina Narrator Pill** directly in the top header or opening Settings opens the dedicated **Voice Studio** modal.
- **Authentic Voice Scoring & Male Voice Exclusion**:
  - Automatically queries available system and browser voices via `speechSynthesis`.
  - Implements an intelligent scoring algorithm that heavily penalizes male voices (e.g. David, Mark, Ryan, Google UK Male) to ensure Amina always uses a warm, expressive female voice.
  - Automatically elevates authentic Afro-European, Nigerian (`en-NG`), South African (`en-ZA`), Ghanaian (`en-GH`), Kenyan (`en-KE`), and UK/European English female profiles (*Google UK English Female*, *Microsoft Sonia / Libby Natural*, *Serena*, *Stephanie*, *Tessa*, *Hazel*).
- **Five Distinct Accent & Voice Profiles**:
  - 🖥️ **Screen Reader App Voice (System Synchronized)**: Binds directly to the operating system's default screen reader voice (`v.default` / Windows Narrator, NVDA, JAWS, VoiceOver, TalkBack) and broadcasts every tile and sentence strip activation through an invisible `aria-live="assertive"` channel so external screen reader software speaks natively!
  - 🌍 **Afro-British (Amina)** [Default]: Warm, melodic, rhythmic cadence (Pitch `1.06`, Rate `0.92`).
  - 🇳🇬 **Nigerian English (Zainab)**: Syllable-timed, lively, expressive prosody (Pitch `1.04`, Rate `0.94`).
  - 🇿🇦 **South African (Nandi)**: Crisp, articulate consonants and warm delivery (Pitch `1.05`, Rate `0.90`).
  - 🇬🇧 **UK Multicultural (Serena)**: Melodic, supportive classroom tone (Pitch `1.08`, Rate `0.92`).
- **Synchronized with "Read This For Me" Camera**:
  - The "Read This For Me" gaming camera and screen reader app (`read-for-me.html`) includes a top-bar voice toggle button (`🖥️ Screen Reader Voice` ➔ `🌍 Afro-Euro Voice`) that synchronizes preferences automatically across the entire app suite.
- **One-Tap Interactive Voice Testing**:
  - Tap **"🔊 Test Voice"** to hear Amina introduce herself.
  - Quick phrase testing buttons: *"Hello, I am Amina!"*, *"I want water please"*, *"Let's learn new words"*, and *"Read this for me"*.
- **Caregiver Platform Voice Installation Guide**:
  - Built-in guidance for downloading free, natural offline African and UK voices across Windows 10/11, Android/Chromebook, and Apple iOS/iPadOS.
- **Narrator Avatar HUD & Custom Voice Recording**:
  - Dynamic vector avatar portrait with animated lip/speaking glow states, speech bubble subtitles, and instant audio preview testing.
  - Allows parents, teachers, and speech therapists to record real, personalized voices (e.g., Mom's voice saying custom nicknames or family phrases) directly onto any tile using the `MediaRecorder` API.

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
  - `8x6`: Tablet Full / WordPower clinical density.
  - `10x6`: Tablet Wide high-density core.
  - `12x7`: Advanced Widescreen Core (84-key SGD layout).

### 5. 📱 Professional Tablet Access Suite (Clinical SGD Standard)
Engineered specifically for clinical speech-generating devices (SGDs) and consumer tablets (Apple iPad 10.2"/10.9"/Pro 12.9", Samsung Galaxy Tab S9/Active, Amazon Fire HD 10, Lenovo Tab M10):

- **Physical Keyguard Spacing & Inset Relief**:
  - **Flush / None (8px gap)**: Standard capacitive touch glass.
  - **Standard Keyguard (14px inset relief)**: Accommodates laser-cut acrylic keyguards (3mm–5mm thickness).
  - **Deep Recessed Keyguard (20px 3D Plate Relief)**: High-relief shadow-box styling for heavy-duty 3D-printed keyguards. Provides recessed cell wells so users with dyspraxia, cerebral palsy, or ataxia can rest their palm directly on the keyguard without clipping neighbouring tiles.
- **Three Multi-Touch Access Profiles**:
  1. **Touch on Contact (Immediate)**: Activates instantly upon finger or stylus touchdown.
  2. **Touch on Release (Drag & Lift)**: Essential for communicators who slide or rest their hand across the tablet screen until reaching the target button, activating only when lifted.
  3. **Hold Duration / Dwell Timer**: Requires sustained contact (100ms–1500ms) with an **animated SVG radial progress countdown ring** positioned in the upper corner of each tile, accompanied by acoustic ticks and activation chimes.
- **Anti-Tremor Repeat Lockout Delay**:
  - Configurable debounce filter (0ms–1200ms) that automatically ignores involuntary multi-taps or micro-tremors on the same tile.
- **Motor Plan Orientation Locking**:
  - Communicators memorize spatial button locations. Shifting between portrait and landscape disrupts motor memory. Amina locks layout into **Landscape** (for wheelchair and desk slant mounts) or **Portrait** (for handheld use), surfacing a visual orientation overlay if rotated inappropriately.
- **Safe-Area Inset Handling**:
  - Employs `env(safe-area-inset-*)` padding to guarantee zero overlap with iPad Dynamic Island, home swipe indicators, or Android system navigation bars.
- **Palm & Edge Rejection Filter**:
  - Filters out resting palms or edge touches (touches within 14px of screen border or touch contacts exceeding 45px diameter).
- **Fullscreen Tablet Kiosk & Clinical Lock-In Guide**:
  - Dedicated **Tablet Kiosk** mode (`F11` / Fullscreen API).
  - Built-in clinical instructions for configuring **Apple iPad Guided Access** (triple-click power button lock) and **Android App Pinning** to prevent communicators from leaving the AAC board into games, web browsers, or system settings.
- **Speech-Language Pathologist (SLP) IEP Session Data Logger & CSV Export**:
  - Automatically records chronological communication events (Timestamp, Elapsed Seconds, Board ID, Tile ID, Word Label, Category, Spoken Text, Touch Mode).
  - One-click **"⬇️ Export Session CSV"** downloads an IEP-compliant therapy data log for clinical progress tracking and insurance reimbursement documentation.

### 6. 🎮 "Read This For Me" Gaming Dialogue Camera & Screen Reader (Game Lens)
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

### 7. 🎡 Interactive Food Decision Wheels
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

### 8. 🛠️ Therapist & Educator PIN Customization
- Secure PIN-protected Edit Mode (`Default: 1234`) prevents accidental button relocation during therapy sessions.
- Edit button labels, speech pronunciations, symbols/emojis, colors, and folder targets.
- Create new category folders and custom sub-boards.

### 9. ⭐ Smart Favorites & Adaptive Word/Phrase Learning Engine
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

### 10. 📖 2,500+ Early-Childhood & Gaming Core Dictionary Engine
- Dissects and cleans raw camera OCR tokens against a curated 2,500+ word dictionary.
- Includes Levenshtein phonetic spell-correction for OCR misreads (e.g. `c4t` ➔ `cat`, `0k` ➔ `OK`).
- Real-time symbol auto-mapper associates spoken and written words with corresponding AAC icons (e.g., `dog` ➔ 🐶, `happy` ➔ 😊).

### 11. 🧸 Early Communicator & Caregiver Usability Suite (Ages 3+)
Engineered specifically to remove cognitive barriers and friction for young children, parents, teachers, and speech clinicians:
- **🔍 Symbol & Word Finder with Motor Pathway Modeling**:
  - Instant word search across all core boards and subfolders (`🔍 Find` in header).
  - Tapping any result appends it directly to the active message strip.
  - Shift-clicking navigates directly to the word's home folder and highlights the tile with a pulsing golden glow (`@keyframes searchTileFlash`), reinforcing clinical motor planning.
- **↩️ Accidental Clear Protection (Undo Clear)**:
  - For emerging communicators and individuals with motor tremors, accidentally hitting `🗑️ Clear` previously erased minutes of sentence formulation.
  - An animated `↩️ Undo` button slides in for 8 seconds after every clear, enabling 1-tap sentence restoration.
- **👶 1-Tap Quick Grid Density Switcher**:
  - The header badge (`Universal Core 36 ▾`) cycles densities directly on tap:
    - **Starter Core 12** (4 columns, extra large touch targets for toddlers)
    - **Universal Core 36** (6 columns, balanced core communication)
    - **Tablet Full 48** (8 columns, high-vocabulary communication)
- **🌟 30-Second Caregiver & Educator Walkthrough**:
  - Accessible via `❓ Help` in the header; provides 5 quick, illustrated walkthrough cards covering sentence building, undo recovery, starring favorites, phonics/wheels, and tablet keyguard setup.
- **📱 Instant Sample Flashcards Dock in "Read For Me"**:
  - Preloaded test cards (`🐱 CAT`, `🍎 APPLE`, `🚗 CAR`, `⭐ STAR`, `🥛 MILK`) allow parents and children to experience magic scanning, syllable blending, and AAC board transfer immediately—even without pointing a physical camera at text.

### 12. 📐 Dynamic Device Intelligence & Auto-Scaling Engine (`js/device-engine.js`)
Inspired by the multi-device grid matrices in open-source projects like **Cboard** (`cboard-org/cboard`), the Device Intelligence Engine continuously inspects the user's hardware and viewport geometry:
- **Automatic Form Factor Classification**:
  - `phone` (<600px width): 3–4 column grid, compact sentence bar, hides desktop mode tabs.
  - `tablet_compact` (600–840px): 4–5 column grid (iPad Mini, 7-8" Android tablets).
  - `tablet_standard` (840–1200px): 6 column universal matrix (10"–11" iPad & Galaxy Tab).
  - `tablet_large` (1200–1440px): 6–8 column matrix (iPad Pro 12.9", Surface Pro).
  - `desktop` (>1200px non-touch): 8 column widescreen master matrix.
- **Live Hardware Concurrency & Memory Tiering**:
  - Inspects `navigator.hardwareConcurrency` and `navigator.deviceMemory`.
  - Classifies device into `perf-tier-high`, `perf-tier-medium`, or `perf-tier-low`.
  - **Low-End Hardware Guardrails**: On \$50 budget school tablets or older hardware, automatically strips costly multi-stop backdrop blurs and deep box shadows to lock smooth 60fps tile responsiveness.
- **Dynamic Viewport Height Auto-Fit (`autoFitGridHeight`)**:
  - Calculates available vertical height subtracting header, sentence bar, category navigation, and footer.
  - Dynamically calculates exact tile row heights so communication boards fill 100% of the screen with zero vertical scrolling—essential for switch scanning and keyguards.
- **Live Device Status Pill in Header**:
  - Displays detected form factor (e.g. `📱 Clinical ●`, `📱 Tablet ●`, `📱 Mobile ●`) with color-coded performance indicator. Tapping the pill opens the Master Menu and hardware diagnostics.

### 13. ☰ Sorted Clinical Master Menu Screen (`#menu-screen-modal`)
To eliminate header clutter and navigation confusion on tablets and phones, the app features a dedicated full-screen Master Menu organized into 4 sorted clinical categories:
1. **🚨 Urgent & Immediate Assistance**:
   - High-contrast immediate emergency buttons: `🚻 Bathroom / Restroom`, `🆘 Need Help`, `🩹 Pain / Hurt`, `🧘 Sensory Break / Quiet`, `💧 Water / Thirsty`.
   - Single-tap vocalization with instant vocal output and automated navigation to the medical/urgent board.
2. **📂 Sorted Topic Communication Folders**:
   - Clean, alphabetical and frequency-sorted directory of core folders: *🏠 Core Master (All 36)*, *⭐ Quick Favorites*, *🚨 Urgent Needs*, *🍎 Food & Drinks*, *😊 Feelings & Emotions*, *🎮 Activities & Play*, *👨‍👩‍👦 People & Family*, *🏙️ Places & Locations*, and *👶 Starter Core (12)*.
3. **🔤 Learning, Phonics & Decision Suites**:
   - Quick launch for *🔤 Interactive Blending Board*, *🗣️ Physiological Sound Wall*, *📖 Decodable Phonics Stories*, *🍕 Food Decision Wheels*, and *📷 Read This For Me Gaming Camera*.
4. **⚙️ Clinical Tablet Tools & Hardware Inspector**:
   - Clinical utilities: *🔒 Kiosk Full-Screen Lock*, *🗣️ Amina Voice Studio*, *✏️ Custom Tile Edit Mode*, *📊 Speech-Language Pathologist CSV Analytics Export*, and *❓ 30-Second Visual Caregiver Guide*.
   - **Live Hardware Diagnostic Card**: Displays exact detected device name, live viewport dimensions, CPU concurrency count, and auto-grid density toggling.

### 10. 🎧 Mastered Organic Acoustic Foley & Harmonics Synthesizer (Anti-Audio-Slop)
- **Elimination of Raw Synthetic Beeps**:
  - Replaced all harsh mathematical square, sawtooth, and triangle oscillator chirps with organic acoustic foley and harmonic physical models synthesized entirely via the Web Audio API.
- **Mastered Foley Profiles**:
  - **Tactile Resonance (`playTap`)**: Dual-layer transient combining a 2.4kHz bandpass-filtered noise burst with a 220Hz wood/felt body formant (38ms exponential decay).
  - **Celesta Cue (`playSpeechPromptChime`)**: Two-tone acoustic celesta harmonic cue (C5 523Hz + G5 784Hz) preceding sentence speaking.
  - **Felt / Paper Wipe (`playWipeSwoosh`)**: Filtered 850Hz ➔ 450Hz bandpass noise sweep simulating a clean whiteboard / slate wipe on sentence clear.
  - **Restoration Chime (`playUndoRestoration`)**: Warm ascending 2-tone harmonic chime (F5 698Hz ➔ A5 880Hz) providing positive auditory reinforcement on sentence undo.
  - **Typewriter Foley Tick (`playBackspaceClick`)**: Mechanical foley tick (180–380Hz transient) giving discrete tactile feedback for single-character / word deletions.
  - **Celebration Pentatonic Arpeggio (`playCelebrationChime`)**: Acoustic celesta arpeggio (C5, E5, G5, A5, C6) with natural acoustic overtones for literacy achievements and gamified wins.
  - **Sensory-Soft Switch Tick (`playScanTick`)**: Ultra-soft woodblock tick (12ms) specifically designed to eliminate sensory fatigue for autistic and sensory-sensitive communicators during switch scanning.
  - **Mechanical Ratchet & Singing Bowl (`playWheelTick`, `playWheelWin`)**: Physical pawl mechanical clicks scaled to wheel velocity and resonant bronze singing bowl chimes for decision wheel spins.

### 11. 🎨 Professional UI Chrome & High-Gloss Lacquer Material Optics (Zero-Emoji-Slop)
- **Zero Emoji Asset Flips on Action Chrome**:
  - Replaced all raw default OS emojis across the top header, sentence strip action bar, category navigation tabs, and master modal menu cards with precision 24px dual-tone inline vector SVGs (`.ui-icon`).
  - Standardized on 2px stroke width, rounded caps and joins, and theme-token currentColor bindings ensuring crisp rendering across all screen densities (Retina, 4K, e-ink).
- **High-Gloss Lacquer Physical Material Optics**:
  - Beveled clear-coat highlights: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.25)` providing physical tactile depth on buttons and cards.
  - Responsive tactile depression: `:active { transform: translateY(1px) scale(0.98); }` with inset shadow compression for immediate physical confirmation on touch and mouse press.
- **Preserved Fitzgerald Key Visual Symbols**:
  - Communication vocabulary tiles retain their rich, accessible semantic symbols and images, maintaining clear distinction between navigational system chrome and communicable AAC vocabulary.

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
│   ├── device-engine.js    # Hardware concurrency, viewport auto-fit & device scaling
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
