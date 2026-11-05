/**
 * Amina AAC & Phonics Studio - Main Application Controller
 * High-performance, fully accessible, mobile-first responsive architecture
 */

class AacApp {
  constructor() {
    this.activeTab = "aac"; // "aac" | "phonics"
    this.currentBoardId = "core_master";
    this.boardHistory = [];
    this.sentenceStrip = [];
    this.gridDensity = 6;
    this.currentTheme = "dark";
    
    // Switch Scanning & Accessibility
    this.switchScanning = {
      enabled: false,
      speedMs: 1200,
      currentIndex: 0,
      timer: null
    };
    this.dwellTimeMs = 0; // 0 for instant, >0 for dwell activation
    this.dwellTimer = null;

    // Therapist / Parent Edit Mode
    this.editMode = false;
    this.therapistPin = "1234";

    // Phonics State
    this.phonicsTab = "blender"; // "blender" | "soundwall" | "stories" | "rhymejam"
    this.activeFamilyIndex = 0;
    this.activeWordIndex = 0;
    this.blenderTiles = ["c", "a", "t"];
    this.quizIndex = 0;
    this.quizScore = 0;
    this.quizStreak = 0;

    // Custom voice recording state
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordedAudioBase64 = null;

    this.initElements();
    this.bindEvents();
    this.setupAminaNarrator();
    this.renderCurrentBoard();
    this.renderSentenceStrip();
    this.renderCategoryNav();
    this.checkIncomingGameDialogue();
  }

  checkIncomingGameDialogue() {
    const incoming = sessionStorage.getItem("AAC_INCOMING_DIALOGUE");
    if (incoming) {
      sessionStorage.removeItem("AAC_INCOMING_DIALOGUE");
      setTimeout(() => {
        window.aacAudio.speak(`Game dialogue received: ${incoming}. You can formulate your response with the symbols below.`);
        const banner = document.createElement("div");
        banner.style.cssText = "background:rgba(240,136,62,0.2); border:1px solid #f0883e; color:#fed7aa; padding:8px 14px; border-radius:8px; margin:6px 12px; font-size:0.85rem; font-weight:600; display:flex; justify-content:space-between; align-items:center; z-index:35;";
        banner.innerHTML = `<span>🎮 <strong>Game Dialogue:</strong> "${incoming}"</span><button style="background:none; border:none; color:#fff; cursor:pointer; font-size:1.1rem; padding-left:8px;">&times;</button>`;
        banner.querySelector("button").onclick = () => banner.remove();
        this.el.aacView.parentElement.insertBefore(banner, this.el.aacView);
      }, 500);
    }
  }

  initElements() {
    this.el = {
      appContainer: document.getElementById("app-container"),
      aacView: document.getElementById("aac-view"),
      phonicsView: document.getElementById("phonics-view"),
      categoryNav: document.getElementById("category-nav"),
      aacGrid: document.getElementById("aac-grid"),
      sentenceDisplay: document.getElementById("sentence-display"),
      boardTitleBadge: document.getElementById("board-title-badge"),
      narratorHud: document.getElementById("narrator-hud"),
      narratorSubtitle: document.getElementById("narrator-subtitle"),
      // Modals
      settingsModal: document.getElementById("settings-modal"),
      editTileModal: document.getElementById("edit-tile-modal"),
      obfModal: document.getElementById("obf-modal"),
      pinModal: document.getElementById("pin-modal")
    };
  }

