/**
 * Read This For Me - Gaming Dialogue Translator & Karaoke Narration Engine
 * Features:
 * - Free Multi-language translation (Japanese, Spanish, French, German, Korean, etc.)
 * - Dyslexia & RPG Dialogue Simplifier (condenses verbose quest lore into clean objectives)
 * - Karaoke Word-by-Word Web Speech API Narration
 */

class GameTranslatorEngine {
  constructor() {
    this.sourceLang = "auto";
    this.targetLang = "en";
    this.synth = window.speechSynthesis;
    this.speechRate = 0.95;
    this.speechPitch = 1.05;
    this.isSpeaking = false;
    this.activeUtterance = null;
    this.onWordSpoken = null; // Callback for word highlighting
  }

  /**
   * Translate text using free translation endpoint or offline dictionary
   */
  async translate(text, sourceLang = "autodetect", targetLang = "en") {
    const cleanText = text.trim();
    if (!cleanText) return { translatedText: "", detectedSource: targetLang };

    // If source and target are the same, return as is
    if (sourceLang === targetLang && sourceLang !== "autodetect") {
      return { translatedText: cleanText, detectedSource: targetLang };
    }

    try {
      const srcParam = sourceLang === "autodetect" ? "en" : sourceLang;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText.slice(0, 500))}&langpair=${srcParam}|${targetLang}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.responseData && data.responseData.translatedText) {
          return {
            translatedText: data.responseData.translatedText,
            detectedSource: sourceLang
          };
        }
      }
    } catch (e) {
      console.warn("Translation API notice:", e);
    }

    // Client-side fallback dictionary for common gaming dialogue phrases
    return {
      translatedText: this.fallbackGamingTranslation(cleanText, targetLang),
      detectedSource: sourceLang
    };
  }

  fallbackGamingTranslation(text, targetLang) {
    // Quick phrase replacements
    let result = text;
    const dictionary = {
      "クエスト": "Quest",
      "始める": "Start",
      "完了": "Complete",
      "攻撃": "Attack",
      "防御": "Defense",
      "魔法": "Magic",
      "アイテム": "Item",
      "話す": "Talk",
      "Misión": "Quest",
      "Atacar": "Attack",
      "Hablar": "Talk",
      "Épée": "Sword",
      "Quête": "Quest"
    };

    for (const [k, v] of Object.entries(dictionary)) {
      result = result.replace(new RegExp(k, "g"), v);
    }
    return result;
  }

  /**
   * Dyslexia & Fast Lore Simplifier:
   * Strips convoluted fantasy filler to highlight core action/direction
   */
  simplifyDialogue(text) {
    if (!text) return "";
    let clean = text.replace(/[\r\n]+/g, " ");

    // Extract potential quest directives
    const hasQuestAction = /(seek|find|go to|defeat|collect|speak with|talk to|head|return|bring|travel to)/i.test(clean);

    let summary = clean;
    if (clean.length > 120) {
      const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length > 1) {
        summary = sentences.slice(0, 2).join(". ") + ".";
      }
    }

    let objective = "";
    const match = clean.match(/(?:seek|find|go to|defeat|collect|speak with|talk to|head to|return to)\s+([^.,;]+)/i);
    if (match) {
      objective = `🎯 Quest Goal: ${match[0].trim()}`;
    }

    return {
      simplified: summary,
      objective: objective
    };
  }

  /**
   * Speak text with real-time word-by-word karaoke tracking
   */
  speakWithKaraoke(text, containerEl, onFinish = null) {
    if (!this.synth) return;
    this.stopSpeaking();

    const cleanText = text.trim();
    if (!cleanText) return;

    // Render words as individual spans for karaoke highlighting
    const words = cleanText.split(/(\s+)/);
    containerEl.innerHTML = "";
    const wordSpans = [];

    words.forEach((chunk) => {
      if (chunk.trim()) {
        const span = document.createElement("span");
        span.className = "karaoke-word";
        span.textContent = chunk;
        containerEl.appendChild(span);
        wordSpans.push(span);
      } else {
        containerEl.appendChild(document.createTextNode(chunk));
      }
    });

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = this.speechRate;
    utterance.pitch = this.speechPitch;

    // Try selecting our Afro-Euro narrator voice if loaded
    if (window.aacAudio && window.aacAudio.selectedVoice) {
      utterance.voice = window.aacAudio.selectedVoice;
    }

    let currentWordIdx = 0;
    utterance.onboundary = (e) => {
      if (e.name === "word") {
        wordSpans.forEach(s => s.classList.remove("speaking"));
        if (currentWordIdx < wordSpans.length) {
          wordSpans[currentWordIdx].classList.add("speaking");
          currentWordIdx++;
        }
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      wordSpans.forEach(s => s.classList.remove("speaking"));
      if (onFinish) onFinish();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      wordSpans.forEach(s => s.classList.remove("speaking"));
      if (onFinish) onFinish();
    };

    this.activeUtterance = utterance;
    this.isSpeaking = true;
    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }
}

window.gameTranslator = new GameTranslatorEngine();
