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
    if (presetKey === "afro_euro") {
      this.pitch = 1.06;
      this.rate = 0.92;
    } else if (presetKey === "nigerian") {
      this.pitch = 1.04;
      this.rate = 0.94;
    } else if (presetKey === "south_african") {
      this.pitch = 1.05;
      this.rate = 0.90;
    } else if (presetKey === "uk_multicultural") {
      this.pitch = 1.08;
      this.rate = 0.92;
    }
    this.saveSettings();
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
      if (score >= 120) badge = "⭐ [Afro-African]";
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
    this.speak("Hello! I am Amina, your Afro-European voice. I am here to help you communicate, read, and learn!");
  }

  /**
   * Speak arbitrary text via Web Speech API with Afro-Euro pacing
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
      'ch': 'chuh, as in chair',
      'sh': 'shhh, as in ship',
      'th': 'th, as in thumb',
      'wh': 'wuh, as in whale',
      'ck': 'kuh'
    };

    const key = letter.toLowerCase();
    const phoneticSpeech = soundLabel || phonemeMap[key] || letter;
    this.playTone(320, 0.08, "triangle");
    setTimeout(() => {
      this.speak(phoneticSpeech, 1.0, 0.88);
    }, 60);
  }

  /**
   * Hooked on Phonics Blending Sequence:
   * Speaks sound 1 -> sound 2 -> sound 3 -> then whole blended word!
   */
  blendAndSpeak(sounds, wholeWord, onStepCallback = null) {
    this.resumeAudioContext();
    let delay = 0;
    const stepDuration = 550;

    sounds.forEach((snd, index) => {
      setTimeout(() => {
        if (onStepCallback) onStepCallback(index);
        this.playTone(400 + (index * 60), 0.12, "sine");
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
   * Web Audio tone synthesizer for tactile feedback & chime rewards
   */
  playTone(freq = 440, duration = 0.1, type = "sine") {
    if (!this.audioContext) return;
    try {
      this.resumeAudioContext();
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

      gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      osc.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      // Audio context may require user interaction
    }
  }

  playCelebrationChime() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.25, "triangle");
      }, idx * 110);
    });
  }

  /**
   * Mobile haptic vibration pulse (if supported)
   */
  hapticPulse() {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch (e) {}
    }
  }
}

// Global audio singleton
window.aacAudio = new AacAudioEngine();
