/**
 * Amina AAC & Phonics Studio - Core Vocabulary Data & Open Board Format (OBF) Engine
 * Classified using the Modified Fitzgerald Key AAC Standard
 */

const DEFAULT_BOARDS = {
  "core_starter": {
    id: "core_starter",
    name: "Starter Core 12",
    description: "High-impact starter vocabulary for emerging communicators",
    columns: 4,
    tiles: [
      { id: "cs_1", label: "I / Me", speech: "I", category: "people", icon: "👤" },
      { id: "cs_2", label: "Want", speech: "want", category: "verb", icon: "🤲" },
      { id: "cs_3", label: "More", speech: "more", category: "adjective", icon: "➕" },
      { id: "cs_4", label: "Help", speech: "help", category: "social", icon: "🆘" },

      { id: "cs_5", label: "You", speech: "you", category: "people", icon: "👉" },
      { id: "cs_6", label: "Go", speech: "go", category: "verb", icon: "🟢" },
      { id: "cs_7", label: "Stop", speech: "stop", category: "verb", icon: "🛑" },
      { id: "cs_8", label: "Bathroom", speech: "bathroom", category: "noun", icon: "🚻", targetBoard: "urgent_needs" },

      { id: "cs_9", label: "Yes", speech: "yes", category: "social", icon: "✅" },
      { id: "cs_10", label: "No", speech: "no", category: "social", icon: "❌" },
      { id: "cs_11", label: "Eat", speech: "eat", category: "verb", icon: "🍎", targetBoard: "food_drinks" },
      { id: "cs_12", label: "Feelings", speech: "feelings", category: "adjective", icon: "😊", targetBoard: "feelings" }
    ]
  },

  "core_master": {
    id: "core_master",
    name: "Universal Core 36",
    description: "Comprehensive Fitzgerald Key communication grid for school, home & community",
    columns: 6,
    tiles: [
      // Row 1: Pronouns -> Actions -> Modifiers -> Social
      { id: "cm_1", label: "I / Me", speech: "I", category: "people", icon: "👤" },
      { id: "cm_2", label: "Want", speech: "want", category: "verb", icon: "🤲" },
      { id: "cm_3", label: "Like", speech: "like", category: "verb", icon: "❤️" },
      { id: "cm_4", label: "Good", speech: "good", category: "adjective", icon: "👍" },
      { id: "cm_5", label: "Bad", speech: "bad", category: "adjective", icon: "👎" },
      { id: "cm_6", label: "Hello", speech: "hello", category: "social", icon: "👋" },

      // Row 2
      { id: "cm_7", label: "You", speech: "you", category: "people", icon: "👉" },
      { id: "cm_8", label: "Go", speech: "go", category: "verb", icon: "🟢" },
      { id: "cm_9", label: "Stop", speech: "stop", category: "verb", icon: "🛑" },
      { id: "cm_10", label: "Big", speech: "big", category: "adjective", icon: "🐘" },
      { id: "cm_11", label: "Little", speech: "little", category: "adjective", icon: "🐭" },
      { id: "cm_12", label: "Goodbye", speech: "goodbye", category: "social", icon: "👋" },

      // Row 3
      { id: "cm_13", label: "We", speech: "we", category: "people", icon: "👥" },
      { id: "cm_14", label: "Help", speech: "help", category: "verb", icon: "🆘" },
      { id: "cm_15", label: "Make", speech: "make", category: "verb", icon: "🔨" },
      { id: "cm_16", label: "More", speech: "more", category: "adjective", icon: "➕" },
      { id: "cm_17", label: "All Done", speech: "all done", category: "adjective", icon: "🏁" },
      { id: "cm_18", label: "Please", speech: "please", category: "social", icon: "🙏" },

      // Row 4
      { id: "cm_19", label: "They", speech: "they", category: "people", icon: "👥" },
      { id: "cm_20", label: "See / Look", speech: "look", category: "verb", icon: "👀" },
      { id: "cm_21", label: "Play", speech: "play", category: "verb", icon: "🎮", targetBoard: "actions_play" },
      { id: "cm_22", label: "Same", speech: "same", category: "adjective", icon: "🟰" },
      { id: "cm_23", label: "Different", speech: "different", category: "adjective", icon: "🔀" },
      { id: "cm_24", label: "Thank You", speech: "thank you", category: "social", icon: "💖" },

      // Row 5
      { id: "cm_25", label: "What?", speech: "what", category: "question", icon: "❓" },
      { id: "cm_26", label: "Eat", speech: "eat", category: "verb", icon: "🍎", targetBoard: "food_drinks" },
      { id: "cm_27", label: "Drink", speech: "drink", category: "verb", icon: "🥤" },
      { id: "cm_28", label: "In", speech: "in", category: "misc", icon: "📥" },
      { id: "cm_29", label: "Out", speech: "out", category: "misc", icon: "📤" },
      { id: "cm_30", label: "Sorry", speech: "sorry", category: "social", icon: "🙇" },

      // Row 6 (Category Gateways & Urgents)
      { id: "cm_31", label: "Feelings", speech: "feelings", category: "adjective", icon: "😊", targetBoard: "feelings" },
      { id: "cm_32", label: "Urgent Needs", speech: "urgent needs", category: "noun", icon: "🚨", targetBoard: "urgent_needs" },
      { id: "cm_33", label: "Places", speech: "places", category: "noun", icon: "🏠", targetBoard: "places" },
      { id: "cm_34", label: "People", speech: "people", category: "people", icon: "👨‍👩‍👦", targetBoard: "people_family" },
      { id: "cm_35", label: "Yes", speech: "yes", category: "social", icon: "✅" },
      { id: "cm_36", label: "No", speech: "no", category: "social", icon: "❌" }
    ]
  },

  "feelings": {
    id: "feelings",
    name: "Feelings & Emotions",
    description: "Emotional regulation and internal state expression",
    columns: 4,
    tiles: [
      { id: "fel_1", label: "Happy", speech: "I feel happy", category: "adjective", icon: "😄" },
      { id: "fel_2", label: "Sad", speech: "I feel sad", category: "adjective", icon: "😢" },
      { id: "fel_3", label: "Mad / Frustrated", speech: "I feel angry", category: "adjective", icon: "😡" },
      { id: "fel_4", label: "Tired", speech: "I feel tired", category: "adjective", icon: "😴" },

      { id: "fel_5", label: "Excited", speech: "I feel excited", category: "adjective", icon: "🤩" },
      { id: "fel_6", label: "Scared", speech: "I feel scared", category: "adjective", icon: "😨" },
      { id: "fel_7", label: "Hurt / Pain", speech: "I am hurt", category: "adjective", icon: "🩹" },
      { id: "fel_8", label: "Overwhelmed", speech: "I am overwhelmed", category: "adjective", icon: "🤯" },

      { id: "fel_9", label: "Calm / Peaceful", speech: "I feel calm", category: "adjective", icon: "🧘" },
      { id: "fel_10", label: "Silly", speech: "I feel silly", category: "adjective", icon: "😜" },
      { id: "fel_11", label: "Hungry", speech: "I am hungry", category: "adjective", icon: "🍽️" },
      { id: "fel_12", label: "Thirsty", speech: "I am thirsty", category: "adjective", icon: "🥛" }
    ]
  },

  "urgent_needs": {
    id: "urgent_needs",
    name: "Urgent & Health Needs",
    description: "Crucial medical, sensory, and bodily assistance buttons",
    columns: 4,
    tiles: [
      { id: "urg_1", label: "Bathroom", speech: "I need to go to the bathroom", category: "noun", icon: "🚻" },
      { id: "urg_2", label: "Need Help!", speech: "I need help right now please", category: "social", icon: "🆘" },
      { id: "urg_3", label: "Pain / It Hurts", speech: "Something hurts me", category: "adjective", icon: "⚡" },
      { id: "urg_4", label: "Sensory Break", speech: "I need a sensory break and quiet time", category: "verb", icon: "⏸️" },

      { id: "urg_5", label: "Too Loud", speech: "It is too loud in here", category: "adjective", icon: "🔊" },
      { id: "urg_6", label: "Too Bright", speech: "It is too bright", category: "adjective", icon: "☀️" },
      { id: "urg_7", label: "Need Water", speech: "I need a drink of water please", category: "noun", icon: "💧" },
      { id: "urg_8", label: "Medicine", speech: "I need my medicine", category: "noun", icon: "💊" },

      { id: "urg_9", label: "Call Family", speech: "Please call my parents", category: "social", icon: "📞" },
      { id: "urg_10", label: "Deep Breath", speech: "Let us take a deep breath together", category: "verb", icon: "🌬️" },
      { id: "urg_11", label: "Quiet Space", speech: "I need to go to a quiet room", category: "noun", icon: "🚪" },
      { id: "urg_12", label: "All Done", speech: "I am all done now", category: "social", icon: "🏁" }
    ]
  },

  "food_drinks": {
    id: "food_drinks",
    name: "Food & Drinks",
    description: "Meals, snacks, and beverage selections",
    columns: 4,
    tiles: [
      { id: "fd_1", label: "Water", speech: "water", category: "noun", icon: "💧" },
      { id: "fd_2", label: "Juice", speech: "juice", category: "noun", icon: "🧃" },
      { id: "fd_3", label: "Milk", speech: "milk", category: "noun", icon: "🥛" },
      { id: "fd_4", label: "Apple", speech: "apple", category: "noun", icon: "🍎" },

      { id: "fd_5", label: "Banana", speech: "banana", category: "noun", icon: "🍌" },
      { id: "fd_6", label: "Bread / Toast", speech: "bread", category: "noun", icon: "🍞" },
      { id: "fd_7", label: "Pizza", speech: "pizza", category: "noun", icon: "🍕" },
      { id: "fd_8", label: "Chicken", speech: "chicken", category: "noun", icon: "🍗" },

      { id: "fd_9", label: "Snack", speech: "snack", category: "noun", icon: "🥨" },
      { id: "fd_10", label: "Cookie", speech: "cookie", category: "noun", icon: "🍪" },
      { id: "fd_11", label: "More Please", speech: "more food please", category: "social", icon: "➕" },
      { id: "fd_wheel", label: "Spin Food Wheel", speech: "Let us spin the food decision wheel!", category: "social", icon: "🎡", action: "open_wheel" },
      { id: "fd_12", label: "All Full", speech: "I am full thank you", category: "adjective", icon: "✋" }
    ]
  },

  "actions_play": {
    id: "actions_play",
    name: "Activities & Play",
    description: "Games, sensory play, and daily learning activities",
    columns: 4,
    tiles: [
      { id: "act_1", label: "Play Game", speech: "play game", category: "verb", icon: "🎲" },
      { id: "act_2", label: "Draw / Color", speech: "draw and color", category: "verb", icon: "🖍️" },
      { id: "act_3", label: "Watch Video", speech: "watch a video", category: "verb", icon: "📺" },
      { id: "act_4", label: "Listen to Music", speech: "listen to music", category: "verb", icon: "🎵" },

      { id: "act_5", label: "Read Book", speech: "read a book", category: "verb", icon: "📖" },
      { id: "act_6", label: "Go Outside", speech: "go outside", category: "verb", icon: "🌳" },
      { id: "act_7", label: "Play Blocks", speech: "build with blocks", category: "verb", icon: "🧱" },
      { id: "act_8", label: "Bubbles", speech: "blow bubbles", category: "noun", icon: "🫧" },

      { id: "act_9", label: "My Turn", speech: "it is my turn now", category: "social", icon: "🙋" },
      { id: "act_10", label: "Your Turn", speech: "it is your turn", category: "social", icon: "🤝" },
      { id: "act_11", label: "Dance", speech: "dance", category: "verb", icon: "💃" },
      { id: "act_12", label: "Rest / Nap", speech: "take a rest", category: "verb", icon: "🛋️" }
    ]
  },

  "places": {
    id: "places",
    name: "Places & Locations",
    description: "Common environments and community navigation",
    columns: 4,
    tiles: [
      { id: "plc_1", label: "Home", speech: "home", category: "noun", icon: "🏠" },
      { id: "plc_2", label: "School", speech: "school", category: "noun", icon: "🏫" },
      { id: "plc_3", label: "Park", speech: "playground park", category: "noun", icon: "🛝" },
      { id: "plc_4", label: "Store", speech: "store", category: "noun", icon: "🛒" },

      { id: "plc_5", label: "Car", speech: "in the car", category: "noun", icon: "🚗" },
      { id: "plc_6", label: "Doctor", speech: "doctor office", category: "noun", icon: "🏥" },
      { id: "plc_7", label: "Bathroom", speech: "bathroom", category: "noun", icon: "🚻" },
      { id: "plc_8", label: "Bedroom", speech: "bedroom", category: "noun", icon: "🛏️" }
    ]
  },

  "people_family": {
    id: "people_family",
    name: "People & Family",
    description: "Family members, teachers, and support network",
    columns: 4,
    tiles: [
      { id: "peo_1", label: "Mom", speech: "Mom", category: "people", icon: "👩" },
      { id: "peo_2", label: "Dad", speech: "Dad", category: "people", icon: "👨" },
      { id: "peo_3", label: "Teacher", speech: "Teacher", category: "people", icon: "👩‍🏫" },
      { id: "peo_4", label: "Therapist", speech: "Therapist", category: "people", icon: "🧑‍⚕️" },

      { id: "peo_5", label: "Friend", speech: "Friend", category: "people", icon: "🧑‍🤝‍🧑" },
      { id: "peo_6", label: "Brother", speech: "Brother", category: "people", icon: "👦" },
      { id: "peo_7", label: "Sister", speech: "Sister", category: "people", icon: "👧" },
      { id: "peo_8", label: "Doctor", speech: "Doctor", category: "people", icon: "🩺" }
    ]
  }
};

