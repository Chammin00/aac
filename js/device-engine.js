/**
 * Amina AAC & Phonics Studio - Device Intelligence & Auto-Scaling Engine
 * Detects device hardware profile, screen aspect ratio, touch capabilities,
 * and auto-scales grid density and layout for optimal 60fps performance on any device.
 */

class DeviceScaleEngine {
  constructor(app = null) {
    this.app = app;
    this.currentProfile = null;
    this.autoScaleEnabled = true;
    this.resizeDebounceTimer = null;

    // Load manual override preference
    const savedAutoScale = localStorage.getItem("AMINA_AUTO_SCALE_ENABLED");
    if (savedAutoScale !== null) {
      this.autoScaleEnabled = savedAutoScale === "true";
    }

    this.init();
  }

  setApp(app) {
    this.app = app;
    this.applyProfileToApp();
  }

  init() {
    this.detectDeviceProfile();
    this.applyDeviceClasses();

    // Debounced resize & orientation change listeners
    window.addEventListener("resize", () => {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = setTimeout(() => {
        this.detectDeviceProfile();
        this.applyDeviceClasses();
        this.applyProfileToApp();
      }, 100);
    });

    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.detectDeviceProfile();
        this.applyDeviceClasses();
        this.applyProfileToApp();
      }, 150);
    });
  }

  detectDeviceProfile() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const screenW = window.screen.width;
    const screenH = window.screen.height;
    const dpr = window.devicePixelRatio || 1;
    const isLandscape = width > height;
    const aspectRatio = (width / height).toFixed(2);

    // Touch & pointer detection
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const hasHover = window.matchMedia("(hover: hover)").matches;

    // Hardware concurrency & memory profiling
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4; // in GB

    // Classify performance tier (low-end hardware vs high-performance tablet/PC)
    let perfTier = "high";
    if (cores <= 2 || memory <= 2) {
      perfTier = "low";
    } else if (cores <= 4 || memory <= 4) {
      perfTier = "medium";
    }

    // Classify form factor
    let formFactor = "tablet_standard";
    let formFactorLabel = "Standard Tablet (10\")";
    let formFactorIcon = "📱";

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /mobile|iphone|ipod|android.*mobile|windows phone/.test(userAgent);
    const isTabletUA = /ipad|android(?!.*mobile)|tablet/.test(userAgent);

    if (width < 600 || (height < 500 && width < 900) || (isMobileUA && !isTabletUA && width < 768)) {
      formFactor = "phone";
      formFactorLabel = isLandscape ? "Mobile Phone (Landscape)" : "Mobile Phone (Portrait)";
      formFactorIcon = "📱";
    } else if (width >= 600 && width < 840) {
      formFactor = "tablet_compact";
      formFactorLabel = "Compact Tablet (7\"–8\")";
      formFactorIcon = "📟";
    } else if (width >= 840 && width < 1200) {
      formFactor = "tablet_standard";
      formFactorLabel = "Clinical Tablet (10\"–11\" iPad/Galaxy)";
      formFactorIcon = "📱";
    } else if (width >= 1200 && width <= 1440 && hasTouch) {
      formFactor = "tablet_large";
      formFactorLabel = "Large Pro Tablet (12.9\"+)";
      formFactorIcon = "🖥️";
    } else {
      formFactor = "desktop";
      formFactorLabel = "Desktop / Laptop / Smartboard";
      formFactorIcon = "💻";
    }

    // Compute optimal grid columns for this form factor
    let recommendedColumns = 6;
    if (formFactor === "phone") {
      recommendedColumns = isLandscape ? 4 : 3;
    } else if (formFactor === "tablet_compact") {
      recommendedColumns = isLandscape ? 6 : 4;
    } else if (formFactor === "tablet_standard") {
      recommendedColumns = 6; // Universal Core 36 standard
    } else if (formFactor === "tablet_large" || formFactor === "desktop") {
      recommendedColumns = isLandscape ? 8 : 6;
    }

    this.currentProfile = {
      width,
      height,
      screenW,
      screenH,
      dpr,
      isLandscape,
      aspectRatio,
      hasTouch,
      hasFinePointer,
      hasHover,
      cores,
      memory,
      perfTier,
      formFactor,
      formFactorLabel,
      formFactorIcon,
      recommendedColumns
    };

    return this.currentProfile;
  }

  applyDeviceClasses() {
    const p = this.currentProfile;
    if (!p) return;

    const body = document.body;

    // Remove existing device and tier classes
    body.classList.remove(
      "device-phone",
      "device-tablet-compact",
      "device-tablet-standard",
      "device-tablet-large",
      "device-desktop",
      "perf-tier-low",
      "perf-tier-medium",
      "perf-tier-high",
      "orientation-landscape",
      "orientation-portrait"
    );

    // Apply specific classes
    body.classList.add(`device-${p.formFactor.replace('_', '-')}`);
    body.classList.add(`perf-tier-${p.perfTier}`);
    body.classList.add(p.isLandscape ? "orientation-landscape" : "orientation-portrait");

    // Touch profile class
    body.classList.toggle("touch-capable", p.hasTouch);

    // Update live badge in header if present
    this.updateHeaderBadge();
  }

  applyProfileToApp() {
    if (!this.app || !this.currentProfile) return;

    // Auto-scale grid density if user hasn't locked a custom density
    if (this.autoScaleEnabled) {
      const rec = this.currentProfile.recommendedColumns;
      if (this.app.gridDensity !== rec) {
        this.app.setGridDensity(rec);
      }
    }

    // Auto-fit grid row heights to guarantee zero vertical scroll overflow
    this.autoFitGridHeight();
  }

  autoFitGridHeight() {
    const aacGridWrapper = document.querySelector(".aac-grid-wrapper");
    const aacGrid = document.getElementById("aac-grid");
    if (!aacGridWrapper || !aacGrid) return;

    // Measure occupied vertical space
    const windowH = window.innerHeight;
    const header = document.querySelector(".app-header");
    const sentenceStrip = document.querySelector(".sentence-strip-container");
    const favorites = document.getElementById("favorites-ribbon");
    const categoryNav = document.getElementById("category-nav");

    const headerH = header ? header.offsetHeight : 0;
    const stripH = sentenceStrip ? sentenceStrip.offsetHeight : 0;
    const favH = favorites && favorites.style.display !== "none" ? favorites.offsetHeight : 0;
    const navH = categoryNav && categoryNav.style.display !== "none" ? categoryNav.offsetHeight : 0;

    // Remaining vertical space for communication tiles
    const padding = 28; // wrapper padding + grid gaps
    const availableH = windowH - headerH - stripH - favH - navH - padding;

    if (availableH > 220) {
      const cols = this.app ? this.app.gridDensity || 6 : 6;
      const tileCount = aacGrid.children.length || 36;
      const rows = Math.max(2, Math.ceil(tileCount / cols));

      const calcRowH = Math.floor((availableH - (rows - 1) * 8) / rows);
      const clampedRowH = Math.max(54, Math.min(130, calcRowH));

      // Inject dynamically calculated optimal row height
      document.documentElement.style.setProperty("--aac-tile-auto-height", `${clampedRowH}px`);
      aacGrid.style.gridAutoRows = `${clampedRowH}px`;
    }
  }

  setAutoScale(enable) {
    this.autoScaleEnabled = enable;
    localStorage.setItem("AMINA_AUTO_SCALE_ENABLED", enable ? "true" : "false");
    if (enable) {
      this.detectDeviceProfile();
      this.applyProfileToApp();
    }
  }

  updateHeaderBadge() {
    const badge = document.getElementById("device-profile-pill");
    if (!badge || !this.currentProfile) return;

    const p = this.currentProfile;
    badge.innerHTML = `
      <span class="device-pill-icon">${p.formFactorIcon}</span>
      <span class="device-pill-text">${p.formFactorLabel.split(" ")[0]}</span>
      <span class="device-pill-dot ${p.perfTier}">●</span>
    `;
    badge.title = `Device: ${p.formFactorLabel} | Resolution: ${p.width}x${p.height} | Performance: ${p.perfTier.toUpperCase()} (${p.cores} CPU Cores)`;
  }
}

// Instantiate globally
window.deviceScaleEngine = new DeviceScaleEngine();
