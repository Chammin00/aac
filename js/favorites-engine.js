/**
 * Amina AAC Studio - Smart Favorites & Adaptive Phrase Learning Engine
 * Features:
 * - Real-time word frequency and recency tracking (100% local & private)
 * - Whole-phrase memory: detects frequently repeated sentences and turns them into 1-tap quick phrases
 * - Manual phrase bookmarking (Star any sentence on the message strip to pin it)
 * - Next-word bigram prediction (e.g., "I" -> "want", "like", "need", "feel")
 * - Smart seeding for emerging communicators (universal daily survival & social phrases)
 */

class SmartFavoritesEngine {
  constructor() {
    this.storageKey = "AMINA_FAVORITES_DATA_V1";
    this.data = this.loadData();
  }

  loadData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load stored favorites data:", e);
    }

    // Default Seed Data for New Communicators
    return {
      wordCounts: {
        "want": { count: 12, lastUsed: Date.now(), tile: { id: "cm_2", label: "Want", speech: "want", category: "verb", icon: "🤲" } },
        "i": { count: 11, lastUsed: Date.now(), tile: { id: "cm_1", label: "I / Me", speech: "I", category: "people", icon: "👤" } },
        "help": { count: 9, lastUsed: Date.now(), tile: { id: "cm_14", label: "Help", speech: "help", category: "verb", icon: "🆘" } },
        "more": { count: 8, lastUsed: Date.now(), tile: { id: "cm_16", label: "More", speech: "more", category: "adjective", icon: "➕" } },
        "yes": { count: 8, lastUsed: Date.now(), tile: { id: "cm_35", label: "Yes", speech: "yes", category: "social", icon: "✅" } },
        "no": { count: 7, lastUsed: Date.now(), tile: { id: "cm_36", label: "No", speech: "no", category: "social", icon: "❌" } },
        "water": { count: 6, lastUsed: Date.now(), tile: { id: "fd_1", label: "Water", speech: "water", category: "noun", icon: "💧" } },
        "play": { count: 5, lastUsed: Date.now(), tile: { id: "cm_21", label: "Play", speech: "play", category: "verb", icon: "🎮" } }
      },
      phraseCounts: {},
      pinnedPhrases: [
        {
          id: "pin_1",
          text: "I want water please",
          icon: "💧",
          category: "noun",
          count: 5,
          chips: [
            { label: "I", speech: "I", icon: "👤", category: "people" },
            { label: "WANT", speech: "want", icon: "🤲", category: "verb" },
            { label: "WATER", speech: "water", icon: "💧", category: "noun" },
            { label: "PLEASE", speech: "please", icon: "🙏", category: "social" }
          ]
        },
        {
          id: "pin_2",
          text: "I need help please",
          icon: "🆘",
          category: "social",
          count: 4,
          chips: [
            { label: "I", speech: "I", icon: "👤", category: "people" },
            { label: "HELP", speech: "help", icon: "🆘", category: "verb" },
            { label: "PLEASE", speech: "please", icon: "🙏", category: "social" }
          ]
        },
        {
          id: "pin_3",
          text: "Can I play please?",
          icon: "🎮",
          category: "verb",
          count: 4,
          chips: [
            { label: "PLAY", speech: "play", icon: "🎮", category: "verb" },
            { label: "PLEASE", speech: "please", icon: "🙏", category: "social" }
          ]
        },
        {
          id: "pin_4",
          text: "I feel happy",
          icon: "😄",
          category: "adjective",
          count: 3,
          chips: [
            { label: "I", speech: "I", icon: "👤", category: "people" },
            { label: "HAPPY", speech: "I feel happy", icon: "😄", category: "adjective" }
          ]
        },
        {
          id: "pin_5",
          text: "I am all done thank you",
          icon: "🏁",
          category: "social",
          count: 3,
          chips: [
            { label: "ALL DONE", speech: "all done", icon: "🏁", category: "adjective" },
            { label: "THANK YOU", speech: "thank you", icon: "💖", category: "social" }
          ]
        }
      ],
      totalWordsSpoken: 66,
      totalPhrasesSpoken: 19
    };
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Error saving favorites data:", e);
    }
  }

  /**
   * Record every single tile tap
   */
  recordWordUsage(tile) {
    if (!tile || !tile.label) return;
    const key = (tile.speech || tile.label).toLowerCase().trim();

    if (!this.data.wordCounts[key]) {
      this.data.wordCounts[key] = {
        count: 0,
        lastUsed: Date.now(),
        tile: {
          id: tile.id,
          label: tile.label,
          speech: tile.speech || tile.label,
          category: tile.category || "misc",
          icon: tile.icon || "💬"
        }
      };
    }

    this.data.wordCounts[key].count += 1;
    this.data.wordCounts[key].lastUsed = Date.now();
    this.data.totalWordsSpoken = (this.data.totalWordsSpoken || 0) + 1;
    this.saveData();
  }

  /**
   * Record multi-word sentence usage upon "SPEAK"
   */
  recordSentenceUsage(chips) {
    if (!chips || chips.length === 0) return;
    const fullText = chips.map(c => c.speech).join(" ").trim();
    if (chips.length < 2) return; // single words already counted in recordWordUsage

    const key = fullText.toLowerCase();
    if (!this.data.phraseCounts[key]) {
      this.data.phraseCounts[key] = {
        count: 0,
        lastUsed: Date.now(),
        text: fullText,
        icon: chips[chips.length - 1].icon || "💬",
        category: chips[chips.length - 1].category || "social",
        chips: JSON.parse(JSON.stringify(chips))
      };
    }

    this.data.phraseCounts[key].count += 1;
    this.data.phraseCounts[key].lastUsed = Date.now();
    this.data.totalPhrasesSpoken = (this.data.totalPhrasesSpoken || 0) + 1;

    // Auto-promote to pinned favorites if spoken 3 or more times!
    if (this.data.phraseCounts[key].count >= 3) {
      this.promoteToFavoritePhrase(this.data.phraseCounts[key]);
    }

    this.saveData();
  }

  /**
   * Star / Pin custom sentence from message strip
   */
  pinSentence(chips, customLabel = null) {
    if (!chips || chips.length === 0) return null;
    const fullText = chips.map(c => c.speech).join(" ").trim();

    // Avoid duplicate pins
    const existing = this.data.pinnedPhrases.find(p => p.text.toLowerCase() === fullText.toLowerCase());
    if (existing) {
      existing.count += 2;
      this.saveData();
      return existing;
    }

    const newPinned = {
      id: "pin_" + Date.now(),
      text: fullText,
      label: customLabel || fullText,
      icon: chips[chips.length - 1].icon || "⭐",
      category: chips[chips.length - 1].category || "social",
      count: 5,
      chips: JSON.parse(JSON.stringify(chips))
    };

    this.data.pinnedPhrases.unshift(newPinned);
    // Keep max 20 pinned phrases
    if (this.data.pinnedPhrases.length > 20) {
      this.data.pinnedPhrases.pop();
    }

    this.saveData();
    return newPinned;
  }

  promoteToFavoritePhrase(phraseObj) {
    const exists = this.data.pinnedPhrases.some(p => p.text.toLowerCase() === phraseObj.text.toLowerCase());
    if (!exists) {
      this.data.pinnedPhrases.unshift({
        id: "learned_" + Date.now(),
        text: phraseObj.text,
        label: phraseObj.text,
        icon: phraseObj.icon || "💬",
        category: phraseObj.category || "social",
        count: phraseObj.count,
        chips: phraseObj.chips
      });
      if (this.data.pinnedPhrases.length > 20) {
        this.data.pinnedPhrases.pop();
      }
    }
  }

  unpinSentence(id) {
    this.data.pinnedPhrases = this.data.pinnedPhrases.filter(p => p.id !== id);
    this.saveData();
  }

  /**
   * Return top learned words sorted by frequency & recency
   */
  getTopWords(limit = 8) {
    return Object.values(this.data.wordCounts)
      .sort((a, b) => b.count - a.count || b.lastUsed - a.lastUsed)
      .slice(0, limit)
      .map(item => item.tile);
  }

  /**
   * Return top learned phrases & pinned favorites
   */
  getTopPhrases(limit = 8) {
    return this.data.pinnedPhrases.slice(0, limit);
  }

  /**
   * Next-word bigram predictor:
   * Suggests the user's most probable next word based on previous choice
   */
  getNextWordPredictions(lastWord) {
    if (!lastWord) return [];
    const clean = lastWord.toLowerCase().trim();

    const bigramMap = {
      "i": ["want", "like", "feel", "see", "need", "go"],
      "want": ["more", "water", "eat", "play", "help", "bathroom"],
      "like": ["play", "music", "book", "good", "outside"],
      "feel": ["happy", "sad", "tired", "hungry", "excited"],
      "see": ["cat", "dog", "car", "bird", "friend"],
      "go": ["outside", "home", "park", "school", "bathroom"],
      "more": ["please", "food", "water", "play", "time"]
    };

    const suggestions = bigramMap[clean] || [];
    return suggestions.map(wordKey => {
      if (this.data.wordCounts[wordKey]) {
        return this.data.wordCounts[wordKey].tile;
      }
      return { id: "pred_" + wordKey, label: wordKey.toUpperCase(), speech: wordKey, category: "misc", icon: "✨" };
    });
  }

  getUsageStats() {
    const topWord = Object.values(this.data.wordCounts).sort((a, b) => b.count - a.count)[0];
    return {
      totalWords: this.data.totalWordsSpoken || 0,
      totalPhrases: this.data.totalPhrasesSpoken || 0,
      favoriteWord: topWord ? `${topWord.tile.label} (${topWord.count} times)` : "None yet",
      pinnedCount: this.data.pinnedPhrases.length
    };
  }

  resetAllData() {
    localStorage.removeItem(this.storageKey);
    this.data = this.loadData();
  }
}

window.smartFavorites = new SmartFavoritesEngine();