  bindEvents() {
    // Top Navigation Tabs
    document.getElementById("btn-tab-aac").addEventListener("click", () => this.switchMainTab("aac"));
    document.getElementById("btn-tab-phonics").addEventListener("click", () => this.switchMainTab("phonics"));

    // Sentence Strip Controls
    document.getElementById("btn-speak-sentence").addEventListener("click", () => this.speakSentence());
    document.getElementById("btn-clear-sentence").addEventListener("click", () => this.clearSentence());
    document.getElementById("btn-backspace").addEventListener("click", () => this.backspaceSentence());
    document.getElementById("btn-copy-sentence").addEventListener("click", () => this.copySentenceText());
    document.getElementById("btn-share-sentence").addEventListener("click", () => this.shareSentence());

    // Morphological Modifiers (+s, +ing, +ed)
    document.getElementById("btn-mod-s").addEventListener("click", () => this.applyModifier("s"));
    document.getElementById("btn-mod-ing").addEventListener("click", () => this.applyModifier("ing"));
    document.getElementById("btn-mod-ed").addEventListener("click", () => this.applyModifier("ed"));

    // Settings & Quick Actions
    document.getElementById("btn-settings").addEventListener("click", () => this.openSettingsModal());
    document.getElementById("btn-edit-mode").addEventListener("click", () => this.toggleEditModePrompt());
    document.getElementById("btn-quick-back").addEventListener("click", () => this.navigateBack());

    // Switch scanning keyboard trigger (Spacebar or Enter)
    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        this.handleSwitchActivation();
      }
    });

    // Voice & Audio controls inside Settings
    const voiceSelect = document.getElementById("setting-voice-select");
    if (voiceSelect) {
      voiceSelect.addEventListener("change", (e) => {
        window.aacAudio.setVoiceByName(e.target.value);
      });
    }

    const rateSlider = document.getElementById("setting-voice-rate");
    if (rateSlider) {
      rateSlider.addEventListener("input", (e) => {
        window.aacAudio.rate = parseFloat(e.target.value);
        document.getElementById("label-voice-rate").textContent = `${Math.round(window.aacAudio.rate * 100)}%`;
      });
    }

    const pitchSlider = document.getElementById("setting-voice-pitch");
    if (pitchSlider) {
      pitchSlider.addEventListener("input", (e) => {
        window.aacAudio.pitch = parseFloat(e.target.value);
        document.getElementById("label-voice-pitch").textContent = `${Math.round(window.aacAudio.pitch * 100)}%`;
      });
    }

    // Grid Density Selector
    const gridSelect = document.getElementById("setting-grid-density");
    if (gridSelect) {
      gridSelect.addEventListener("change", (e) => {
        this.setGridDensity(parseInt(e.target.value, 10));
      });
    }

    // Theme Selector
    const themeSelect = document.getElementById("setting-theme-select");
    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => {
        this.setTheme(e.target.value);
      });
    }

    // Switch Scan Checkbox
    const switchCheckbox = document.getElementById("setting-switch-scan");
    if (switchCheckbox) {
      switchCheckbox.addEventListener("change", (e) => {
        this.toggleSwitchScanning(e.target.checked);
      });
    }
  }

  setupAminaNarrator() {
    window.aacAudio.onStateChange = (isSpeaking, text) => {
      if (isSpeaking) {
        this.el.narratorHud.classList.add("speaking");
        this.el.narratorSubtitle.textContent = `"${text}"`;
      } else {
        this.el.narratorHud.classList.remove("speaking");
        this.el.narratorSubtitle.textContent = "Ready to speak with you";
      }
    };
  }

  // =========================================================================
  // MAIN VIEW SWITCHER & CATEGORY NAVIGATION
  // =========================================================================

  switchMainTab(tab) {
    this.activeTab = tab;
    document.getElementById("btn-tab-aac").classList.toggle("active", tab === "aac");
    document.getElementById("btn-tab-phonics").classList.toggle("active", tab === "phonics");

    if (tab === "aac") {
      this.el.aacView.style.display = "flex";
      this.el.phonicsView.style.display = "none";
      this.el.categoryNav.style.display = "flex";
      this.renderCurrentBoard();
    } else {
      this.el.aacView.style.display = "none";
      this.el.phonicsView.style.display = "flex";
      this.el.categoryNav.style.display = "none";
      this.renderPhonicsView();
    }
  }

  renderCategoryNav() {
    const boards = window.aacData.getAllBoardSummaries();
    this.el.categoryNav.innerHTML = "";

    // Home / Back Button
    const homeBtn = document.createElement("button");
    homeBtn.className = "category-tab";
    homeBtn.innerHTML = `<span>🏠</span> Home Core`;
    homeBtn.addEventListener("click", () => this.navigateToBoard("core_master"));
    this.el.categoryNav.appendChild(homeBtn);

    boards.forEach(b => {
      const tab = document.createElement("button");
      tab.className = `category-tab ${b.id === this.currentBoardId ? "active" : ""}`;
      tab.textContent = b.name;
      tab.addEventListener("click", () => this.navigateToBoard(b.id));
      this.el.categoryNav.appendChild(tab);
    });

    // Add New Board Button (Therapist mode)
    if (this.editMode) {
      const addBoardBtn = document.createElement("button");
      addBoardBtn.className = "category-tab";
      addBoardBtn.style.borderColor = "var(--gh-accent-green)";
      addBoardBtn.style.color = "var(--gh-accent-green)";
      addBoardBtn.innerHTML = `<span>➕</span> New Board`;
      addBoardBtn.addEventListener("click", () => this.promptCreateBoard());
      this.el.categoryNav.appendChild(addBoardBtn);
    }
  }

  // =========================================================================
  // AAC GRID RENDERING & INTERACTION
  // =========================================================================

  navigateToBoard(boardId) {
    if (this.currentBoardId !== boardId) {
      this.boardHistory.push(this.currentBoardId);
    }
    this.currentBoardId = boardId;
    this.renderCurrentBoard();
    this.renderCategoryNav();
  }

  navigateBack() {
    if (this.boardHistory.length > 0) {
      this.currentBoardId = this.boardHistory.pop();
      this.renderCurrentBoard();
      this.renderCategoryNav();
    } else {
      this.currentBoardId = "core_master";
      this.renderCurrentBoard();
      this.renderCategoryNav();
    }
  }

  renderCurrentBoard() {
    const board = window.aacData.getBoard(this.currentBoardId);
    this.el.boardTitleBadge.textContent = board.name;
    
    // Set grid columns
    this.el.aacGrid.className = `aac-grid grid-cols-${this.gridDensity || board.columns || 4}`;
    this.el.aacGrid.innerHTML = "";

    board.tiles.forEach((tile, index) => {
      const tileBtn = document.createElement("button");
      tileBtn.className = `aac-tile cat-${tile.category} lacquer-sheen ${tile.targetBoard ? "cat-folder" : ""}`;
      tileBtn.setAttribute("data-index", index);
      tileBtn.setAttribute("aria-label", tile.label);

      let folderIndicator = tile.targetBoard ? `<span class="tile-folder-indicator">FOLDER 📂</span>` : "";

      tileBtn.innerHTML = `
        ${folderIndicator}
        <div class="tile-icon-wrap">
          <span class="tile-icon">${tile.icon || "💬"}</span>
        </div>
        <span class="tile-label">${tile.label}</span>
      `;

      // Dwell or Click activation
      this.attachTileInteraction(tileBtn, tile);
      this.el.aacGrid.appendChild(tileBtn);
    });

    // Add Tile Slot when in Edit Mode
    if (this.editMode) {
      const addTileBtn = document.createElement("button");
      addTileBtn.className = "aac-tile cat-misc lacquer-sheen";
      addTileBtn.style.borderStyle = "dashed";
      addTileBtn.style.borderColor = "var(--gh-accent-green)";
      addTileBtn.innerHTML = `
        <div class="tile-icon-wrap">
          <span class="tile-icon">➕</span>
        </div>
        <span class="tile-label" style="color:var(--gh-accent-green);">Add Tile</span>
      `;
      addTileBtn.addEventListener("click", () => this.openEditTileModal(null));
      this.el.aacGrid.appendChild(addTileBtn);
    }

    if (this.switchScanning.enabled) {
      this.switchScanning.currentIndex = 0;
      this.updateSwitchScanHighlight();
    }
  }

  attachTileInteraction(btn, tile) {
    if (this.dwellTimeMs > 0) {
      btn.addEventListener("pointerdown", () => {
        btn.style.filter = "brightness(1.15)";
        this.dwellTimer = setTimeout(() => {
          this.activateTile(tile);
          btn.style.filter = "";
        }, this.dwellTimeMs);
      });
      btn.addEventListener("pointerup", () => {
        clearTimeout(this.dwellTimer);
        btn.style.filter = "";
      });
      btn.addEventListener("pointerleave", () => {
        clearTimeout(this.dwellTimer);
        btn.style.filter = "";
      });
    } else {
      btn.addEventListener("click", (e) => {
        if (this.editMode && e.shiftKey) {
          this.openEditTileModal(tile);
        } else {
          this.activateTile(tile);
        }
      });
    }

    // Long press for editing tile in edit mode
    let pressTimer;
    btn.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => {
        if (this.editMode) this.openEditTileModal(tile);
      }, 700);
    });
    btn.addEventListener("touchend", () => clearTimeout(pressTimer));
  }

  activateTile(tile) {
    // If tile has a custom voice recording, play it!
    if (tile.customAudio) {
      window.aacAudio.playCustomRecording(tile.customAudio);
    } else {
      const spokenText = tile.speech || tile.label;
      window.aacAudio.speak(spokenText);
    }

    // If it's a folder, jump to target board
    if (tile.targetBoard) {
      setTimeout(() => {
        this.navigateToBoard(tile.targetBoard);
      }, 200);
      return;
    }

    // Otherwise append to Sentence Strip
    this.sentenceStrip.push({
      id: tile.id + "_" + Date.now(),
      label: tile.label,
      speech: tile.speech || tile.label,
      icon: tile.icon,
      category: tile.category
    });

    this.renderSentenceStrip();
  }

  // =========================================================================
  // SENTENCE STRIP MANAGEMENT
  // =========================================================================

  renderSentenceStrip() {
    if (this.sentenceStrip.length === 0) {
      this.el.sentenceDisplay.innerHTML = `
        <div class="sentence-placeholder">
          <span>💬</span> Tap symbols below to build your sentence...
        </div>
      `;
      return;
    }

    this.el.sentenceDisplay.innerHTML = "";
    this.sentenceStrip.forEach((chip, index) => {
      const chipEl = document.createElement("div");
      chipEl.className = `strip-chip cat-${chip.category} lacquer-sheen`;
      chipEl.innerHTML = `
        <span class="strip-chip-icon">${chip.icon || "💬"}</span>
        <span class="strip-chip-text">${chip.label}</span>
      `;
      // Click chip to speak single word again or tap & hold to remove
      chipEl.addEventListener("click", () => {
        window.aacAudio.speak(chip.speech);
      });
      this.el.sentenceDisplay.appendChild(chipEl);
    });

    // Auto-scroll to end
    this.el.sentenceDisplay.scrollLeft = this.el.sentenceDisplay.scrollWidth;
  }

  speakSentence() {
    if (this.sentenceStrip.length === 0) return;
    const fullText = this.sentenceStrip.map(c => c.speech).join(" ");
    window.aacAudio.speak(fullText);
  }

  clearSentence() {
    this.sentenceStrip = [];
    window.aacAudio.playTone(280, 0.08, "sine");
    this.renderSentenceStrip();
  }

  backspaceSentence() {
    if (this.sentenceStrip.length > 0) {
      this.sentenceStrip.pop();
      window.aacAudio.playTone(300, 0.05, "sine");
      this.renderSentenceStrip();
    }
  }

  applyModifier(suffix) {
    if (this.sentenceStrip.length === 0) return;
    const last = this.sentenceStrip[this.sentenceStrip.length - 1];
    if (suffix === "s") {
      last.label += "s";
      last.speech += "s";
    } else if (suffix === "ing") {
      last.label += "ing";
      last.speech += "ing";
    } else if (suffix === "ed") {
      last.label += "ed";
      last.speech += "ed";
    }
    window.aacAudio.speak(last.speech);
    this.renderSentenceStrip();
  }

  copySentenceText() {
    if (this.sentenceStrip.length === 0) return;
    const text = this.sentenceStrip.map(c => c.speech).join(" ");
    navigator.clipboard.writeText(text).then(() => {
      window.aacAudio.playTone(520, 0.1, "sine");
      alert(`Copied sentence: "${text}"`);
    });
  }

  shareSentence() {
    if (this.sentenceStrip.length === 0) return;
    const text = this.sentenceStrip.map(c => c.speech).join(" ");
    if (navigator.share) {
      navigator.share({
        title: "AAC Message",
        text: text
      }).catch(e => console.log(e));
    } else {
      this.copySentenceText();
    }
  }

  // =========================================================================
  // SWITCH SCANNING (ACCESSIBILITY SINGLE-SWITCH ACCESS)
  // =========================================================================

  toggleSwitchScanning(enable) {
    this.switchScanning.enabled = enable;
    if (enable) {
      this.startSwitchScan();
    } else {
      this.stopSwitchScan();
    }
  }

  startSwitchScan() {
    this.stopSwitchScan();
    this.switchScanning.currentIndex = 0;
    this.updateSwitchScanHighlight();

    this.switchScanning.timer = setInterval(() => {
      const tiles = this.el.aacGrid.querySelectorAll(".aac-tile");
      if (tiles.length === 0) return;

      this.switchScanning.currentIndex = (this.switchScanning.currentIndex + 1) % tiles.length;
      this.updateSwitchScanHighlight();
    }, this.switchScanning.speedMs);
  }

  stopSwitchScan() {
    if (this.switchScanning.timer) {
      clearInterval(this.switchScanning.timer);
      this.switchScanning.timer = null;
    }
    const tiles = this.el.aacGrid.querySelectorAll(".aac-tile");
    tiles.forEach(t => t.classList.remove("switch-highlight"));
  }

  updateSwitchScanHighlight() {
    const tiles = this.el.aacGrid.querySelectorAll(".aac-tile");
    tiles.forEach((t, idx) => {
      t.classList.toggle("switch-highlight", idx === this.switchScanning.currentIndex);
    });
    window.aacAudio.playTone(500, 0.03, "sine");
  }

  handleSwitchActivation() {
    const tiles = this.el.aacGrid.querySelectorAll(".aac-tile");
    const activeTile = tiles[this.switchScanning.currentIndex];
    if (activeTile) {
      activeTile.click();
    }
  }

  // =========================================================================
  // HOOKED ON PHONICS LEARNING SUITE
  // =========================================================================

  renderPhonicsView() {
    const container = this.el.phonicsView;
    container.innerHTML = `
      <div class="phonics-panel">
        <div class="phonics-header">
          <div class="brand-section">
            <div class="brand-logo-icon">🔤</div>
            <div>
              <h2 style="font-size:1.15rem; font-weight:700;">Hooked on Phonics Engine</h2>
              <p style="font-size:0.78rem; color:var(--gh-text-secondary);">Systematic Phonics & Reading Integration for AAC Communicators</p>
            </div>
          </div>
          <div class="phonics-nav-tabs">
            <button class="phonics-tab ${this.phonicsTab === 'blender' ? 'active' : ''}" id="ph-tab-blender">🧩 Blending Board</button>
            <button class="phonics-tab ${this.phonicsTab === 'soundwall' ? 'active' : ''}" id="ph-tab-soundwall">📢 Sound Wall</button>
            <button class="phonics-tab ${this.phonicsTab === 'stories' ? 'active' : ''}" id="ph-tab-stories">📖 Decodable Stories</button>
            <button class="phonics-tab ${this.phonicsTab === 'rhymejam' ? 'active' : ''}" id="ph-tab-rhymejam">⭐ Word Family Jam</button>
          </div>
        </div>
        <div id="phonics-stage-content"></div>
      </div>
    `;

    document.getElementById("ph-tab-blender").addEventListener("click", () => { this.phonicsTab = "blender"; this.renderPhonicsView(); });
    document.getElementById("ph-tab-soundwall").addEventListener("click", () => { this.phonicsTab = "soundwall"; this.renderPhonicsView(); });
    document.getElementById("ph-tab-stories").addEventListener("click", () => { this.phonicsTab = "stories"; this.renderPhonicsView(); });
    document.getElementById("ph-tab-rhymejam").addEventListener("click", () => { this.phonicsTab = "rhymejam"; this.renderPhonicsView(); });

    const stage = document.getElementById("phonics-stage-content");
    if (this.phonicsTab === "blender") this.renderBlendingBoard(stage);
    else if (this.phonicsTab === "soundwall") this.renderSoundWall(stage);
    else if (this.phonicsTab === "stories") this.renderDecodableStories(stage);
    else if (this.phonicsTab === "rhymejam") this.renderRhymeJam(stage);
  }

  // 1. Interactive 3-Tile Blending Slider (Hooked on Phonics Core)
  renderBlendingBoard(container) {
    const family = window.phonicsData.wordFamilies[this.activeFamilyIndex];
    const currentWord = family.words[this.activeWordIndex];

    container.innerHTML = `
      <div class="blending-board-card">
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
          <div>
            <span style="font-size:0.78rem; text-transform:uppercase; color:var(--gh-accent-amber); font-weight:700;">Word Family:</span>
            <select id="family-selector" class="form-select" style="padding:4px 8px; margin-left:8px; font-weight:700;">
              ${window.phonicsData.wordFamilies.map((fam, i) => `
                <option value="${i}" ${i === this.activeFamilyIndex ? "selected" : ""}>${fam.name}</option>
              `).join("")}
            </select>
          </div>
          <div style="font-size:0.85rem; color:var(--gh-text-secondary);">
            Word ${this.activeWordIndex + 1} of ${family.words.length}
          </div>
        </div>

        <div style="text-align:center;">
          <div style="font-size:3.5rem;">${currentWord.icon}</div>
          <p style="font-size:1.1rem; font-style:italic; color:var(--gh-text-primary); margin-top:4px;">"${currentWord.sentence}"</p>
        </div>

        <div class="blending-slider-track">
          <div class="sound-tile" id="tile-onset">
            <span>${currentWord.onset.toUpperCase()}</span>
            <span class="sound-tile-sub">/${currentWord.onset}/</span>
          </div>
          <span class="blend-arrow">➔</span>
          <div class="sound-tile vowel-tile" id="tile-vowel">
            <span>${currentWord.vowel.toUpperCase()}</span>
            <span class="sound-tile-sub">short ${currentWord.vowel}</span>
          </div>
          <span class="blend-arrow">➔</span>
          <div class="sound-tile" id="tile-coda">
            <span>${currentWord.coda.toUpperCase()}</span>
            <span class="sound-tile-sub">/${currentWord.coda}/</span>
          </div>
        </div>

        <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center;">
          <button class="blend-action-btn" id="btn-sweep-blend">
            <span>👉 Sweep & Blend Word</span>
          </button>
          <button class="header-btn" id="btn-next-phonics-word" style="height:48px; padding:0 20px;">
            <span>Next Word ➡️</span>
          </button>
          <button class="header-btn accent-btn" id="btn-transfer-to-aac" style="height:48px; padding:0 20px;">
            <span>➕ Send to AAC Message</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById("family-selector").addEventListener("change", (e) => {
      this.activeFamilyIndex = parseInt(e.target.value, 10);
      this.activeWordIndex = 0;
      this.renderBlendingBoard(container);
    });

    document.getElementById("tile-onset").addEventListener("click", () => {
      window.aacAudio.speakPhoneme(currentWord.onset);
    });
    document.getElementById("tile-vowel").addEventListener("click", () => {
      window.aacAudio.speakPhoneme(currentWord.vowel);
    });
    document.getElementById("tile-coda").addEventListener("click", () => {
      window.aacAudio.speakPhoneme(currentWord.coda);
    });

    // Sweep & Blend sequence
    document.getElementById("btn-sweep-blend").addEventListener("click", () => {
      const sounds = [currentWord.onset, currentWord.vowel, currentWord.coda];
      window.aacAudio.blendAndSpeak(sounds, currentWord.word, (step) => {
        const tiles = [
          document.getElementById("tile-onset"),
          document.getElementById("tile-vowel"),
          document.getElementById("tile-coda")
        ];
        tiles.forEach(t => t.style.borderColor = "");

        if (step >= 0 && step < tiles.length) {
          tiles[step].style.borderColor = "#f0883e";
        } else if (step === "word") {
          tiles.forEach(t => t.style.borderColor = "#22c55e");
          if (typeof confetti === "function") {
            confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
          }
        }
      });
    });

    document.getElementById("btn-next-phonics-word").addEventListener("click", () => {
      this.activeWordIndex = (this.activeWordIndex + 1) % family.words.length;
      this.renderBlendingBoard(container);
    });

    document.getElementById("btn-transfer-to-aac").addEventListener("click", () => {
      this.sentenceStrip.push({
        id: "phonics_" + Date.now(),
        label: currentWord.word.toUpperCase(),
        speech: currentWord.word,
        icon: currentWord.icon,
        category: "noun"
      });
      this.switchMainTab("aac");
      this.renderSentenceStrip();
    });
  }

  // 2. The Sound Wall (Letter-Sound Associations & Articulation Guides)
  renderSoundWall(container) {
    const alphabet = window.phonicsData.alphabet;
    const digraphs = window.phonicsData.digraphs;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="background:var(--gh-card-bg); padding:12px 16px; border-radius:12px; border:1px solid var(--gh-border-default);">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--gh-accent-blue); margin-bottom:4px;">Pure Phonics Sound Wall</h3>
          <p style="font-size:0.78rem; color:var(--gh-text-secondary);">Tap any letter or sound to hear its pure phoneme spoken by Amina with mouth articulation cues.</p>
        </div>

        <h4 style="font-size:0.85rem; font-weight:700; color:var(--gh-text-secondary); text-transform:uppercase;">Alphabet Letters & Short Vowels</h4>
        <div class="sound-wall-grid">
          ${alphabet.map(item => `
            <div class="phoneme-card lacquer-sheen" data-letter="${item.letter}" title="${item.cue}">
              <div class="phoneme-letter" style="color:${item.type === 'vowel' ? '#f97316' : '#58a6ff'};">${item.letter}</div>
              <div class="phoneme-icon">${item.icon}</div>
              <div class="phoneme-word">${item.word}</div>
            </div>
          `).join("")}
        </div>

        <h4 style="font-size:0.85rem; font-weight:700; color:var(--gh-text-secondary); text-transform:uppercase; margin-top:12px;">Consonant Digraphs</h4>
        <div class="sound-wall-grid">
          ${digraphs.map(item => `
            <div class="phoneme-card lacquer-sheen" data-letter="${item.letter}" title="${item.cue}">
              <div class="phoneme-letter" style="color:#bc8cff;">${item.letter}</div>
              <div class="phoneme-icon">${item.icon}</div>
              <div class="phoneme-word">${item.word}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    container.querySelectorAll(".phoneme-card").forEach(card => {
      card.addEventListener("click", () => {
        const letter = card.getAttribute("data-letter");
        window.aacAudio.speakPhoneme(letter);
      });
    });
  }

  // 3. Decodable Phonics Stories
  renderDecodableStories(container) {
    const stories = window.phonicsData.decodableStories;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${stories.map(story => `
          <div class="blending-board-card" style="align-items:flex-start;">
            <div style="display:flex; align-items:center; gap:12px; width:100%; border-bottom:1px solid var(--gh-border-muted); padding-bottom:10px;">
              <span style="font-size:2rem;">${story.coverIcon}</span>
              <div>
                <h3 style="font-size:1.1rem; font-weight:700;">${story.title}</h3>
                <span style="font-size:0.75rem; color:var(--gh-accent-amber); font-weight:600;">${story.level}</span>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:12px; width:100%; margin-top:8px;">
              ${story.lines.map(line => `
                <div style="display:flex; align-items:center; justify-content:space-between; background:var(--gh-canvas-inset); padding:10px 14px; border-radius:10px; border:1px solid var(--gh-border-default);">
                  <span style="font-size:1.05rem; font-weight:600; color:var(--gh-text-primary);">${line.text}</span>
                  <div style="display:flex; gap:8px;">
                    <button class="header-btn line-read-btn" data-text="${line.text}">🔊 Read</button>
                    <button class="header-btn accent-btn line-aac-btn" data-tiles="${line.aacTiles.join(',')}">➕ Send to AAC</button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    `;

    container.querySelectorAll(".line-read-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        window.aacAudio.speak(btn.getAttribute("data-text"));
      });
    });

    container.querySelectorAll(".line-aac-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const words = btn.getAttribute("data-tiles").split(",");
        words.forEach(w => {
          this.sentenceStrip.push({
            id: "decodable_" + Date.now(),
            label: w.toUpperCase(),
            speech: w,
            icon: "📖",
            category: "noun"
          });
        });
        this.switchMainTab("aac");
        this.renderSentenceStrip();
      });
    });
  }

  // 4. Word Family Jam & Rhyme Drills
  renderRhymeJam(container) {
    const drill = window.phonicsData.rhymeDrills[this.quizIndex];

    container.innerHTML = `
      <div class="blending-board-card">
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
          <span style="font-size:0.85rem; font-weight:700; color:var(--gh-accent-blue);">Word Family Jam & Rhyme Quiz</span>
          <div style="display:flex; gap:12px; align-items:center;">
            <span style="font-size:0.85rem; color:var(--gh-accent-amber); font-weight:700;">🔥 Streak: ${this.quizStreak}</span>
            <span style="font-size:0.85rem; color:var(--gh-accent-green); font-weight:700;">⭐ Score: ${this.quizScore}</span>
          </div>
        </div>

        <div style="text-align:center; padding:16px 0;">
          <h2 style="font-size:1.4rem; font-weight:800; color:var(--gh-text-primary);">${drill.prompt}</h2>
          <button class="header-btn" id="btn-read-prompt" style="margin-top:10px;">🔊 Read Prompt Aloud</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; width:100%; max-width:480px;">
          ${drill.options.map((opt, idx) => `
            <button class="aac-tile cat-misc lacquer-sheen quiz-option-btn" data-correct="${opt.correct}" data-word="${opt.word}" style="min-height:90px;">
              <div class="tile-icon">${opt.icon}</div>
              <div class="tile-label" style="font-size:1.1rem;">${opt.word}</div>
            </button>
          `).join("")}
        </div>

        <div id="quiz-feedback-box" style="display:none; width:100%; text-align:center; padding:12px; border-radius:10px; margin-top:8px;"></div>
      </div>
    `;

    document.getElementById("btn-read-prompt").addEventListener("click", () => {
      window.aacAudio.speak(drill.prompt);
    });

    const fbBox = document.getElementById("quiz-feedback-box");
    container.querySelectorAll(".quiz-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const isCorrect = btn.getAttribute("data-correct") === "true";
        const word = btn.getAttribute("data-word");

        if (isCorrect) {
          this.quizScore += 10;
          this.quizStreak += 1;
          btn.style.borderColor = "#22c55e";
          btn.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
          fbBox.style.display = "block";
          fbBox.style.background = "rgba(34, 197, 94, 0.15)";
          fbBox.style.color = "#4ade80";
          fbBox.innerHTML = `<strong>🎉 Awesome Job!</strong> ${drill.explanation}`;
          
          window.aacAudio.playCelebrationChime();
          window.aacAudio.speak(`Correct! ${word}! ${drill.explanation}`);
          if (typeof confetti === "function") {
            confetti({ particleCount: 40, spread: 70 });
          }

          setTimeout(() => {
            this.quizIndex = (this.quizIndex + 1) % window.phonicsData.rhymeDrills.length;
            this.renderRhymeJam(container);
          }, 2400);
        } else {
          this.quizStreak = 0;
          btn.style.borderColor = "#f85149";
          fbBox.style.display = "block";
          fbBox.style.background = "rgba(248, 81, 73, 0.15)";
          fbBox.style.color = "#f85149";
          fbBox.innerHTML = `<strong>Let's try again!</strong> Listen carefully to the ending sound.`;
          window.aacAudio.playTone(220, 0.2, "sawtooth");
          window.aacAudio.speak(`Not quite. Try another one!`);
        }
      });
    });
  }

  // =========================================================================
  // SETTINGS & THEMES & OBF EXPORT/IMPORT
  // =========================================================================

  openSettingsModal() {
    this.populateVoiceSelect();
    this.el.settingsModal.style.display = "flex";

    document.getElementById("btn-close-settings").onclick = () => {
      this.el.settingsModal.style.display = "none";
    };

    document.getElementById("btn-export-obf").onclick = () => {
      this.openObfExport();
    };

    document.getElementById("btn-import-obf").onclick = () => {
      this.openObfImport();
    };

    document.getElementById("btn-reset-defaults").onclick = () => {
      if (confirm("Reset all boards and custom buttons to defaults?")) {
        window.aacData.resetToDefaults();
        this.renderCurrentBoard();
        this.renderCategoryNav();
        this.el.settingsModal.style.display = "none";
      }
    };
  }

  populateVoiceSelect() {
    const select = document.getElementById("setting-voice-select");
    if (!select) return;
    const voices = window.aacAudio.getVoiceList();
    select.innerHTML = voices.map(v => `
      <option value="${v.name}" ${v.isDefault ? "selected" : ""}>
        ${v.name} (${v.lang})
      </option>
    `).join("");
  }

  setGridDensity(columns) {
    this.gridDensity = columns;
    const board = window.aacData.getBoard(this.currentBoardId);
    board.columns = columns;
    window.aacData.saveBoards();
    this.renderCurrentBoard();
  }

  setTheme(theme) {
    document.body.className = `theme-${theme}`;
    this.currentTheme = theme;
  }

  // Open Board Format (OBF) Handler
  openObfExport() {
    const obf = window.aacData.exportToOBF(this.currentBoardId);
    const jsonStr = JSON.stringify(obf, null, 2);
    
    // Download as .obf file
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.currentBoardId}.obf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  openObfImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".obf,.json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const obfObj = JSON.parse(re.target.result);
          const newId = window.aacData.importFromOBF(obfObj);
          this.navigateToBoard(newId);
          this.renderCategoryNav();
          alert(`Successfully imported board: ${obfObj.name || newId}`);
          this.el.settingsModal.style.display = "none";
        } catch (err) {
          alert("Error parsing Open Board Format file: " + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // =========================================================================
  // THERAPIST PIN & TILE EDITING
  // =========================================================================

  toggleEditModePrompt() {
    if (this.editMode) {
      this.editMode = false;
      document.getElementById("btn-edit-mode").classList.remove("active");
      this.renderCurrentBoard();
      this.renderCategoryNav();
      return;
    }

    const pin = prompt("Enter Therapist / Educator PIN (Default: 1234):");
    if (pin === this.therapistPin) {
      this.editMode = true;
      document.getElementById("btn-edit-mode").classList.add("active");
      this.renderCurrentBoard();
      this.renderCategoryNav();
      window.aacAudio.playTone(600, 0.1, "sine");
    } else if (pin !== null) {
      alert("Incorrect PIN. Edit mode is locked.");
    }
  }

  openEditTileModal(tile = null) {
    const isNew = !tile;
    const current = tile || {
      id: "tile_" + Date.now(),
      label: "",
      speech: "",
      icon: "💬",
      category: "noun",
      targetBoard: ""
    };

    document.getElementById("edit-tile-label").value = current.label;
    document.getElementById("edit-tile-speech").value = current.speech;
    document.getElementById("edit-tile-icon").value = current.icon;
    document.getElementById("edit-tile-category").value = current.category;

    // Sub-board selector
    const boardSelect = document.getElementById("edit-tile-target-board");
    const summaries = window.aacData.getAllBoardSummaries();
    boardSelect.innerHTML = `<option value="">(None - Speaks Word)</option>` + summaries.map(s => `
      <option value="${s.id}" ${s.id === current.targetBoard ? "selected" : ""}>Open Folder: ${s.name}</option>
    `).join("");

    this.recordedAudioBase64 = current.customAudio || null;
    this.updateRecordStatus();

    this.el.editTileModal.style.display = "flex";

    document.getElementById("btn-save-tile").onclick = () => {
      const updated = {
        id: current.id,
        label: document.getElementById("edit-tile-label").value.trim() || "Word",
        speech: document.getElementById("edit-tile-speech").value.trim() || document.getElementById("edit-tile-label").value.trim(),
        icon: document.getElementById("edit-tile-icon").value.trim() || "💬",
        category: document.getElementById("edit-tile-category").value,
        targetBoard: document.getElementById("edit-tile-target-board").value || null,
        customAudio: this.recordedAudioBase64
      };

      window.aacData.addOrUpdateTile(this.currentBoardId, updated);
      this.renderCurrentBoard();
      this.el.editTileModal.style.display = "none";
    };

    document.getElementById("btn-delete-tile").style.display = isNew ? "none" : "inline-flex";
    document.getElementById("btn-delete-tile").onclick = () => {
      if (confirm(`Delete button "${current.label}"?`)) {
        window.aacData.deleteTile(this.currentBoardId, current.id);
        this.renderCurrentBoard();
        this.el.editTileModal.style.display = "none";
      }
    };

    document.getElementById("btn-close-edit-tile").onclick = () => {
      this.el.editTileModal.style.display = "none";
    };

    // Voice recording button
    document.getElementById("btn-record-voice").onclick = () => {
      this.handleVoiceRecord();
    };
  }

  handleVoiceRecord() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
      document.getElementById("btn-record-voice").textContent = "🎙️ Record Real Voice";
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Microphone recording is not supported in this browser environment.");
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          this.recordedAudioBase64 = reader.result;
          this.updateRecordStatus();
        };
        reader.readAsDataURL(blob);
      };

      this.mediaRecorder.start();
      document.getElementById("btn-record-voice").textContent = "⏹️ Stop Recording";
      window.aacAudio.playTone(660, 0.1, "sine");
    }).catch(err => {
      alert("Microphone permission denied or unavailable: " + err.message);
    });
  }

  updateRecordStatus() {
    const status = document.getElementById("label-record-status");
    if (this.recordedAudioBase64) {
      status.textContent = "✅ Custom voice recording attached";
      status.style.color = "var(--gh-accent-green)";
    } else {
      status.textContent = "No custom recording (Using default Afro-Euro TTS voice)";
      status.style.color = "var(--gh-text-secondary)";
    }
  }

  promptCreateBoard() {
    const name = prompt("Enter Name for New Board / Subfolder:");
    if (!name) return;
    const newId = window.aacData.createBoard({
      name,
      description: "User created custom board",
      columns: this.gridDensity,
      tiles: []
    });
    this.navigateToBoard(newId);
    this.renderCategoryNav();
  }
}

// Bootstrap Application on DOM Ready
window.addEventListener("DOMContentLoaded", () => {
  window.aacApp = new AacApp();
});
