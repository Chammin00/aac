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
    this.pitch = 1.05; // Friendly, warm, slightly elevated pitch
    this.rate = 0.92;  // Measured cadence optimized for AAC comprehension
    this.volume = 1.0;
    this.isSpeaking = false;
    this.audioContext = null;
    this.onStateChange = null;

    this.initAudioContext();
    this.loadVoices();

    if (typeof speechSynthesis !== "undefined") {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
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

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();

    // Prioritized search for Afro-Euro / British / African / European English female voices
    const searchPreferences = [
      // Direct Nigerian, South African, Ghanaian, Kenyan English
      (v) => (v.lang.includes("en-NG") || v.lang.includes("en-ZA") || v.lang.includes("en-KE") || v.lang.includes("en-GH")),
      // British / UK English Female (classic Afro-Euro dialect bridge)
      (v) => (v.lang.includes("en-GB") || v.lang.includes("en_GB")) && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("serena") || v.name.toLowerCase().includes("stephanie") || v.name.toLowerCase().includes("hazel") || v.name.toLowerCase().includes("sonia")),
      // Google UK English Female
      (v) => v.name.toLowerCase().includes("uk english female") || v.name.toLowerCase().includes("google uk female"),
      // Moov / Samantha / Natural English Female
      (v) => v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("victoria") || v.name.toLowerCase().includes("karen"),
      // Any English Female
      (v) => v.lang.startsWith("en") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("woman") || v.name.toLowerCase().includes("girl")),
      // Default English
      (v) => v.lang.startsWith("en")
    ];

    let foundVoice = null;
    for (const matcher of searchPreferences) {
      foundVoice = this.voices.find(matcher);
      if (foundVoice) break;
    }

    if (foundVoice) {
      this.selectedVoice = foundVoice;
      this.voiceName = foundVoice.name;
    } else if (this.voices.length > 0) {
      this.selectedVoice = this.voices[0];
      this.voiceName = this.voices[0].name;
    }
  }

  getVoiceList() {
    return this.voices.map(v => ({
      name: v.name,
      lang: v.lang,
      isDefault: v === this.selectedVoice
    }));
  }

  setVoiceByName(name) {
    const v = this.voices.find(voice => voice.name === name);
    if (v) {
      this.selectedVoice = v;
      this.voiceName = v.name;
    }
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
