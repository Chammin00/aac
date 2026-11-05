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

    // Tablet & Motor Access Settings
    this.touchMode = "contact";    // "contact" | "release" | "dwell"
    this.repeatDelayMs = 400;      // Anti-tremor lockout delay in ms
    this.lastActivationTime = 0;
    this.lastActivatedTileId = null;
    this.keyguardMode = "none";    // "none" | "standard" | "deep"
    this.orientationLock = "auto"; // "auto" | "landscape" | "portrait"
    this.palmRejection = true;
    this.isFullscreen = false;
    this.sessionLog = [];          // SLP IEP session data logger
    this.sessionStartTime = Date.now();

    // Sentence Strip Undo & Accidental Clear Protection
    this.lastClearedSentence = [];
    this.undoTimer = null;

    // Custom voice recording state
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordedAudioBase64 = null;

    this.loadTabletSettings();
    this.initElements();
    this.bindEvents();
    this.setupAminaNarrator();
    this.renderCurrentBoard();
    this.renderSentenceStrip();
    this.renderCategoryNav();
    this.renderFavoritesRibbon();
    this.checkIncomingGameDialogue();
    if (window.deviceScaleEngine) {
      window.deviceScaleEngine.setApp(this);
    }
  }

  checkIncomingGameDialogue() {
    const incoming = sessionStorage.getItem("AAC_INCOMING_DIALOGUE");
    if (incoming) {
      sessionStorage.removeItem("AAC_INCOMING_DIALOGUE");
      const cleanIncoming = incoming.replace(/^"+|"+$/g, '').trim();
      setTimeout(() => {
        window.aacAudio.speak(`Game dialogue received: ${cleanIncoming}. You can formulate your response with the symbols below.`);
        const banner = document.createElement("div");
        banner.className = "game-dialogue-banner";
        banner.style.cssText = "background:rgba(240,136,62,0.18); border:1px solid #f0883e; color:#fed7aa; padding:8px 14px; border-radius:8px; margin:8px 12px 4px 12px; font-size:0.85rem; font-weight:600; display:flex; justify-content:space-between; align-items:center; z-index:35;";
        banner.innerHTML = `<span>🎮 <strong>Game Dialogue:</strong> "${cleanIncoming}"</span><button style="background:none; border:none; color:#fff; cursor:pointer; font-size:1.1rem; padding-left:8px;" title="Dismiss">&times;</button>`;
        banner.querySelector("button").onclick = () => banner.remove();
        if (this.el.aacView) {
          this.el.aacView.insertBefore(banner, this.el.aacView.firstChild);
        }
      }, 500);
    }
  }

  initElements() {
    this.el = {
      appContainer: document.getElementById("app-container"),
      aacView: document.getElementById("aac-view"),
      phonicsView: document.getElementById("phonics-view"),
      wheelsView: document.getElementById("wheels-view"),
      categoryNav: document.getElementById("category-nav"),
      aacGrid: document.getElementById("aac-grid"),
      sentenceDisplay: document.getElementById("sentence-display"),
      favoritesRibbon: document.getElementById("favorites-ribbon"),
      boardTitleBadge: document.getElementById("board-title-badge"),
      narratorHud: document.getElementById("narrator-hud"),
      narratorSubtitle: document.getElementById("narrator-subtitle"),
      undoBtn: document.getElementById("btn-undo-sentence"),
      // Modals
      settingsModal: document.getElementById("settings-modal"),
      voiceStudioModal: document.getElementById("voice-studio-modal"),
      kioskGuideModal: document.getElementById("kiosk-guide-modal"),
      searchModal: document.getElementById("search-modal"),
      helpGuideModal: document.getElementById("help-guide-modal"),
      symbolSearchInput: document.getElementById("symbol-search-input"),
      searchResultsGrid: document.getElementById("search-results-grid"),
      searchResultCount: document.getElementById("search-result-count"),
      editTileModal: document.getElementById("edit-tile-modal"),
      obfModal: document.getElementById("obf-modal"),
      pinModal: document.getElementById("pin-modal"),
      // Sorted Menu Screen Modal & Device Scaling Elements
      menuScreenModal: document.getElementById("menu-screen-modal"),
      btnOpenMenu: document.getElementById("btn-open-menu"),
      btnCloseMenu: document.getElementById("btn-close-menu"),
      deviceProfilePill: document.getElementById("device-profile-pill"),
      checkboxAutoScale: document.getElementById("checkbox-auto-scale")
    };
  }

  bindEvents() {
    // Top Navigation Tabs
    document.getElementById("btn-tab-aac").addEventListener("click", () => this.switchMainTab("aac"));
    document.getElementById("btn-tab-phonics").addEventListener("click", () => this.switchMainTab("phonics"));
    document.getElementById("btn-tab-wheels").addEventListener("click", () => this.switchMainTab("wheels"));

    // Sentence Strip Controls
    document.getElementById("btn-speak-sentence").addEventListener("click", () => this.speakSentence());
    document.getElementById("btn-clear-sentence").addEventListener("click", () => this.clearSentence());
    if (this.el.undoBtn) {
      this.el.undoBtn.addEventListener("click", () => this.undoClearSentence());
    }
    document.getElementById("btn-backspace").addEventListener("click", () => this.backspaceSentence());
    document.getElementById("btn-star-sentence").addEventListener("click", () => this.starCurrentSentence());
    document.getElementById("btn-copy-sentence").addEventListener("click", () => this.copySentenceText());
    document.getElementById("btn-share-sentence").addEventListener("click", () => this.shareSentence());

    // Morphological Modifiers (+s, +ing, +ed)
    document.getElementById("btn-mod-s").addEventListener("click", () => this.applyModifier("s"));
    document.getElementById("btn-mod-ing").addEventListener("click", () => this.applyModifier("ing"));
    document.getElementById("btn-mod-ed").addEventListener("click", () => this.applyModifier("ed"));

    // Quick Search & Symbol Finder
    const openSearchBtn = document.getElementById("btn-open-search");
    if (openSearchBtn) {
      openSearchBtn.addEventListener("click", () => this.openSearchModal());
    }
    const closeSearchBtn = document.getElementById("btn-close-search");
    if (closeSearchBtn) {
      closeSearchBtn.addEventListener("click", () => this.closeSearchModal());
    }
    if (this.el.symbolSearchInput) {
      this.el.symbolSearchInput.addEventListener("input", (e) => this.performSearch(e.target.value));
    }

    // Quick Density Badge Switcher
    if (this.el.boardTitleBadge) {
      this.el.boardTitleBadge.addEventListener("click", () => this.cycleGridDensity());
    }

    // Help & Walkthrough Guide Modal
    const helpBtn = document.getElementById("btn-help-guide");
    if (helpBtn) {
      helpBtn.addEventListener("click", () => this.openHelpModal());
    }
    const closeHelpBtn = document.getElementById("btn-close-help");
    if (closeHelpBtn) {
      closeHelpBtn.addEventListener("click", () => this.closeHelpModal());
    }
    const gotItHelpBtn = document.getElementById("btn-got-it-help");
    if (gotItHelpBtn) {
      gotItHelpBtn.addEventListener("click", () => this.closeHelpModal());
    }

    // Sorted Master Menu Screen Controls
    if (this.el.btnOpenMenu) {
      this.el.btnOpenMenu.addEventListener("click", () => this.openMenuScreen());
    }
    if (this.el.btnCloseMenu) {
      this.el.btnCloseMenu.addEventListener("click", () => this.closeMenuScreen());
    }
    if (this.el.deviceProfilePill) {
      this.el.deviceProfilePill.addEventListener("click", () => this.openMenuScreen());
    }

    // Auto-scale toggle checkbox inside Menu Inspector
    if (this.el.checkboxAutoScale) {
      this.el.checkboxAutoScale.addEventListener("change", (e) => {
        if (window.deviceScaleEngine) {
          window.deviceScaleEngine.setAutoScale(e.target.checked);
        }
      });
    }

    // Menu Screen Urgent Assistance Cards
    document.querySelectorAll(".menu-card.urgent-card").forEach(card => {
      card.addEventListener("click", () => {
        const phrase = card.getAttribute("data-phrase");
        const targetBoard = card.getAttribute("data-board");
        window.aacAudio.speak(phrase);
        const iconEl = card.querySelector(".menu-card-icon");
        const nameEl = card.querySelector(".menu-card-name");
        this.sentenceStrip.push({
          id: "urg_" + Date.now(),
          label: nameEl ? nameEl.textContent : phrase,
          speech: phrase,
          icon: iconEl ? iconEl.textContent : "🚨",
          category: "social"
        });
        this.renderSentenceStrip();
        this.closeMenuScreen();
        if (targetBoard) {
          this.navigateToBoard(targetBoard);
        }
      });
    });

    // Menu Screen Category Cards
    document.querySelectorAll(".menu-card.category-card").forEach(card => {
      card.addEventListener("click", () => {
        const boardId = card.getAttribute("data-nav-board");
        if (boardId) {
          this.navigateToBoard(boardId);
          this.closeMenuScreen();
          this.switchMainTab("aac");
        }
      });
    });

    // Menu Screen Learning Suite Cards
    document.querySelectorAll(".menu-card.suite-card").forEach(card => {
      card.addEventListener("click", (e) => {
        const tab = card.getAttribute("data-switch-tab");
        const sub = card.getAttribute("data-phonics-sub");
        if (tab) {
          e.preventDefault();
          this.switchMainTab(tab);
          if (sub) {
            this.phonicsTab = sub;
            this.renderPhonicsView();
          }
          this.closeMenuScreen();
        }
      });
    });

    // Menu Screen Tool Buttons
    const menuKiosk = document.getElementById("menu-btn-kiosk");
    if (menuKiosk) menuKiosk.addEventListener("click", () => { this.closeMenuScreen(); this.toggleFullscreen(); });

    const menuVoice = document.getElementById("menu-btn-voice-studio");
    if (menuVoice) menuVoice.addEventListener("click", () => { this.closeMenuScreen(); this.openVoiceStudioModal(); });

    const menuEdit = document.getElementById("menu-btn-edit-mode");
    if (menuEdit) menuEdit.addEventListener("click", () => { this.closeMenuScreen(); this.toggleEditModePrompt(); });

    const menuSlp = document.getElementById("menu-btn-slp-export");
    if (menuSlp) menuSlp.addEventListener("click", () => { this.closeMenuScreen(); this.exportSessionCSV(); });

    const menuHelp = document.getElementById("menu-btn-help-guide");
    if (menuHelp) menuHelp.addEventListener("click", () => { this.closeMenuScreen(); this.openHelpModal(); });

    const menuSettings = document.getElementById("menu-btn-open-settings");
    if (menuSettings) menuSettings.addEventListener("click", () => { this.closeMenuScreen(); this.openSettingsModal(); });

    // Settings & Quick Actions
    document.getElementById("btn-settings").addEventListener("click", () => this.openSettingsModal());
    document.getElementById("btn-edit-mode").addEventListener("click", () => this.toggleEditModePrompt());
    document.getElementById("btn-quick-back").addEventListener("click", () => this.navigateBack());

    // Narrator Avatar Pill -> Opens Afro-European Voice Studio
    const narratorPill = document.getElementById("btn-narrator-pill");
    if (narratorPill) {
      narratorPill.addEventListener("click", () => this.openVoiceStudioModal());
    }

    // Voice Studio Modal Open / Close / Save
    const openVoiceStudioBtn = document.getElementById("btn-open-voice-studio");
    if (openVoiceStudioBtn) {
      openVoiceStudioBtn.addEventListener("click", () => {
        this.el.settingsModal.style.display = "none";
        this.openVoiceStudioModal();
      });
    }

    const closeVoiceStudioBtn = document.getElementById("btn-close-voice-studio");
    if (closeVoiceStudioBtn) {
      closeVoiceStudioBtn.addEventListener("click", () => this.closeVoiceStudioModal());
    }

    const saveVoiceStudioBtn = document.getElementById("btn-save-voice-studio");
    if (saveVoiceStudioBtn) {
      saveVoiceStudioBtn.addEventListener("click", () => this.closeVoiceStudioModal());
    }

    const testVoiceStudioBtn = document.getElementById("btn-test-voice-studio");
    if (testVoiceStudioBtn) {
      testVoiceStudioBtn.addEventListener("click", () => window.aacAudio.speakIntro());
    }

    // Voice Studio Presets (Afro-British, Nigerian, South African, UK Multicultural)
    document.querySelectorAll(".preset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const presetKey = btn.getAttribute("data-preset");
        window.aacAudio.setPreset(presetKey);
        document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // Sync sliders
        const rateSlider = document.getElementById("studio-rate-slider");
        const pitchSlider = document.getElementById("studio-pitch-slider");
        if (rateSlider) rateSlider.value = window.aacAudio.rate;
        if (pitchSlider) pitchSlider.value = window.aacAudio.pitch;
        const rateLabel = document.getElementById("studio-label-rate");
        const pitchLabel = document.getElementById("studio-label-pitch");
        if (rateLabel) rateLabel.textContent = `${Math.round(window.aacAudio.rate * 100)}%`;
        if (pitchLabel) pitchLabel.textContent = `${Math.round(window.aacAudio.pitch * 100)}%`;

        window.aacAudio.playTone(520, 0.08, "triangle");
        window.aacAudio.speakIntro();
      });
    });

    // Voice Studio Dropdown Selection
    const studioVoiceSelect = document.getElementById("voice-studio-select");
    if (studioVoiceSelect) {
      studioVoiceSelect.addEventListener("change", (e) => {
        window.aacAudio.setVoiceByName(e.target.value);
        this.refreshVoiceUI();
        window.aacAudio.speak("Voice updated. I am ready!");
      });
    }

    // Voice Studio Rate & Pitch Sliders
    const studioRate = document.getElementById("studio-rate-slider");
    if (studioRate) {
      studioRate.addEventListener("input", (e) => {
        window.aacAudio.rate = parseFloat(e.target.value);
        document.getElementById("studio-label-rate").textContent = `${Math.round(window.aacAudio.rate * 100)}%`;
        window.aacAudio.saveSettings();
      });
    }

    const studioPitch = document.getElementById("studio-pitch-slider");
    if (studioPitch) {
      studioPitch.addEventListener("input", (e) => {
        window.aacAudio.pitch = parseFloat(e.target.value);
        document.getElementById("studio-label-pitch").textContent = `${Math.round(window.aacAudio.pitch * 100)}%`;
        window.aacAudio.saveSettings();
      });
    }

    // Voice Studio Test Phrases
    document.querySelectorAll(".test-phrase-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const phrase = btn.getAttribute("data-phrase");
        window.aacAudio.speak(phrase);
      });
    });

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
        this.refreshVoiceUI();
      });
    }

    const rateSlider = document.getElementById("setting-voice-rate");
    if (rateSlider) {
      rateSlider.addEventListener("input", (e) => {
        window.aacAudio.rate = parseFloat(e.target.value);
        document.getElementById("label-voice-rate").textContent = `${Math.round(window.aacAudio.rate * 100)}%`;
        window.aacAudio.saveSettings();
      });
    }

    const pitchSlider = document.getElementById("setting-voice-pitch");
    if (pitchSlider) {
      pitchSlider.addEventListener("input", (e) => {
        window.aacAudio.pitch = parseFloat(e.target.value);
        document.getElementById("label-voice-pitch").textContent = `${Math.round(window.aacAudio.pitch * 100)}%`;
        window.aacAudio.saveSettings();
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

    // Tablet Kiosk & Guided Access Controls
    const kioskBtn = document.getElementById("btn-kiosk-fullscreen");
    if (kioskBtn) {
      kioskBtn.addEventListener("click", () => this.toggleFullscreen());
    }

    const openKioskGuideBtn = document.getElementById("btn-open-kiosk-guide");
    if (openKioskGuideBtn) {
      openKioskGuideBtn.addEventListener("click", () => {
        if (this.el.settingsModal) this.el.settingsModal.style.display = "none";
        this.openKioskGuideModal();
      });
    }

    const closeKioskGuideBtn = document.getElementById("btn-close-kiosk-guide");
    if (closeKioskGuideBtn) {
      closeKioskGuideBtn.addEventListener("click", () => this.closeKioskGuideModal());
    }

    const startFullscreenNowBtn = document.getElementById("btn-start-fullscreen-now");
    if (startFullscreenNowBtn) {
      startFullscreenNowBtn.addEventListener("click", () => {
        this.toggleFullscreen(true);
        this.closeKioskGuideModal();
      });
    }

    const exportCsvBtn = document.getElementById("btn-export-session-csv");
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener("click", () => this.exportSessionCSV());
    }

    // Tablet Controls inside Settings Modal
    const touchModeSelect = document.getElementById("setting-touch-mode");
    if (touchModeSelect) {
      touchModeSelect.addEventListener("change", (e) => {
        this.touchMode = e.target.value;
        this.saveTabletSettings();
        this.renderCurrentBoard();
      });
    }

    const keyguardSelect = document.getElementById("setting-keyguard-mode");
    if (keyguardSelect) {
      keyguardSelect.addEventListener("change", (e) => {
        this.keyguardMode = e.target.value;
        this.saveTabletSettings();
        this.renderCurrentBoard();
      });
    }

    const dwellSlider = document.getElementById("setting-dwell-slider");
    if (dwellSlider) {
      dwellSlider.addEventListener("input", (e) => {
        this.dwellTimeMs = parseInt(e.target.value, 10);
        const label = document.getElementById("label-dwell-time");
        if (label) label.textContent = this.dwellTimeMs === 0 ? "0ms / Off" : `${this.dwellTimeMs}ms`;
        if (this.dwellTimeMs > 0 && this.touchMode !== "dwell") {
          this.touchMode = "dwell";
          if (touchModeSelect) touchModeSelect.value = "dwell";
        }
        this.saveTabletSettings();
        this.renderCurrentBoard();
      });
    }

    const repeatSlider = document.getElementById("setting-repeat-slider");
    if (repeatSlider) {
      repeatSlider.addEventListener("input", (e) => {
        this.repeatDelayMs = parseInt(e.target.value, 10);
        const label = document.getElementById("label-repeat-lockout");
        if (label) label.textContent = `${this.repeatDelayMs}ms`;
        this.saveTabletSettings();
      });
    }

    const orientationSelect = document.getElementById("setting-orientation-lock");
    if (orientationSelect) {
      orientationSelect.addEventListener("change", (e) => {
        this.orientationLock = e.target.value;
        this.applyOrientationLock();
        this.saveTabletSettings();
      });
    }

    const palmCheckbox = document.getElementById("setting-palm-rejection");
    if (palmCheckbox) {
      palmCheckbox.addEventListener("change", (e) => {
        this.palmRejection = e.target.checked;
        this.saveTabletSettings();
      });
    }

    // Fullscreen and orientation change listeners
    document.addEventListener("fullscreenchange", () => {
      this.isFullscreen = !!document.fullscreenElement;
      if (kioskBtn) {
        kioskBtn.classList.toggle("active", this.isFullscreen);
        const labelSpan = kioskBtn.querySelector("span:last-child");
        if (labelSpan) labelSpan.textContent = this.isFullscreen ? "Exit Kiosk" : "Tablet Kiosk";
      }
    });

    window.addEventListener("resize", () => {
      this.checkOrientationWarning();
    });
    window.addEventListener("orientationchange", () => {
      setTimeout(() => this.checkOrientationWarning(), 150);
    });
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

    window.aacAudio.onVoicesUpdated = () => {
      this.refreshVoiceUI();
    };

    this.refreshVoiceUI();
  }

  // =========================================================================
  // MAIN VIEW SWITCHER & CATEGORY NAVIGATION
  // =========================================================================

  switchMainTab(tab) {
    this.activeTab = tab;
    document.getElementById("btn-tab-aac").classList.toggle("active", tab === "aac");
    document.getElementById("btn-tab-phonics").classList.toggle("active", tab === "phonics");
    document.getElementById("btn-tab-wheels").classList.toggle("active", tab === "wheels");

    if (tab === "aac") {
      this.el.aacView.style.display = "flex";
      this.el.phonicsView.style.display = "none";
      this.el.wheelsView.style.display = "none";
      this.el.categoryNav.style.display = "flex";
      this.renderCurrentBoard();
    } else if (tab === "phonics") {
      this.el.aacView.style.display = "none";
      this.el.phonicsView.style.display = "flex";
      this.el.wheelsView.style.display = "none";
      this.el.categoryNav.style.display = "none";
      this.renderPhonicsView();
    } else if (tab === "wheels") {
      this.el.aacView.style.display = "none";
      this.el.phonicsView.style.display = "none";
      this.el.wheelsView.style.display = "flex";
      this.el.categoryNav.style.display = "none";
      this.renderFoodWheelView();
    }
  }

  renderCategoryNav() {
    const boards = window.aacData.getAllBoardSummaries();
    this.el.categoryNav.innerHTML = "";

    // 1. 🏠 Home Core Button
    const homeBtn = document.createElement("button");
    homeBtn.className = `category-tab ${this.currentBoardId === "core_master" ? "active" : ""}`;
    homeBtn.innerHTML = `<span>🏠</span> Home Core`;
    homeBtn.addEventListener("click", () => this.navigateToBoard("core_master"));
    this.el.categoryNav.appendChild(homeBtn);

    // 2. ⭐ Favorites & Learned Phrases Button
    const favBtn = document.createElement("button");
    favBtn.className = `category-tab ${this.currentBoardId === "board_favorites" ? "active" : ""}`;
    favBtn.style.borderColor = "var(--gh-accent-yellow)";
    favBtn.style.color = "#fef08a";
    favBtn.innerHTML = `<span>⭐</span> Favorites`;
    favBtn.addEventListener("click", () => this.navigateToBoard("board_favorites"));
    this.el.categoryNav.appendChild(favBtn);

    // 3. Filter out core densities (they are switched via the density badge) and sort topics
    const topicBoards = boards.filter(b => b.id !== "core_starter" && b.id !== "core_master");

    const priorityOrder = [
      "urgent_needs",
      "food_drinks",
      "feelings",
      "actions_play",
      "people_family",
      "places"
    ];

    topicBoards.sort((a, b) => {
      const idxA = priorityOrder.indexOf(a.id);
      const idxB = priorityOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    const categoryIcons = {
      urgent_needs: "🚨",
      food_drinks: "🍎",
      feelings: "😊",
      actions_play: "🎮",
      people_family: "👨‍👩‍👦",
      places: "🏙️"
    };

    topicBoards.forEach(b => {
      const tab = document.createElement("button");
      tab.className = `category-tab ${b.id === this.currentBoardId ? "active" : ""}`;
      const icon = categoryIcons[b.id] || "📂";
      tab.innerHTML = `<span>${icon}</span> ${b.name}`;
      tab.addEventListener("click", () => this.navigateToBoard(b.id));
      this.el.categoryNav.appendChild(tab);
    });

    // 4. All Categories / Open Menu Button
    const allMenuBtn = document.createElement("button");
    allMenuBtn.className = "category-tab";
    allMenuBtn.style.borderColor = "var(--gh-accent-blue)";
    allMenuBtn.style.color = "#58a6ff";
    allMenuBtn.innerHTML = `<span>☰</span> All Categories...`;
    allMenuBtn.addEventListener("click", () => this.openMenuScreen());
    this.el.categoryNav.appendChild(allMenuBtn);

    // 5. Add New Board Button (Therapist mode)
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
    if (this.currentBoardId === "board_favorites") {
      this.el.boardTitleBadge.textContent = "⭐ My Favorites & Learned Phrases";
      this.el.aacGrid.className = `aac-grid grid-cols-${this.gridDensity || 4} keyguard-${this.keyguardMode || 'none'}`;
      this.el.aacGrid.innerHTML = "";

      const topPhrases = window.smartFavorites.getTopPhrases(8);
      const topWords = window.smartFavorites.getTopWords(12);

      // Render Pinned/Learned Whole Phrases first
      topPhrases.forEach((phrase) => {
        const phraseBtn = document.createElement("button");
        phraseBtn.className = `aac-tile cat-${phrase.category || "social"} lacquer-sheen`;
        phraseBtn.style.borderStyle = "dashed";
        phraseBtn.style.borderWidth = "3px";
        phraseBtn.innerHTML = `
          <span class="tile-folder-indicator" style="background:rgba(234,179,8,0.25); color:#eab308;">FAVORITE PHRASE ⭐</span>
          <div class="tile-icon-wrap">
            <span class="tile-icon">${phrase.icon || "💬"}</span>
          </div>
          <span class="tile-label" style="font-size:0.8rem;">${phrase.label || phrase.text}</span>
        `;
        phraseBtn.addEventListener("click", () => {
          window.aacAudio.playTone(560, 0.08, "triangle");
          window.aacAudio.speak(phrase.text);
          if (phrase.chips) {
            phrase.chips.forEach(c => this.sentenceStrip.push(JSON.parse(JSON.stringify(c))));
          } else {
            this.sentenceStrip.push({ id: "fav_" + Date.now(), label: phrase.text.toUpperCase(), speech: phrase.text, icon: phrase.icon || "⭐", category: "social" });
          }
          this.renderSentenceStrip();
        });
        this.el.aacGrid.appendChild(phraseBtn);
      });

      // Render Top Learned Single Words
      topWords.forEach((tile) => {
        const tileBtn = document.createElement("button");
        tileBtn.className = `aac-tile cat-${tile.category} lacquer-sheen`;
        tileBtn.innerHTML = `
          <div class="tile-icon-wrap">
            <span class="tile-icon">${tile.icon || "💬"}</span>
          </div>
          <span class="tile-label">${tile.label}</span>
        `;
        this.attachTileInteraction(tileBtn, tile);
        this.el.aacGrid.appendChild(tileBtn);
      });

      return;
    }

    const board = window.aacData.getBoard(this.currentBoardId);
    this.updateDensityBadgeText();
    
    // Set grid columns and keyguard spacing mode
    this.el.aacGrid.className = `aac-grid grid-cols-${this.gridDensity || board.columns || 4} keyguard-${this.keyguardMode || 'none'}`;
    this.el.aacGrid.innerHTML = "";

    board.tiles.forEach((tile, index) => {
      const tileBtn = document.createElement("button");
      tileBtn.className = `aac-tile cat-${tile.category} lacquer-sheen ${tile.targetBoard ? "cat-folder" : ""}`;
      tileBtn.setAttribute("data-index", index);
      tileBtn.setAttribute("data-tile-id", tile.id);
      tileBtn.setAttribute("aria-label", tile.label);

      let folderIndicator = tile.targetBoard ? `<span class="tile-folder-indicator">FOLDER 📂</span>` : "";

      tileBtn.innerHTML = `
        ${folderIndicator}
        <div class="tile-icon-wrap">
          <span class="tile-icon">${tile.icon || "💬"}</span>
        </div>
        <span class="tile-label">${tile.label}</span>
      `;

      // Multi-Touch Access Profile (Contact, Release, or Dwell Timer)
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
    // Palm & Edge Rejection Filter
    const isRejectedPalmOrEdge = (e) => {
      if (!this.palmRejection) return false;
      const edgeThreshold = 14;
      if (e.clientX < edgeThreshold || e.clientX > (window.innerWidth - edgeThreshold) ||
          e.clientY < edgeThreshold || e.clientY > (window.innerHeight - edgeThreshold)) {
        return true;
      }
      if (e.width && e.width > 45 && e.height && e.height > 45) {
        return true;
      }
      return false;
    };

    let dwellTimer = null;
    let isTouching = false;

    // Helper to ensure animated SVG radial countdown ring
    const ensureDwellRing = () => {
      let ring = btn.querySelector(".dwell-progress-ring");
      if (!ring) {
        ring = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        ring.setAttribute("class", "dwell-progress-ring");
        ring.setAttribute("viewBox", "0 0 32 32");
        ring.innerHTML = `
          <circle class="dwell-circle-bg" cx="16" cy="16" r="12"></circle>
          <circle class="dwell-circle-fill" cx="16" cy="16" r="12"></circle>
        `;
        btn.appendChild(ring);
      }
      return ring;
    };

    const cancelDwell = () => {
      if (dwellTimer) {
        clearTimeout(dwellTimer);
        dwellTimer = null;
      }
      btn.classList.remove("dwell-active");
      const ring = btn.querySelector(".dwell-progress-ring");
      if (ring) {
        const fill = ring.querySelector(".dwell-circle-fill");
        if (fill) {
          fill.style.transition = "none";
          fill.style.strokeDashoffset = "75";
        }
      }
    };

    // Pointer Down Handler
    btn.addEventListener("pointerdown", (e) => {
      if (isRejectedPalmOrEdge(e)) {
        e.preventDefault();
        return;
      }

      isTouching = true;

      // Shift+Click in Edit Mode
      if (this.editMode && e.shiftKey) {
        this.openEditTileModal(tile);
        return;
      }

      if (this.touchMode === "contact") {
        // Immediate Activation on Touch
        this.activateTile(tile);
        btn.classList.add("tile-pressed");
        setTimeout(() => btn.classList.remove("tile-pressed"), 140);
      } else if (this.touchMode === "release") {
        // Touch on Release (Drag & Lift) - give immediate audio/visual feedback on touch
        btn.classList.add("tile-pressed");
        window.aacAudio.playTone(420, 0.04, "sine");
      } else if (this.touchMode === "dwell" || this.dwellTimeMs > 0) {
        // Dwell / Hold Duration Timer with Visual SVG Ring Countdown
        btn.classList.add("tile-pressed", "dwell-active");
        window.aacAudio.playTone(380, 0.03, "triangle");

        const ring = ensureDwellRing();
        const fill = ring.querySelector(".dwell-circle-fill");
        const duration = this.dwellTimeMs || 800;
        if (fill) {
          fill.style.transition = "none";
          fill.style.strokeDashoffset = "75";
          // Trigger reflow
          fill.getBoundingClientRect();
          fill.style.transition = `stroke-dashoffset ${duration}ms linear`;
          fill.style.strokeDashoffset = "0";
        }

        dwellTimer = setTimeout(() => {
          this.activateTile(tile);
          cancelDwell();
          btn.classList.remove("tile-pressed");
        }, duration);
      }
    });

    // Pointer Up Handler
    btn.addEventListener("pointerup", (e) => {
      if (!isTouching) return;
      isTouching = false;

      if (this.touchMode === "release") {
        btn.classList.remove("tile-pressed");
        if (!isRejectedPalmOrEdge(e)) {
          this.activateTile(tile);
        }
      } else if (this.touchMode === "dwell" || this.dwellTimeMs > 0) {
        cancelDwell();
        btn.classList.remove("tile-pressed");
      }
    });

    // Pointer Leave & Cancel Handlers
    btn.addEventListener("pointerleave", () => {
      if (isTouching) {
        isTouching = false;
        btn.classList.remove("tile-pressed");
        cancelDwell();
      }
    });

    btn.addEventListener("pointercancel", () => {
      isTouching = false;
      btn.classList.remove("tile-pressed");
      cancelDwell();
    });

    // Assistive Switch Scanning & Accessibility Click Handler
    btn.addEventListener("click", (e) => {
      // Ignore if already triggered by recent pointerdown or dwell
      if (Date.now() - this.lastActivationTime < 200) return;
      if (this.editMode && e.shiftKey) {
        this.openEditTileModal(tile);
      } else {
        this.activateTile(tile);
      }
    });

    // Long press for editing tile in edit mode
    let pressTimer;
    btn.addEventListener("touchstart", () => {
      pressTimer = setTimeout(() => {
        if (this.editMode) this.openEditTileModal(tile);
      }, 700);
    }, { passive: true });
    btn.addEventListener("touchend", () => clearTimeout(pressTimer));
  }

  activateTile(tile) {
    // Anti-tremor lockout repeat delay
    const now = Date.now();
    if (this.lastActivatedTileId === tile.id && (now - this.lastActivationTime) < this.repeatDelayMs) {
      // Suppress involuntary micro-tremor repeats
      return;
    }
    this.lastActivationTime = now;
    this.lastActivatedTileId = tile.id;

    // Log activation event for Speech-Language Pathologist (SLP) IEP documentation
    this.sessionLog.push({
      timestamp: new Date().toISOString(),
      tileId: tile.id,
      label: tile.label,
      category: tile.category || "misc",
      speech: tile.speech || tile.label,
      boardId: this.currentBoardId,
      touchMode: this.touchMode,
      elapsedSec: Math.round((now - this.sessionStartTime) / 1000)
    });

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

    // If it triggers opening food decision wheel
    if (tile.action === "open_wheel") {
      setTimeout(() => {
        this.switchMainTab("wheels");
      }, 250);
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

    // Learn this word!
    if (window.smartFavorites) {
      window.smartFavorites.recordWordUsage(tile);
      this.renderFavoritesRibbon();
    }

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
    this.sentenceStrip.forEach((chip) => {
      const chipEl = document.createElement("div");
      chipEl.className = `strip-chip cat-${chip.category} lacquer-sheen`;
      chipEl.innerHTML = `
        <span class="strip-chip-icon">${chip.icon || "💬"}</span>
        <span class="strip-chip-text">${chip.label}</span>
      `;
      // Click chip to speak single word again
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

    // Learn multi-word phrase!
    if (window.smartFavorites) {
      window.smartFavorites.recordSentenceUsage(this.sentenceStrip);
      this.renderFavoritesRibbon();
    }
  }

  starCurrentSentence() {
    if (this.sentenceStrip.length === 0) {
      alert("Build a sentence first to save it to your Favorites!");
      return;
    }
    const pinned = window.smartFavorites.pinSentence(this.sentenceStrip);
    if (pinned) {
      window.aacAudio.playCelebrationChime();
      if (typeof confetti === "function") {
        confetti({ particleCount: 35, spread: 70, origin: { y: 0.25 } });
      }
      window.aacAudio.speak(`Saved "${pinned.text}" to your favorites!`);
      this.renderFavoritesRibbon();
      if (this.currentBoardId === "board_favorites") {
        this.renderCurrentBoard();
      }
    }
  }

  renderFavoritesRibbon() {
    if (!this.el.favoritesRibbon || !window.smartFavorites) return;
    const topPhrases = window.smartFavorites.getTopPhrases(4);
    const topWords = window.smartFavorites.getTopWords(5);

    this.el.favoritesRibbon.innerHTML = `
      <div class="fav-ribbon-label">
        <span>⭐</span> Quick Favorites:
      </div>
    `;

    // Render quick phrases
    topPhrases.forEach(p => {
      const chip = document.createElement("button");
      chip.className = "fav-chip phrase-chip";
      chip.innerHTML = `<span>${p.icon || "⭐"}</span><span>"${p.text}"</span>`;
      chip.title = "Tap to speak this favorite phrase aloud";
      chip.addEventListener("click", () => {
        window.aacAudio.playTone(540, 0.08, "triangle");
        window.aacAudio.speak(p.text);
        if (p.chips) {
          p.chips.forEach(c => this.sentenceStrip.push(JSON.parse(JSON.stringify(c))));
        } else {
          this.sentenceStrip.push({ id: "fav_" + Date.now(), label: p.text.toUpperCase(), speech: p.text, icon: p.icon || "⭐", category: "social" });
        }
        this.renderSentenceStrip();
      });
      this.el.favoritesRibbon.appendChild(chip);
    });

    // Render top learned words
    topWords.forEach(w => {
      const chip = document.createElement("button");
      chip.className = `fav-chip cat-${w.category}`;
      chip.innerHTML = `<span>${w.icon || "💬"}</span><span>${w.label}</span>`;
      chip.title = `Frequently used word: ${w.label}`;
      chip.addEventListener("click", () => {
        this.activateTile(w);
      });
      this.el.favoritesRibbon.appendChild(chip);
    });
  }

  clearSentence() {
    if (this.sentenceStrip.length > 0) {
      this.lastClearedSentence = [...this.sentenceStrip];
      this.sentenceStrip = [];
      this.renderSentenceStrip();
      this.showUndoButton();
      window.aacAudio.playTone(280, 0.08, "sine");
    }
  }

  showUndoButton() {
    if (!this.el.undoBtn) return;
    this.el.undoBtn.style.display = "inline-flex";
    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.undoTimer = setTimeout(() => {
      this.hideUndoButton();
    }, 8000); // 8-second recovery window for young communicators
  }

  hideUndoButton() {
    if (this.el.undoBtn) {
      this.el.undoBtn.style.display = "none";
    }
    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
      this.undoTimer = null;
    }
  }

  undoClearSentence() {
    if (this.lastClearedSentence && this.lastClearedSentence.length > 0) {
      this.sentenceStrip = [...this.lastClearedSentence];
      this.lastClearedSentence = null;
      this.hideUndoButton();
      this.renderSentenceStrip();
      window.aacAudio.playTone(560, 0.12, "triangle");
      window.aacAudio.speak("Restored sentence");
    }
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
    this.syncTabletUI();
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

  openVoiceStudioModal() {
    this.refreshVoiceUI();
    if (this.el.voiceStudioModal) {
      this.el.voiceStudioModal.style.display = "flex";
    }
  }

  closeVoiceStudioModal() {
    if (this.el.voiceStudioModal) {
      this.el.voiceStudioModal.style.display = "none";
    }
    this.refreshVoiceUI();
  }

  refreshVoiceUI() {
    const voices = window.aacAudio.getVoiceList();
    const curVoice = window.aacAudio.selectedVoice;
    const curPreset = window.aacAudio.currentPreset || "afro_euro";

    // Update active preset button highlighting
    document.querySelectorAll(".preset-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-preset") === curPreset);
    });

    // Update active voice banner in Voice Studio Modal
    const titleEl = document.getElementById("active-voice-title");
    const badgeEl = document.getElementById("active-voice-badge");
    const engineEl = document.getElementById("active-voice-engine-name");
    if (titleEl) {
      if (curPreset === "screen_reader") titleEl.textContent = "Screen Reader Voice (System Synchronized)";
      else if (curPreset === "afro_euro") titleEl.textContent = "Amina (Afro-British / Euro-African)";
      else if (curPreset === "nigerian") titleEl.textContent = "Zainab (Nigerian / West African English)";
      else if (curPreset === "south_african") titleEl.textContent = "Nandi (South African English)";
      else if (curPreset === "uk_multicultural") titleEl.textContent = "Serena (UK Multicultural English)";
      else titleEl.textContent = "Amina (Afro-European Voice)";
    }
    if (badgeEl) {
      if (curPreset === "screen_reader") {
        badgeEl.textContent = "SCREEN READER ● SYNCED";
        badgeEl.style.background = "#0284c7";
      } else {
        badgeEl.textContent = curVoice ? (curVoice.localService ? "LOCAL ● ACTIVE" : "NATURAL ● ACTIVE") : "ACTIVE";
        badgeEl.style.background = "#238636";
      }
    }
    if (engineEl) {
      engineEl.textContent = curVoice ? `${curVoice.name} (${curVoice.lang})` : "Default System Screen Reader";
    }

    // Sync sliders
    const rateSlider = document.getElementById("studio-rate-slider");
    const pitchSlider = document.getElementById("studio-pitch-slider");
    if (rateSlider) rateSlider.value = window.aacAudio.rate;
    if (pitchSlider) pitchSlider.value = window.aacAudio.pitch;
    const rateLabel = document.getElementById("studio-label-rate");
    const pitchLabel = document.getElementById("studio-label-pitch");
    if (rateLabel) rateLabel.textContent = `${Math.round(window.aacAudio.rate * 100)}%`;
    if (pitchLabel) pitchLabel.textContent = `${Math.round(window.aacAudio.pitch * 100)}%`;

    // Populate voice studio select dropdown
    const studioSelect = document.getElementById("voice-studio-select");
    if (studioSelect) {
      studioSelect.innerHTML = voices.map(v => `
        <option value="${v.name}" ${v.isDefault ? "selected" : ""}>
          ${v.badge} ${v.name} (${v.lang})
        </option>
      `).join("");
    }

    // Populate Settings voice dropdown
    this.populateVoiceSelect();

    // Update top header narrator pill label
    const pill = document.getElementById("btn-narrator-pill");
    if (pill) {
      const span = pill.querySelector("span:not([style*='color'])");
      if (span) {
        if (curPreset === "screen_reader") span.textContent = "Screen Reader Voice";
        else if (curPreset === "afro_euro") span.textContent = "Amina (Afro-Euro Voice)";
        else if (curPreset === "nigerian") span.textContent = "Zainab (Nigerian Voice)";
        else if (curPreset === "south_african") span.textContent = "Nandi (South African Voice)";
        else span.textContent = "Amina (Afro-Euro Voice)";
      }
    }
  }

  populateVoiceSelect() {
    const select = document.getElementById("setting-voice-select");
    if (!select) return;
    const voices = window.aacAudio.getVoiceList();
    select.innerHTML = voices.map(v => `
      <option value="${v.name}" ${v.isDefault ? "selected" : ""}>
        ${v.badge} ${v.name} (${v.lang})
      </option>
    `).join("");
  }

  setGridDensity(columns) {
    this.gridDensity = columns;
    const board = window.aacData.getBoard(this.currentBoardId);
    if (board) {
      board.columns = columns;
      window.aacData.saveBoards();
    }
    this.updateDensityBadgeText();
    this.renderCurrentBoard();
  }

  updateDensityBadgeText() {
    if (!this.el.boardTitleBadge) return;
    const board = window.aacData.getBoard(this.currentBoardId);
    const boardName = board ? board.name : "Core";
    const label = this.gridDensity === 4 ? "Starter 12" : (this.gridDensity === 8 ? "Tablet Full 48" : "Universal 36");
    this.el.boardTitleBadge.textContent = `${boardName} (${label}) ▾`;
  }

  cycleGridDensity() {
    // 1-Tap Quick Grid Density Switcher (Starter 4 cols -> Universal 6 cols -> Tablet Full 8 cols -> 4 cols)
    let nextCols = 6;
    if (this.gridDensity === 4) {
      nextCols = 6;
    } else if (this.gridDensity === 6) {
      nextCols = 8;
    } else {
      nextCols = 4;
    }
    this.setGridDensity(nextCols);
    const gridSelect = document.getElementById("setting-grid-density");
    if (gridSelect) gridSelect.value = nextCols;
    window.aacAudio.playTone(480, 0.08, "sine");
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

  // =========================================================================
  // INTERACTIVE FOOD DECISION WHEELS
  // =========================================================================

  renderFoodWheelView() {
    const container = this.el.wheelsView;
    const currentWheel = window.foodWheelManager.getActiveWheel();

    container.innerHTML = `
      <div class="phonics-panel" style="max-width:1100px; margin:0 auto; padding:16px; gap:16px;">
        <div class="phonics-header" style="flex-wrap:wrap; gap:12px;">
          <div class="brand-section">
            <div class="brand-logo-icon" style="background:linear-gradient(135deg, #f0883e 0%, #22c55e 100%);">🎡</div>
            <div>
              <h2 style="font-size:1.15rem; font-weight:700;">Interactive Food Decision Wheels</h2>
              <p style="font-size:0.78rem; color:var(--gh-text-secondary);">Spin to decide: Favorite Snacks, Restaurants & Takeout, or Homecooked Meals!</p>
            </div>
          </div>
          <div class="phonics-nav-tabs">
            <button class="phonics-tab ${window.foodWheelManager.activeWheelId === 'snacks' ? 'active' : ''}" id="wheel-tab-snacks">🍿 Favorite Snacks</button>
            <button class="phonics-tab ${window.foodWheelManager.activeWheelId === 'restaurants' ? 'active' : ''}" id="wheel-tab-restaurants">🍔 Restaurants & Takeout</button>
            <button class="phonics-tab ${window.foodWheelManager.activeWheelId === 'homecooked' ? 'active' : ''}" id="wheel-tab-homecooked">🍲 Homecooked Meals</button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; align-items:start;" id="wheels-grid-layout">
          <!-- Left: Wheel Canvas & Giant Spin Button -->
          <div class="blending-board-card" style="padding:16px; gap:14px;">
            <div style="position:relative; width:100%; max-width:440px; aspect-ratio:1/1; display:flex; align-items:center; justify-content:center;">
              <canvas id="food-wheel-canvas" width="440" height="440" style="width:100%; height:100%; max-width:440px; max-height:440px; cursor:pointer;"></canvas>
            </div>

            <div style="display:flex; gap:12px; width:100%; justify-content:center;">
              <button class="blend-action-btn" id="btn-spin-wheel" style="font-size:1.15rem; padding:14px 36px;">
                <span>🎡 SPIN THE WHEEL</span>
              </button>
            </div>
            <p style="font-size:0.75rem; color:var(--gh-text-muted);">Tip: Press Spacebar or tap wheel directly to spin!</p>
          </div>

          <!-- Right: Winner Announcement Card & Customizer -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            <!-- Winner Card -->
            <div class="blending-board-card" id="wheel-winner-card" style="align-items:center; text-align:center; border-color:${currentWheel.themeColor};">
              <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:${currentWheel.themeColor};">Decision Result:</span>
              <div id="winner-display-icon" style="font-size:3.8rem; margin:4px 0;">${window.foodWheelManager.lastWinner ? window.foodWheelManager.lastWinner.icon : currentWheel.icon}</div>
              <h3 id="winner-display-name" style="font-size:1.4rem; font-weight:800; color:#fff;">
                ${window.foodWheelManager.lastWinner ? window.foodWheelManager.lastWinner.name : "Ready to Spin!"}
              </h3>
              <p id="winner-display-sub" style="font-size:0.85rem; color:var(--gh-text-secondary); margin-bottom:6px;">
                ${window.foodWheelManager.lastWinner ? "Amina announced your choice!" : "Tap 'SPIN THE WHEEL' to let the wheel pick."}
              </p>

              <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; width:100%;">
                <button class="header-btn accent-btn" id="btn-winner-to-aac" style="padding:10px 18px; font-size:0.9rem;">
                  <span>➕ I Want This! (Send to AAC)</span>
                </button>
                <button class="header-btn" id="btn-winner-speak" style="padding:10px 14px; font-size:0.9rem;">
                  <span>🔊 Announce Choice</span>
                </button>
              </div>
            </div>

            <!-- Customizer / Family Favorites Manager -->
            <div class="blending-board-card" style="align-items:flex-start; padding:16px;">
              <div style="display:flex; justify-content:space-between; width:100%; align-items:center; border-bottom:1px solid var(--gh-border-muted); padding-bottom:8px;">
                <span style="font-size:0.85rem; font-weight:700; color:var(--gh-text-primary);">Customize ${currentWheel.name}</span>
                <button class="header-btn" id="btn-reset-wheel" style="font-size:0.7rem; height:26px; padding:0 8px;">Reset Default</button>
              </div>

              <!-- List of items -->
              <div style="display:flex; flex-wrap:wrap; gap:6px; max-height:140px; overflow-y:auto; width:100%; margin:8px 0;" id="wheel-items-list">
                ${currentWheel.items.map(item => `
                  <span style="display:inline-flex; align-items:center; gap:6px; background:var(--gh-canvas-inset); border:1px solid var(--gh-border-default); border-radius:6px; padding:3px 8px; font-size:0.78rem;">
                    <span>${item.icon}</span>
                    <span>${item.name}</span>
                    <button class="delete-wheel-item-btn" data-id="${item.id}" style="background:none; border:none; color:#f85149; cursor:pointer; font-size:0.85rem; line-height:1; padding-left:4px;">&times;</button>
                  </span>
                `).join("")}
              </div>

              <!-- Add custom item form -->
              <div style="display:flex; gap:6px; width:100%; margin-top:4px;">
                <input type="text" id="new-food-name" class="form-input" placeholder="Add custom favorite (e.g. Mac & Cheese)" style="flex:1; font-size:0.82rem; padding:6px 10px;">
                <input type="text" id="new-food-icon" class="form-input" placeholder="Emoji 🍕" style="width:70px; font-size:0.82rem; padding:6px 8px; text-align:center;">
                <button class="header-btn accent-btn" id="btn-add-food-item" style="padding:0 14px; font-size:0.8rem;">Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Canvas init
    const canvas = document.getElementById("food-wheel-canvas");
    window.foodWheelManager.initCanvas(canvas);

    // Tab buttons
    document.getElementById("wheel-tab-snacks").onclick = () => {
      window.foodWheelManager.setWheel("snacks");
      this.renderFoodWheelView();
    };
    document.getElementById("wheel-tab-restaurants").onclick = () => {
      window.foodWheelManager.setWheel("restaurants");
      this.renderFoodWheelView();
    };
    document.getElementById("wheel-tab-homecooked").onclick = () => {
      window.foodWheelManager.setWheel("homecooked");
      this.renderFoodWheelView();
    };

    // Spin trigger
    const triggerSpin = () => {
      const spinBtn = document.getElementById("btn-spin-wheel");
      if (spinBtn) spinBtn.disabled = true;

      window.foodWheelManager.spin((winner) => {
        if (spinBtn) spinBtn.disabled = false;
        const iconEl = document.getElementById("winner-display-icon");
        const nameEl = document.getElementById("winner-display-name");
        const subEl = document.getElementById("winner-display-sub");
        if (iconEl) iconEl.textContent = winner.icon;
        if (nameEl) nameEl.textContent = winner.name;
        if (subEl) subEl.textContent = `Selected for ${currentWheel.name}!`;
      });
    };

    document.getElementById("btn-spin-wheel").onclick = triggerSpin;
    canvas.onclick = triggerSpin;

    // Send Winner to AAC Sentence Strip
    document.getElementById("btn-winner-to-aac").onclick = () => {
      const winner = window.foodWheelManager.lastWinner || currentWheel.items[0];
      // Push: I -> WANT -> [FOOD] -> PLEASE
      this.sentenceStrip.push(
        { id: "w_i_" + Date.now(), label: "I", speech: "I", icon: "👤", category: "people" },
        { id: "w_want_" + Date.now(), label: "WANT", speech: "want", icon: "🤲", category: "verb" },
        { id: "w_food_" + Date.now(), label: winner.name.toUpperCase(), speech: winner.name, icon: winner.icon, category: "noun" },
        { id: "w_please_" + Date.now(), label: "PLEASE", speech: "please", icon: "🙏", category: "social" }
      );
      this.switchMainTab("aac");
      this.renderSentenceStrip();
    };

    // Announce Choice Again
    document.getElementById("btn-winner-speak").onclick = () => {
      const winner = window.foodWheelManager.lastWinner || currentWheel.items[0];
      window.aacAudio.speak(`I would love ${winner.name} please!`);
    };

    // Delete item
    container.querySelectorAll(".delete-wheel-item-btn").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-id");
        window.foodWheelManager.deleteItem(window.foodWheelManager.activeWheelId, id);
        this.renderFoodWheelView();
      };
    });

    // Add Item
    document.getElementById("btn-add-food-item").onclick = () => {
      const name = document.getElementById("new-food-name").value.trim();
      const icon = document.getElementById("new-food-icon").value.trim() || "🍽️";
      if (!name) return;
      const palette = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];
      const randomColor = palette[Math.floor(Math.random() * palette.length)];
      window.foodWheelManager.addItem(window.foodWheelManager.activeWheelId, name, icon, randomColor);
      this.renderFoodWheelView();
    };

    // Reset Wheel
    document.getElementById("btn-reset-wheel").onclick = () => {
      if (confirm(`Reset ${currentWheel.name} back to default menu items?`)) {
        window.foodWheelManager.resetWheelToDefault(window.foodWheelManager.activeWheelId);
        this.renderFoodWheelView();
      }
    };
  }

  // =========================================================================
  // PROFESSIONAL TABLET & MOTOR ACCESS METHODS
  // =========================================================================

  loadTabletSettings() {
    try {
      const saved = localStorage.getItem("AMINA_TABLET_SETTINGS");
      if (saved) {
        const cfg = JSON.parse(saved);
        if (cfg.touchMode) this.touchMode = cfg.touchMode;
        if (cfg.repeatDelayMs !== undefined) this.repeatDelayMs = cfg.repeatDelayMs;
        if (cfg.keyguardMode) this.keyguardMode = cfg.keyguardMode;
        if (cfg.orientationLock) this.orientationLock = cfg.orientationLock;
        if (cfg.palmRejection !== undefined) this.palmRejection = cfg.palmRejection;
        if (cfg.dwellTimeMs !== undefined) this.dwellTimeMs = cfg.dwellTimeMs;
        if (cfg.gridDensity) this.gridDensity = cfg.gridDensity;
      }
    } catch (e) {
      console.warn("Could not load tablet settings", e);
    }
  }

  saveTabletSettings() {
    try {
      const cfg = {
        touchMode: this.touchMode,
        repeatDelayMs: this.repeatDelayMs,
        keyguardMode: this.keyguardMode,
        orientationLock: this.orientationLock,
        palmRejection: this.palmRejection,
        dwellTimeMs: this.dwellTimeMs,
        gridDensity: this.gridDensity
      };
      localStorage.setItem("AMINA_TABLET_SETTINGS", JSON.stringify(cfg));
    } catch (e) {
      console.warn("Could not save tablet settings", e);
    }
  }

  syncTabletUI() {
    const touchSelect = document.getElementById("setting-touch-mode");
    if (touchSelect) touchSelect.value = this.touchMode;

    const keyguardSelect = document.getElementById("setting-keyguard-mode");
    if (keyguardSelect) keyguardSelect.value = this.keyguardMode;

    const dwellSlider = document.getElementById("setting-dwell-slider");
    if (dwellSlider) dwellSlider.value = this.dwellTimeMs;
    const dwellLabel = document.getElementById("label-dwell-time");
    if (dwellLabel) dwellLabel.textContent = this.dwellTimeMs === 0 ? "0ms / Off" : `${this.dwellTimeMs}ms`;

    const repeatSlider = document.getElementById("setting-repeat-slider");
    if (repeatSlider) repeatSlider.value = this.repeatDelayMs;
    const repeatLabel = document.getElementById("label-repeat-lockout");
    if (repeatLabel) repeatLabel.textContent = `${this.repeatDelayMs}ms`;

    const orientationSelect = document.getElementById("setting-orientation-lock");
    if (orientationSelect) orientationSelect.value = this.orientationLock;

    const palmCheckbox = document.getElementById("setting-palm-rejection");
    if (palmCheckbox) palmCheckbox.checked = this.palmRejection;

    const gridDensitySelect = document.getElementById("setting-grid-density");
    if (gridDensitySelect) gridDensitySelect.value = this.gridDensity;
  }

  toggleFullscreen(forceTrue = false) {
    const doc = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (doc.requestFullscreen) {
        doc.requestFullscreen().catch(err => console.warn("Fullscreen request error:", err));
      } else if (doc.webkitRequestFullscreen) {
        doc.webkitRequestFullscreen();
      }
      this.isFullscreen = true;
    } else if (!forceTrue) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn("Exit fullscreen error:", err));
      } else if (document.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
      this.isFullscreen = false;
    }
    this.applyOrientationLock();
  }

  applyOrientationLock() {
    if (screen.orientation && screen.orientation.lock) {
      if (this.orientationLock === "landscape") {
        screen.orientation.lock("landscape").catch(() => {});
      } else if (this.orientationLock === "portrait") {
        screen.orientation.lock("portrait").catch(() => {});
      } else {
        screen.orientation.unlock();
      }
    }
    this.checkOrientationWarning();
  }

  checkOrientationWarning() {
    if (this.orientationLock === "landscape") {
      const isPortrait = window.innerHeight > window.innerWidth;
      document.body.classList.toggle("orientation-warning", isPortrait);
    } else if (this.orientationLock === "portrait") {
      const isLandscape = window.innerWidth > window.innerHeight;
      document.body.classList.toggle("orientation-warning", isLandscape);
    } else {
      document.body.classList.remove("orientation-warning");
    }
  }

  openKioskGuideModal() {
    if (this.el.kioskGuideModal) {
      this.el.kioskGuideModal.style.display = "flex";
    }
  }

  closeKioskGuideModal() {
    if (this.el.kioskGuideModal) {
      this.el.kioskGuideModal.style.display = "none";
    }
  }

  exportSessionCSV() {
    if (this.sessionLog.length === 0) {
      alert("No communication events recorded in this session yet. Tap symbols to generate therapy data!");
      return;
    }
    const headers = ["Timestamp", "Elapsed_Sec", "Board_ID", "Tile_ID", "Label", "Category", "Spoken_Text", "Touch_Mode"];
    const rows = this.sessionLog.map(e => [
      `"${e.timestamp}"`,
      e.elapsedSec,
      `"${e.boardId}"`,
      `"${e.tileId}"`,
      `"${(e.label || "").replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${(e.speech || "").replace(/"/g, '""')}"`,
      `"${e.touchMode}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `amina_slp_session_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    window.aacAudio.playCelebrationChime();
  }

  // =========================================================================
  // QUICK SEARCH / SYMBOL FINDER & MOTOR PATHWAY LOCATOR
  // =========================================================================

  openSearchModal() {
    if (!this.el.searchModal) return;
    this.el.searchModal.style.display = "flex";
    if (this.el.symbolSearchInput) {
      this.el.symbolSearchInput.value = "";
      setTimeout(() => this.el.symbolSearchInput.focus(), 80);
    }
    this.performSearch("");
  }

  closeSearchModal() {
    if (this.el.searchModal) {
      this.el.searchModal.style.display = "none";
    }
  }

  performSearch(rawQuery) {
    if (!this.el.searchResultsGrid) return;
    const query = (rawQuery || "").trim().toLowerCase();
    const allBoards = (typeof window.aacData.getAllBoards === "function") ? window.aacData.getAllBoards() : Object.values(window.aacData.boards || {});
    const results = [];
    const seenKeys = new Set();

    // Iterate through all boards and tiles
    for (const board of allBoards) {
      if (!board.tiles) continue;
      for (const tile of board.tiles) {
        const label = (tile.label || "").toLowerCase();
        const speech = (tile.speech || "").toLowerCase();
        if (!query || label.includes(query) || speech.includes(query)) {
          const key = `${tile.label}_${board.id}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            results.push({
              tile,
              boardId: board.id,
              boardName: board.name
            });
          }
        }
      }
    }

    if (this.el.searchResultCount) {
      this.el.searchResultCount.textContent = `${results.length} word${results.length === 1 ? '' : 's'}`;
    }

    if (results.length === 0) {
      this.el.searchResultsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:32px 16px; color:var(--gh-text-secondary);">
          <span style="font-size:2.2rem; display:block; margin-bottom:8px;">🔍</span>
          <p style="font-size:0.95rem; font-weight:700; color:var(--gh-text-primary);">No symbols found matching "${rawQuery}"</p>
          <p style="font-size:0.8rem; margin-top:4px;">Try searching for another core word (e.g., "want", "apple", "happy", "water")</p>
        </div>
      `;
      return;
    }

    // Limit to top 60 results for smooth performance
    const displayList = results.slice(0, 60);
    this.el.searchResultsGrid.innerHTML = "";

    displayList.forEach(({ tile, boardId, boardName }) => {
      const card = document.createElement("button");
      card.className = `search-result-tile cat-${tile.category || 'misc'} lacquer-sheen`;
      card.innerHTML = `
        <div style="font-size:2rem; line-height:1; margin-bottom:4px;">${tile.icon || "💬"}</div>
        <div style="font-size:0.95rem; font-weight:800; color:#fff; text-transform:uppercase;">${tile.label}</div>
        <div class="search-tile-folder">📂 ${boardName}</div>
      `;

      card.title = `Tap to add "${tile.label}" to message strip, or shift-click to locate on board`;

      card.addEventListener("click", (e) => {
        if (e.shiftKey) {
          this.navigateToTileLocation(boardId, tile.id);
        } else {
          this.activateTile(tile);
          this.closeSearchModal();
          window.aacAudio.playTone(520, 0.08, "triangle");
        }
      });

      this.el.searchResultsGrid.appendChild(card);
    });
  }

  navigateToTileLocation(boardId, tileId) {
    this.closeSearchModal();
    this.switchMainTab("aac");
    this.navigateToBoard(boardId);

    // Motor pathway highlight flashing
    setTimeout(() => {
      const tiles = this.el.aacGrid.querySelectorAll(".aac-tile");
      tiles.forEach(btn => {
        const id = btn.getAttribute("data-tile-id");
        if (id === tileId) {
          btn.classList.add("search-highlight-flash");
          btn.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => btn.classList.remove("search-highlight-flash"), 3500);
        }
      });
    }, 250);
  }

  // =========================================================================
  // CAREGIVER 30-SECOND GUIDE MODAL
  // =========================================================================

  openHelpModal() {
    if (this.el.helpGuideModal) {
      this.el.helpGuideModal.style.display = "flex";
      window.aacAudio.playTone(480, 0.08, "sine");
    }
  }

  closeHelpModal() {
    if (this.el.helpGuideModal) {
      this.el.helpGuideModal.style.display = "none";
    }
  }

  // =========================================================================
  // SORTED MASTER MENU SCREEN (CATEGORIES, PHONICS, DECISION WHEELS & TOOLS)
  // =========================================================================

  openMenuScreen() {
    if (!this.el.menuScreenModal) return;
    this.el.menuScreenModal.style.display = "flex";
    window.aacAudio.playTone(520, 0.08, "triangle");

    // Update live device inspector in menu header
    if (window.deviceScaleEngine) {
      const p = window.deviceScaleEngine.currentProfile;
      if (p) {
        const descEl = document.getElementById("menu-device-desc");
        const iconEl = document.getElementById("menu-device-icon");
        if (descEl) descEl.textContent = `${p.formFactorLabel.split(" ")[0]} (${p.width}×${p.height} • ${p.perfTier.toUpperCase()})`;
        if (iconEl) iconEl.textContent = p.formFactorIcon;

        const specsEl = document.getElementById("inspector-device-specs");
        if (specsEl) {
          specsEl.textContent = `${p.formFactorLabel} • ${p.width}×${p.height} (${p.isLandscape ? "Landscape" : "Portrait"}) • ${p.cores} CPU Cores • Optimal: ${p.recommendedColumns} Columns`;
        }
      }
    }
  }

  closeMenuScreen() {
    if (this.el.menuScreenModal) {
      this.el.menuScreenModal.style.display = "none";
    }
  }
}

// Bootstrap Application on DOM Ready
window.addEventListener("DOMContentLoaded", () => {
  window.aacApp = new AacApp();
});
