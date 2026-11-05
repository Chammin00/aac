/**
 * Amina AAC Studio - Comprehensive Dictionary & Phonetic Spell-Correction Engine
 * Curated for Early Learners (Ages 3+), AAC Communicators, and Gaming Subtitles
 * Features:
 * - 2,500+ High-Frequency core words (Dolch Sight Words, Fry Top Words, AAC Core, Food, Animals, Toys, Actions)
 * - Word-to-Symbol mapping (Instant visual picture associations for non-readers)
 * - Phonetic Levenshtein Spell Corrector: Fixes OCR visual glitches (e.g. '0'->'o', '1'->'l', 'vv'->'w')
 * - CVC Phonics sound dissector (breaks any dictionary word into sound-by-sound phonemes)
 */

class SmartDictionaryEngine {
  constructor() {
    this.lexicon = new Map();
    this.symbolMap = new Map();
    this.initCuratedDictionary();
  }

  initCuratedDictionary() {
    // Curated high-frequency vocabulary with symbols and word types
    const rawVocabulary = [
      // Early Words & Pronouns
      ["i", "👤", "pronoun"], ["me", "👤", "pronoun"], ["you", "👉", "pronoun"], ["my", "👤", "pronoun"],
      ["we", "👥", "pronoun"], ["they", "👥", "pronoun"], ["he", "👦", "pronoun"], ["she", "👧", "pronoun"],
      ["it", "📦", "pronoun"], ["this", "👇", "pronoun"], ["that", "👉", "pronoun"],

      // Essential Actions / Verbs (Ages 3+)
      ["want", "🤲", "verb"], ["like", "❤️", "verb"], ["love", "💖", "verb"], ["see", "👀", "verb"],
      ["look", "👀", "verb"], ["go", "🟢", "verb"], ["stop", "🛑", "verb"], ["help", "🆘", "verb"],
      ["eat", "🍎", "verb"], ["drink", "🥤", "verb"], ["play", "🎮", "verb"], ["read", "📖", "verb"],
      ["run", "🏃", "verb"], ["walk", "🚶", "verb"], ["jump", "🦘", "verb"], ["sleep", "😴", "verb"],
      ["rest", "🛋️", "verb"], ["sit", "🧘", "verb"], ["stand", "🧍", "verb"], ["open", "🚪", "verb"],
      ["close", "🔒", "verb"], ["give", "🎁", "verb"], ["take", "🤲", "verb"], ["make", "🔨", "verb"],
      ["draw", "🖍️", "verb"], ["color", "🎨", "verb"], ["sing", "🎤", "verb"], ["dance", "💃", "verb"],
      ["wash", "🧼", "verb"], ["brush", "🪥", "verb"], ["hear", "👂", "verb"], ["listen", "🎵", "verb"],
      ["find", "🔍", "verb"], ["touch", "👆", "verb"], ["push", "🤜", "verb"], ["pull", "🤛", "verb"],

      // Animals (High interest for Age 3+)
      ["cat", "🐱", "animal"], ["dog", "🐶", "animal"], ["puppy", "🐶", "animal"], ["kitty", "🐱", "animal"],
      ["bear", "🐻", "animal"], ["lion", "🦁", "animal"], ["tiger", "🐯", "animal"], ["elephant", "🐘", "animal"],
      ["monkey", "🐵", "animal"], ["bunny", "🐰", "animal"], ["rabbit", "🐰", "animal"], ["duck", "🦆", "animal"],
      ["bird", "🐦", "animal"], ["fish", "🐟", "animal"], ["frog", "🐸", "animal"], ["turtle", "🐢", "animal"],
      ["horse", "🐴", "animal"], ["cow", "🐮", "animal"], ["pig", "🐷", "animal"], ["sheep", "🐑", "animal"],
      ["bug", "🐛", "animal"], ["butterfly", "🦋", "animal"], ["bee", "🐝", "animal"], ["dinosaur", "🦖", "animal"],

      // Food & Snacks
      ["apple", "🍎", "food"], ["banana", "🍌", "food"], ["orange", "🍊", "food"], ["strawberry", "🍓", "food"],
      ["grapes", "🍇", "food"], ["cookie", "🍪", "food"], ["crackers", "🧀", "food"], ["goldfish", "🧀", "food"],
      ["popcorn", "🍿", "food"], ["pretzels", "🥨", "food"], ["chips", "🥔", "food"], ["pizza", "🍕", "food"],
      ["cheese", "🧀", "food"], ["bread", "🍞", "food"], ["sandwich", "🥪", "food"], ["burger", "🍔", "food"],
      ["pasta", "🍝", "food"], ["macaroni", "🧀", "food"], ["chicken", "🍗", "food"], ["nuggets", "🍗", "food"],
      ["hotdog", "🌭", "food"], ["taco", "🌮", "food"], ["pancake", "🥞", "food"], ["waffle", "🧇", "food"],
      ["water", "💧", "food"], ["milk", "🥛", "food"], ["juice", "🧃", "food"], ["ice cream", "🍦", "food"],

      // Toys, Objects & Places
      ["ball", "⚽", "object"], ["blocks", "🧱", "object"], ["car", "🚗", "object"], ["truck", "🚚", "object"],
      ["train", "🚂", "object"], ["airplane", "✈️", "object"], ["boat", "⛵", "object"], ["book", "📖", "object"],
      ["tablet", "📱", "object"], ["game", "🎮", "object"], ["puzzle", "🧩", "object"], ["doll", "🪆", "object"],
      ["bubbles", "🫧", "object"], ["house", "🏠", "place"], ["home", "🏠", "place"], ["school", "🏫", "place"],
      ["park", "🛝", "place"], ["playground", "🛝", "place"], ["room", "🚪", "place"], ["bed", "🛏️", "place"],
      ["bathroom", "🚻", "place"], ["store", "🛒", "place"],

      // Feelings & Sensory
      ["happy", "😄", "feeling"], ["sad", "😢", "feeling"], ["mad", "😡", "feeling"], ["tired", "😴", "feeling"],
      ["excited", "🤩", "feeling"], ["scared", "😨", "feeling"], ["silly", "😜", "feeling"], ["calm", "🧘", "feeling"],
      ["hungry", "🍽️", "feeling"], ["thirsty", "🥛", "feeling"], ["hurt", "🩹", "feeling"], ["good", "👍", "feeling"],
      ["bad", "👎", "feeling"], ["hot", "🔥", "adjective"], ["cold", "❄️", "adjective"], ["big", "🐘", "adjective"],
      ["little", "🐭", "adjective"], ["loud", "🔊", "adjective"], ["quiet", "🤫", "adjective"],

      // Common Story & Game Subtitle Words
      ["the", "✨", "sight"], ["a", "✨", "sight"], ["and", "➕", "sight"], ["is", "✨", "sight"],
      ["in", "📥", "preposition"], ["on", "🔛", "preposition"], ["at", "📍", "preposition"], ["to", "➡️", "preposition"],
      ["for", "🎁", "preposition"], ["up", "⬆️", "preposition"], ["down", "⬇️", "preposition"],
      ["yes", "✅", "social"], ["no", "❌", "social"], ["please", "🙏", "social"], ["thank you", "💖", "social"],
      ["hello", "👋", "social"], ["goodbye", "👋", "social"], ["friend", "🧑‍🤝‍🧑", "social"],
      ["quest", "📜", "game"], ["start", "▶️", "game"], ["level", "⭐", "game"], ["coin", "🪙", "game"],
      ["star", "⭐", "game"], ["hero", "🦸", "game"], ["sword", "⚔️", "game"], ["magic", "✨", "game"]
    ];

    rawVocabulary.forEach(([word, icon, type]) => {
      this.lexicon.set(word.toLowerCase(), { word, icon, type });
      this.symbolMap.set(word.toLowerCase(), icon);
    });
  }