class AacDataManager {
  constructor() {
    this.storageKey = "AMINA_AAC_BOARDS_V1";
    this.boards = this.loadBoards();
  }

  loadBoards() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load stored AAC boards, defaulting:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_BOARDS));
  }

  saveBoards() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.boards));
    } catch (e) {
      console.warn("Error saving AAC boards to local storage:", e);
    }
  }

  getBoard(id) {
    return this.boards[id] || this.boards["core_master"];
  }

  getAllBoardSummaries() {
    return Object.values(this.boards).map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      tileCount: b.tiles.length,
      columns: b.columns
    }));
  }

  addOrUpdateTile(boardId, tile) {
    if (!this.boards[boardId]) return false;
    const tiles = this.boards[boardId].tiles;
    const existingIndex = tiles.findIndex(t => t.id === tile.id);

    if (existingIndex >= 0) {
      tiles[existingIndex] = { ...tiles[existingIndex], ...tile };
    } else {
      if (!tile.id) tile.id = "tile_" + Date.now();
      tiles.push(tile);
    }
    this.saveBoards();
    return true;
  }

  deleteTile(boardId, tileId) {
    if (!this.boards[boardId]) return false;
    this.boards[boardId].tiles = this.boards[boardId].tiles.filter(t => t.id !== tileId);
    this.saveBoards();
    return true;
  }

  createBoard(boardData) {
    const id = boardData.id || "board_" + Date.now();
    this.boards[id] = {
      id,
      name: boardData.name || "New Custom Board",
      description: boardData.description || "",
      columns: boardData.columns || 4,
      tiles: boardData.tiles || []
    };
    this.saveBoards();
    return id;
  }

  resetToDefaults() {
    this.boards = JSON.parse(JSON.stringify(DEFAULT_BOARDS));
    this.saveBoards();
  }

  /**
   * Export board in Open Board Format (OBF) specification
   */
  exportToOBF(boardId) {
    const board = this.getBoard(boardId);
    const obfButtons = board.tiles.map((t, idx) => ({
      id: t.id,
      label: t.label,
      vocalization: t.speech || t.label,
      background_color: this.getCategoryBgHex(t.category),
      border_color: this.getCategoryBorderHex(t.category),
      image_id: t.icon,
      load_board: t.targetBoard ? { id: t.targetBoard } : null
    }));

    const rows = Math.ceil(board.tiles.length / (board.columns || 4));
    const gridOrder = [];
    for (let r = 0; r < rows; r++) {
      const rowArr = [];
      for (let c = 0; c < (board.columns || 4); c++) {
        const idx = r * (board.columns || 4) + c;
        rowArr.push(board.tiles[idx] ? board.tiles[idx].id : null);
      }
      gridOrder.push(rowArr);
    }

    return {
      format: "open-board-0.1",
      id: board.id,
      name: board.name,
      locale: "en",
      grid: {
        rows,
        columns: board.columns || 4,
        order: gridOrder
      },
      buttons: obfButtons
    };
  }

  /**
   * Import board from Open Board Format (OBF) JSON
   */
  importFromOBF(obfData) {
    if (!obfData || !obfData.buttons) {
      throw new Error("Invalid OBF format: Missing buttons array");
    }

    const boardId = (obfData.id || "imported_" + Date.now()).replace(/[^a-zA-Z0-9_-]/g, "_");
    const columns = (obfData.grid && obfData.grid.columns) ? obfData.grid.columns : 4;

    const tiles = obfData.buttons.map((b, idx) => ({
      id: b.id || `imp_tile_${idx}`,
      label: b.label || "Word",
      speech: b.vocalization || b.label || "",
      category: this.inferCategoryFromColor(b.background_color),
      icon: b.image_id || "💬",
      targetBoard: b.load_board ? b.load_board.id : null
    }));

    this.boards[boardId] = {
      id: boardId,
      name: obfData.name || "Imported Board",
      description: "Imported via Open Board Format",
      columns,
      tiles
    };

    this.saveBoards();
    return boardId;
  }

  getCategoryBgHex(category) {
    const map = {
      people: "#fef9c3",
      verb: "#dcfce7",
      noun: "#ffedd5",
      adjective: "#dbeafe",
      social: "#fce7f3",
      question: "#f3e8ff",
      misc: "#f1f5f9"
    };
    return map[category] || "#f1f5f9";
  }

  getCategoryBorderHex(category) {
    const map = {
      people: "#ca8a04",
      verb: "#16a34a",
      noun: "#ea580c",
      adjective: "#2563eb",
      social: "#db2777",
      question: "#9333ea",
      misc: "#64748b"
    };
    return map[category] || "#64748b";
  }

  inferCategoryFromColor(hex) {
    if (!hex) return "misc";
    const h = hex.toLowerCase();
    if (h.includes("yellow") || h.includes("fef9") || h.includes("ca8a")) return "people";
    if (h.includes("green") || h.includes("dcfc") || h.includes("16a3")) return "verb";
    if (h.includes("orange") || h.includes("ffed") || h.includes("ea58")) return "noun";
    if (h.includes("blue") || h.includes("dbea") || h.includes("2563")) return "adjective";
    if (h.includes("pink") || h.includes("fce7") || h.includes("db27")) return "social";
    if (h.includes("purple") || h.includes("f3e8") || h.includes("9333")) return "question";
    return "misc";
  }
}

// Global data manager
window.aacData = new AacDataManager();
