/**
 * Amina AAC & Phonics Studio - Audio & Speech Synthesis Engine
 * Features:
 * - Afro-European female voice auto-selection & tuning
 * - Web Speech API synthesis with rate/pitch modulation
 * - Web Audio API acoustic formant sound generator for pure phonics phonemes
 * - Voice recorder (MediaRecorder) for custom tile recordings
 * - Mobile haptic feedback integration
 */

class AacAudioEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this.voiceName = "Default Afro-Euro Female";
    this.currentPreset = "afro_euro"; // afro_euro, nigerian, south_african, uk_multicultural
    this.pitch = 1.06; // Friendly, warm, slightly elevated pitch for Afro-Euro cadence
    this.rate = 0.92;  // Measured syllable-timed cadence optimized for AAC comprehension
    this.volume = 1.0;
    this.isSpeaking = false;
    this.audioContext = null;
    this.onStateChange = null;
    this.onVoicesUpdated = null;

    this.loadSavedSettings();
    this.initAudioContext();
    this.loadVoices();

    if (typeof speechSynthesis !== "undefined") {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
        if (this.onVoicesUpdated) this.onVoicesUpdated(this.selectedVoice);
      };
    }
  }

  loadSavedSettings() {
    try {
      const saved = localStorage.getItem("amina_aac_voice_settings_v1");
      if (saved) {
        const config = JSON.parse(saved);
        if (config.pitch) this.pitch = parseFloat(config.pitch);
        if (config.rate) this.rate = parseFloat(config.rate);
        if (config.preset) this.currentPreset = config.preset;
        if (config.voiceName) this.voiceName = config.voiceName;
      }
    } catch (e) {
      console.warn("Could not load voice settings from localStorage", e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem("amina_aac_voice_settings_v1", JSON.stringify({
        voiceName: this.voiceName,
        preset: this.currentPreset,
        pitch: this.pitch,
        rate: this.rate
      }));
    } catch (e) {
      console.warn("Could not save voice settings", e);
    }
  }

  setPreset(presetKey) {
    this.currentPreset = presetKey;
    if (presetKey === "screen_reader") {
      this.pitch = 1.0;
      this.rate = 1.0;
      const sysDefault = this.voices.find(v => v.default) || (this.voices.length > 0 ? this.voices[0] : null);
      if (sysDefault) {
        this.selectedVoice = sysDefault;
        this.voiceName = sysDefault.name;
      }
    } else if (presetKey === "afro_euro") {
      this.pitch = 1.06;
      this.rate = 0.92;
      this.loadVoices(); // Re-evaluate optimal Afro-Euro voice
    } else if (presetKey === "nigerian") {
      this.pitch = 1.04;
      this.rate = 0.94;
      this.loadVoices();
    } else if (presetKey === "south_african") {
      this.pitch = 1.05;
      this.rate = 0.90;
      this.loadVoices();
    } else if (presetKey === "uk_multicultural") {
      this.pitch = 1.08;
      this.rate = 0.92;
      this.loadVoices();
    }
    this.saveSettings();
  }

  /**
   * Broadcasts spoken text to operating system screen readers
   * (Windows Narrator, NVDA, JAWS, iOS VoiceOver, Android TalkBack)
   */
  announceToScreenReader(text) {
    if (typeof document === "undefined") return;
    let announcer = document.getElementById("screen-reader-live-announcer");
    if (!announcer) {
      announcer = document.createElement("div");
      announcer.id = "screen-reader-live-announcer";
      announcer.setAttribute("aria-live", "assertive");
      announcer.setAttribute("aria-atomic", "true");
      announcer.setAttribute("role", "alert");
      announcer.style.cssText = "position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0;";
      document.body.appendChild(announcer);
    }
    announcer.textContent = "";
    setTimeout(() => {
      announcer.textContent = text;
    }, 25);
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }

  /**
   * Score voices to prioritize authentic Afro-European, African, and British Commonwealth female voices
   * while strictly penalizing male voices.
   */
  scoreVoiceForAfroEuro(v) {
    const name = (v.name || "").toLowerCase();
    const lang = (v.lang || "").toLowerCase();

    // 1. Male voices get an immediate heavy penalty so they are never default for Amina
    const maleNames = ["male", "david", "mark", "george", "ryan", "guy", "james", "richard", "stefan", "paul", "daniel", "charles", "oliver", "tom"];
    if (maleNames.some(m => name.includes(m))) {
      return -1000;
    }

    let score = 0;

    // 2. Direct African English Female Voices (Nigeria, South Africa, Kenya, Ghana, etc.)
    if (lang.includes("en-ng") || lang.includes("en_ng") || name.includes("nigeria") || name.includes("ezinne") || name.includes("chiamaka") || name.includes("abeo") || name.includes("ada") || name.includes("oluwaseun")) {
      score += 150;
    }
    if (lang.includes("en-za") || lang.includes("en_za") || name.includes("south africa") || name.includes("nandi") || name.includes("ayanda") || name.includes("tessa") || name.includes("thando")) {
      score += 140;
    }
    if (lang.includes("en-ke") || lang.includes("en_ke") || name.includes("kenya") || name.includes("asilia") || name.includes("wanjiku")) {
      score += 130;
    }
    if (lang.includes("en-gh") || lang.includes("en_gh") || name.includes("ghana")) {
      score += 130;
    }

    // 3. British & Afro-European Dialect Bridge (UK / European English Female)
    // Used clinically and in literacy education as the primary dialect bridge
    if (lang.includes("en-gb") || lang.includes("en_gb") || lang.includes("en-ie")) {
      score += 80;
      if (name.includes("female") || name.includes("libby") || name.includes("sonia") || name.includes("mia") || name.includes("maisie") || name.includes("hazel") || name.includes("susan") || name.includes("serena") || name.includes("stephanie") || name.includes("martha") || name.includes("victoria") || name.includes("moira")) {
        score += 30;
      }
      if (name.includes("natural") || name.includes("online") || name.includes("neural")) {
        score += 25; // High-quality neural voices
      }
    }

    // 4. Google UK English Female
    if (name.includes("uk english female") || name.includes("google uk")) {
      score += 95;
    }

    // 5. General English Female Voices (Fallback if no regional voices are installed)
    if (lang.startsWith("en")) {
      if (name.includes("female") || name.includes("woman") || name.includes("girl") || name.includes("zira") || name.includes("jenny") || name.includes("aria") || name.includes("samantha") || name.includes("karen")) {
        score += 40;
      } else {
        score += 5;
      }
    }

    return score;
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (!this.voices || this.voices.length === 0) return;

    // If screen reader preset is active, bind directly to the OS default voice
    if (this.currentPreset === "screen_reader") {
      const sysDefault = this.voices.find(v => v.default) || (this.voices.length > 0 ? this.voices[0] : null);
      if (sysDefault) {
        this.selectedVoice = sysDefault;
        this.voiceName = sysDefault.name;
        return;
      }
    }

    // Check if user previously saved a specific voice name that exists
    if (this.voiceName && this.voiceName !== "Default Afro-Euro Female") {
      const savedVoice = this.voices.find(v => v.name === this.voiceName);
      if (savedVoice) {
        this.selectedVoice = savedVoice;
        return;
      }
    }

    // Score and rank all available voices
    const scoredVoices = this.voices.map(v => ({
      voice: v,
      score: this.scoreVoiceForAfroEuro(v)
    })).sort((a, b) => b.score - a.score);

    if (scoredVoices.length > 0 && scoredVoices[0].score > -500) {
      this.selectedVoice = scoredVoices[0].voice;
      this.voiceName = this.selectedVoice.name;
    } else if (this.voices.length > 0) {
      this.selectedVoice = this.voices[0];
      this.voiceName = this.voices[0].name;
    }
  }

  getVoiceList() {
    return this.voices.map(v => {
      const score = this.scoreVoiceForAfroEuro(v);
      const isAfroEuro = score >= 70;
      let badge = "";
      if (v.default) badge = "🖥️ [Screen Reader Default]";
      else if (score >= 120) badge = "⭐ [Afro-African]";
      else if (score >= 70) badge = "🌍 [Afro-Euro / UK]";
      else if (score > 0) badge = "[Female]";
      else badge = "[Standard]";

      return {
        name: v.name,
        lang: v.lang,
        score,
        isAfroEuro,
        badge,
        isDefault: v === this.selectedVoice
      };
    }).sort((a, b) => b.score - a.score);
  }

  setVoiceByName(name) {
    const v = this.voices.find(voice => voice.name === name);
    if (v) {
      this.selectedVoice = v;
      this.voiceName = v.name;
      this.saveSettings();
    }
  }

  speakIntro() {
    if (this.currentPreset === "screen_reader") {
      this.speak("Screen reader voice is active and synchronized.");
    } else {
      this.speak("Hello! I am Amina, your Afro-European voice. I am here to help you communicate, read, and learn!");
    }
  }

  /**
   * Speak arbitrary text via Web Speech API with Afro-Euro pacing
   * and broadcast to operating system screen readers via ARIA live region
   */
  speak(text, customPitch = null, customRate = null) {
    if (!this.synth) return;
    this.resumeAudioContext();
    this.hapticPulse();

    // Cancel current speaking if active
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    const cleanText = text.trim();
    if (!cleanText) return;

    // Broadcast to system screen reader live region
    this.announceToScreenReader(cleanText);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.pitch = customPitch !== null ? customPitch : this.pitch;
    utterance.rate = customRate !== null ? customRate : this.rate;
    utterance.volume = this.volume;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChange) this.onStateChange(true, cleanText);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false, cleanText);
    };

    utterance.onerror = (err) => {
      console.warn("Speech synthesis notice:", err);
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false, cleanText);
    };

    this.synth.speak(utterance);
  }

  /**
   * Speak a phonics letter sound with acoustic clarity
   * Converts letter names to their pure Hooked-on-Phonics sound
   */
  speakPhoneme(letter, soundLabel = null) {
    const phonemeMap = {
      'a': 'short a, ah, as in apple',
      'b': 'buh',
      'c': 'kuh',
      'd': 'duh',
      'e': 'eh, as in elephant',
      'f': 'fff',
      'g': 'guh',
      'h': 'huh',
      'i': 'ih, as in igloo',
      'j': 'juh',
      'k': 'kuh',
      'l': 'lll',
      'm': 'mmm',
      'n': 'nnn',
      'o': 'aw, as in octopus',
      'p': 'puh',
      'q': 'kwuh',
      'r': 'rrr',
      's': 'sss',
      't': 'tuh',
      'u': 'uh, as in umbrella',
      'v': 'vvv',
      'w': 'wuh',
      'x': 'ks',
      'y': 'yuh',
      'z': 'zzz',
      // Digraphs & Teams
      'ch': 'chuh, as in chair',
      'sh': 'shhh, as in ship',
      'th': 'th, as in thumb',
      'wh': 'wuh, as in whale',
      'ck': 'kuh',
      'ph': 'fff',
      'ng': 'ng, as in ring',
      // Consonant Blends
      'bl': 'bluh',
      'cl': 'cluh',
      'fl': 'fluh',
      'gl': 'gluh',
      'pl': 'pluh',
      'sl': 'sluh',
      'br': 'bruh',
      'cr': 'cruh',
      'dr': 'druh',
      'fr': 'fruh',
      'gr': 'gruh',
      'pr': 'pruh',
      'tr': 'truh',
      'st': 'stuh',
      'sp': 'spuh',
      'sk': 'skuh',
      'sm': 'smuh',
      'sn': 'snuh',
      'sw': 'swuh',
      // Vowel Teams & Magic-E
      'ai': 'ay, as in rain',
      'ay': 'ay, as in play',
      'ee': 'eee, as in tree',
      'ea': 'eee, as in leaf',
      'oa': 'oh, as in boat',
      'oo': 'ooo, as in moon',
      'ar': 'ar, as in star',
      'or': 'or, as in corn',
      'er': 'er, as in tiger',
      'ir': 'er, as in bird',
      'ur': 'er, as in turtle',
      'long a': 'ay, as in cake',
      'long i': 'eye, as in kite',
      'long o': 'oh, as in bone',
      'long u': 'you, as in cube'
    };

    const key = letter.toLowerCase();
    const phoneticSpeech = soundLabel || phonemeMap[key] || letter;
    this.playTap();
    setTimeout(() => {
      this.speak(phoneticSpeech, 1.0, 0.88);
    }, 40);
  }

  /**
   * Phonics Blending Sequence:
   * Speaks sound 1 -> sound 2 -> sound 3 -> then whole blended word!
   */
  blendAndSpeak(sounds, wholeWord, onStepCallback = null) {
    this.resumeAudioContext();
    let delay = 0;
    const stepDuration = 550;

    sounds.forEach((snd, index) => {
      setTimeout(() => {
        if (onStepCallback) onStepCallback(index);
        this.playAcousticBell(440 + (index * 80), 0.12, 0.2);
        this.speakPhoneme(snd);
      }, delay);
      delay += stepDuration;
    });

    // Whole word culmination
    setTimeout(() => {
      if (onStepCallback) onStepCallback('word');
      this.playCelebrationChime();
      this.speak(wholeWord, 1.15, 0.95);
    }, delay + 200);
  }

  /**
   * Plays a custom base64 audio recording attached to a tile
   */
  playCustomRecording(base64Data) {
    this.hapticPulse();
    const audio = new Audio(base64Data);
    audio.onplay = () => {
      this.isSpeaking = true;
      if (this.onStateChange) this.onStateChange(true, "Custom Recording");
    };
    audio.onended = () => {
      this.isSpeaking = false;
      if (this.onStateChange) this.onStateChange(false, "Custom Recording");
    };
    audio.play().catch(e => console.warn("Audio playback error:", e));
  }

  /**
   * =========================================================================
   * MASTERED ORGANIC ACOUSTIC FOLEY & HARMONICS SYNTHESIZER
   * Baseline Anti-Slop Audio Standards: Zero Canned Soundboards / No Harsh Beeps
   * =========================================================================
   */

  /**
   * Soft, satisfying acoustic key tap / mechanical tactile contact
   * Formants: 220Hz wood/felt body resonance + 2.4kHz transient snap
   */
  playTap() {
    if (!this.audioContext) return;
    try {
      this.resumeAudioContext();
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      // 1. Warm Resonant Body (Felt / Wood Key)
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = "sine";
      bodyOsc.frequency.setValueAtTime(220, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(140, now + 0.038);

      bodyGain.gain.setValueAtTime(0.12, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(ctx.destination);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.04);

      // 2. Crisp Transient Snap (Filtered click)
      const bufferSize = ctx.sampleRate * 0.012; // 12ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(2.5, now);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.06, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

      noise.connect(filter);
      filter.connect(clickGain);
      clickGain.connect(ctx.destination);

      noise.start(now);
      this.hapticPulse(12);
    } catch (e) {
      // AudioContext policy fallback
    }
  }

  /**
   * Gentle dual-harmonic acoustic celesta prompt chime before phrase speaking
   * Voicing: C5 (523Hz) + G5 (784Hz) with lush natural decay
   */
  playSpeechPromptChime() {
    if (!this.audioContext) return;
    try {
      this.resumeAudioContext();
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      const frequencies = [523.25, 783.99]; // C5, G5 perfect fifth

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        // Soft attack, smooth exponential decay
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.07 / (idx + 1), now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch (e) {}
  }

  /**
   * Organic felt wipe / paper swoosh on clear
   * Filtered noise sweep: 850Hz -> 500Hz bandpass
   */
  playWipeSwoosh() {
    if (!this.audioContext) return;
    try {
      this.resumeAudioContext();
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      const duration = 0.065; // 65ms

      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(850, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + duration);
      filter.Q.setValueAtTime(1.8, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      this.hapticPulse(18);
    } catch (e) {}
  }

  /**
   * Warm ascending 2-tone restoration chime (F5 -> A5)
   */
  playUndoRestoration() {
    if (!this.audioContext) return;
    try {
      this.resumeAudioContext();
      const notes = [698.46, 880.00]; // F5, A5 major third
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playAcousticBell(freq, 0.16, 0.09);
        }, idx * 75);
      });
      this.hapticPulse(22);
    } catch (e) {}
  }

  /**
   * Tactile typewriter spring foley tick on backspace
   */
  playBackspaceClick() {
    if (!this.audioContext) return;
    try {
      this.resumeAudioContext();
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);

      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
      this.hapticPulse(10);
    } catch (e) {}
  }

  /**
   * Mastered Pentatonic Celesta Celebration Arpeggio
   * Natural acoustic overtones: C5, E5, G5, A5, C6 (Lush and non-fatiguing)
   */
  playCelebrationChime() {
    const notes = [523.25, 659.25, 783.99, 880.00, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playAcousticBell(freq, 0.28, 0.11 / (1 + idx * 0.1));
      }, idx * 70);
    });
    this.hapticPattern([15, 30, 20]);
  }

  /**
   * Ultra-soft organic woodblock tick for switch scanning
   * Eliminates sensory fatigue for autistic / sensory-sensitive communicators
   */
  playScanTick() {
    if (!this.audioContext) return;
    try {
      this.resumeAudioContext();
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.016);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {}
  }

  /**
   * Mechanical ratchet pawl click for Decision Wheels
   */
  playWheelTick(velocity = 1.0) {
    if (!this.audioContext) return;
    try {
      this.resumeAudioContext();
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const baseFreq = 540 + Math.min(300, velocity * 400);
      osc.frequency.setValueAtTime(baseFreq, now);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.016);
      this.hapticPulse(8);
    } catch (e) {}
  }

  /**
   * Resonant bronze singing bowl / victory gong when decision wheel lands
   */
  playWheelWin() {
    const bowlHarmonics = [587.33, 880.00, 1174.66]; // D5, A5, D6
    bowlHarmonics.forEach((freq, idx) => {
      this.playAcousticBell(freq, 0.65, 0.12 / (idx + 1));
    });
  }

  /**
   * Acoustic bell synthesizer with soft attack and exponential decay
   */
  playAcousticBell(freq, duration = 0.25, peakGain = 0.1) {
    if (!this.audioContext) return;
    try {
      this.resumeAudioContext();
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      // Fundamental
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);

      // Subtle 2nd harmonic for warm acoustic luster
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2, now);

      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.linearRampToValueAtTime(peakGain * 0.25, now + 0.008);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + (duration * 0.5));

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now);
      osc2.stop(now + (duration * 0.5) + 0.02);
    } catch (e) {}
  }

  /**
   * Backward-compatible tone synthesizer routing to organic acoustic tap or chime
   */
  playTone(freq = 440, duration = 0.1, type = "sine") {
    if (duration <= 0.05) {
      this.playTap();
    } else {
      this.playAcousticBell(freq, duration, 0.09);
    }
  }

  /**
   * Mobile haptic vibration pulse with custom duration
   */
  hapticPulse(durationMs = 12) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(durationMs);
      } catch (e) {}
    }
  }

  hapticPattern(patternArray = [12, 24, 16]) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(patternArray);
      } catch (e) {}
    }
  }
}

// Global audio singleton
window.aacAudio = new AacAudioEngine();