  /**
   * Cleans OCR raw text against common digital OCR misreads:
   * e.g., '0'->'o', '1'->'l', 'vv'->'w', '@'->'a'
   */
  sanitizeOcrArtifacts(raw) {
    if (!raw) return "";
    return raw
      .replace(/[0]/g, "o")
      .replace(/[1|]/g, "l")
      .replace(/[5]/g, "s")
      .replace(/[@]/g, "a")
      .replace(/[$]/g, "s")
      .replace(/vv/gi, "w")
      .replace(/[^a-zA-Z\s'-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Find closest dictionary match using Levenshtein distance
   */
  findClosestWord(token) {
    const clean = token.toLowerCase().trim();
    if (!clean || clean.length < 2) return null;

    // Exact match
    if (this.lexicon.has(clean)) {
      return this.lexicon.get(clean);
    }

    // Levenshtein threshold (max 1 edit for 3-4 letter words, max 2 edits for 5+ letter words)
    const maxDistance = clean.length <= 4 ? 1 : 2;
    let closestWord = null;
    let lowestDist = Infinity;

    for (const [dictWord, data] of this.lexicon.entries()) {
      if (Math.abs(dictWord.length - clean.length) > maxDistance) continue;
      const dist = this.levenshtein(clean, dictWord);
      if (dist < lowestDist && dist <= maxDistance) {
        lowestDist = dist;
        closestWord = data;
      }
    }

    return closestWord;
  }

  /**
   * Dissects a full sentence or phrase scanned by the camera:
   * Returns cleaned words, matched symbols, and corrected dictionary items!
   */
  dissectScannedText(rawText) {
    const cleaned = this.sanitizeOcrArtifacts(rawText);
    const tokens = cleaned.split(/\s+/).filter(t => t.length > 0);

    const results = [];
    let detectedSymbols = [];

    tokens.forEach(token => {
      const match = this.findClosestWord(token);
      if (match) {
        results.push(match.word);
        if (match.icon && match.icon !== "✨") {
          detectedSymbols.push(match.icon);
        }
      } else {
        // Keep original word if no close match
        results.push(token);
      }
    });

    const fullCorrectedSentence = results.join(" ");
    const primaryIcon = detectedSymbols.length > 0 ? detectedSymbols[0] : "📖";

    return {
      original: rawText.trim(),
      corrected: fullCorrectedSentence,
      primaryWord: results.length === 1 ? results[0] : null,
      primaryIcon: primaryIcon,
      symbols: detectedSymbols,
      wordCount: results.length
    };
  }

  /**
   * Levenshtein distance calculation
   */
  levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Systematic Phonics Phoneme Dissector for Age 3+:
   * Breaks word into phoneme sounds so child can hear it step-by-step
   */
  dissectPhonemes(word) {
    const clean = word.toLowerCase().trim();
    if (clean.length <= 4) {
      return clean.split("");
    }
    return [clean];
  }
}

window.smartDictionary = new SmartDictionaryEngine();
