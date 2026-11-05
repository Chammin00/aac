/**
 * Amina AAC & Phonics Studio - Interactive Food Decision Wheels
 * Three Dedicated Wheels: Favorite Snacks, Restaurants & Takeout, Homecooked Meals
 * Features:
 * - Physics-based spinning wheel with friction & sound ticks
 * - Animated pointer with winner celebration chimes & confetti
 * - Amina Afro-Euro voice announcement
 * - Single-tap transfer to AAC sentence strip ("I want [Food] please!")
 * - LocalStorage customization (Add/Delete personalized family favorites)
 */

const DEFAULT_FOOD_WHEELS = {
  "snacks": {
    id: "snacks",
    name: "Favorite Snacks Wheel",
    icon: "🍿",
    description: "Quick, tasty snacks and afternoon pick-me-ups",
    themeColor: "#f0883e",
    items: [
      { id: "snk_1", name: "Goldfish Crackers", icon: "🧀", color: "#f59e0b" },
      { id: "snk_2", name: "Buttery Popcorn", icon: "🍿", color: "#eab308" },
      { id: "snk_3", name: "Apple Slices", icon: "🍎", color: "#ef4444" },
      { id: "snk_4", name: "Yogurt Tube", icon: "🍓", color: "#ec4899" },
      { id: "snk_5", name: "Crunchy Pretzels", icon: "🥨", color: "#d97706" },
      { id: "snk_6", name: "Fruit Gummies", icon: "🍇", color: "#8b5cf6" },
      { id: "snk_7", name: "String Cheese", icon: "🧀", color: "#e3b341" },
      { id: "snk_8", name: "Granola Bar", icon: "🍫", color: "#78350f" },
      { id: "snk_9", name: "Chips & Dip", icon: "🥑", color: "#22c55e" },
      { id: "snk_10", name: "Carrot Sticks", icon: "🥕", color: "#ea580c" }
    ]
  },

  "restaurants": {
    id: "restaurants",
    name: "Restaurants & Takeout Wheel",
    icon: "🍔",
    description: "Dining out, drive-thru, and favorite takeout spots",
    themeColor: "#ef4444",
    items: [
      { id: "rst_1", name: "Pizza Parlor", icon: "🍕", color: "#dc2626" },
      { id: "rst_2", name: "Burgers & Fries", icon: "🍔", color: "#ea580c" },
      { id: "rst_3", name: "Taco Spot", icon: "🌮", color: "#f59e0b" },
      { id: "rst_4", name: "Crispy Chicken", icon: "🍗", color: "#ca8a04" },
      { id: "rst_5", name: "Sub Sandwich Shop", icon: "🥪", color: "#16a34a" },
      { id: "rst_6", name: "Asian Noodles / Rice", icon: "🍜", color: "#0284c7" },
      { id: "rst_7", name: "Ice Cream Shop", icon: "🍦", color: "#ec4899" },
      { id: "rst_8", name: "Breakfast Diner", icon: "🥞", color: "#9333ea" }
    ]
  },

  "homecooked": {
    id: "homecooked",
    name: "Homecooked Meals Wheel",
    icon: "🍲",
    description: "Warm, cozy homemade dinners and family recipes",
    themeColor: "#22c55e",
    items: [
      { id: "hm_1", name: "Spaghetti & Meatballs", icon: "🍝", color: "#b91c1c" },
      { id: "hm_2", name: "Grilled Cheese & Soup", icon: "🥪", color: "#d97706" },
      { id: "hm_3", name: "Taco Night", icon: "🌮", color: "#ea580c" },
      { id: "hm_4", name: "Creamy Mac & Cheese", icon: "🧀", color: "#eab308" },
      { id: "hm_5", name: "Baked Chicken & Rice", icon: "🍗", color: "#15803d" },
      { id: "hm_6", name: "Cheesy Quesadillas", icon: "🫓", color: "#0284c7" },
      { id: "hm_7", name: "Breakfast for Dinner", icon: "🥞", color: "#7c3aed" },
      { id: "hm_8", name: "Homemade Pizza", icon: "🍕", color: "#be123c" }
    ]
  }
};

class FoodWheelManager {
  constructor() {
    this.storageKey = "AMINA_FOOD_WHEELS_V1";
    this.wheels = this.loadWheels();
    this.activeWheelId = "snacks"; // "snacks" | "restaurants" | "homecooked"

    // Animation & Physics State
    this.currentAngle = 0; // in radians
    this.angularVelocity = 0;
    this.isSpinning = false;
    this.friction = 0.985;
    this.minVelocity = 0.002;
    this.lastTickSegment = -1;
    this.lastWinner = null;

    this.canvas = null;
    this.ctx = null;
    this.animFrameId = null;
  }

  loadWheels() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load stored food wheels:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_FOOD_WHEELS));
  }

  saveWheels() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.wheels));
    } catch (e) {
      console.warn("Error saving food wheels to storage:", e);
    }
  }

  getActiveWheel() {
    return this.wheels[this.activeWheelId] || this.wheels["snacks"];
  }

  setWheel(wheelId) {
    if (this.wheels[wheelId]) {
      this.activeWheelId = wheelId;
      this.lastWinner = null;
      this.drawWheel();
    }
  }

  setActiveWheel(wheelId) {
    return this.setWheel(wheelId);
  }

  addItem(wheelId, name, icon = "🍽️", color = "#3b82f6") {
    const wheel = this.wheels[wheelId];
    if (!wheel) return;
    wheel.items.push({
      id: "food_" + Date.now(),
      name: name.trim(),
      icon: icon.trim() || "🍽️",
      color: color
    });
    this.saveWheels();
    this.drawWheel();
  }

  deleteItem(wheelId, itemId) {
    const wheel = this.wheels[wheelId];
    if (!wheel || wheel.items.length <= 2) {
      alert("A wheel needs at least 2 items to spin!");
      return;
    }
    wheel.items = wheel.items.filter(item => item.id !== itemId);
    this.saveWheels();
    this.drawWheel();
  }

  resetWheelToDefault(wheelId) {
    if (DEFAULT_FOOD_WHEELS[wheelId]) {
      this.wheels[wheelId] = JSON.parse(JSON.stringify(DEFAULT_FOOD_WHEELS[wheelId]));
      this.saveWheels();
      this.drawWheel();
    }
  }

  initCanvas(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext("2d");
    this.drawWheel();
  }

  drawWheel() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const wheel = this.getActiveWheel();
    const items = wheel.items;
    const numSlices = items.length;
    if (numSlices === 0) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 16;
    const sliceAngle = (Math.PI * 2) / numSlices;

    ctx.clearRect(0, 0, width, height);

    // Outer Beveled Shadow Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = "#0d1117";
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.restore();

    // Metallic Outer Rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = wheel.themeColor;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Slices
    for (let i = 0; i < numSlices; i++) {
      const angle = this.currentAngle + i * sliceAngle;
      const item = items[i];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.closePath();

      // Slice Fill
      ctx.fillStyle = item.color;
      ctx.fill();

      // Slice 1px boundary
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner High-Gloss Lacquer gradient sheen
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      grad.addColorStop(0.65, "rgba(255, 255, 255, 0.05)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.25)");
      ctx.fillStyle = grad;
      ctx.fill();

      // Text & Icon Label inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);

      // Icon
      ctx.font = `${Math.max(16, Math.min(26, 240 / numSlices))}px -apple-system, sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(item.icon, radius - 14, 0);

      // Label text
      ctx.font = `bold ${Math.max(10, Math.min(14, 180 / numSlices))}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillStyle = "#ffffff";
      const maxTextWidth = radius * 0.52;
      let text = item.name;
      if (ctx.measureText(text).width > maxTextWidth) {
        while (text.length > 3 && ctx.measureText(text + "..").width > maxTextWidth) {
          text = text.slice(0, -1);
        }
        text += "..";
      }
      ctx.fillText(text, radius - 44, 0);

      ctx.restore();
      ctx.restore();
    }

    // Center Hub (High-Gloss Lacquer Cap)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 36, 0, Math.PI * 2);
    ctx.fillStyle = "#090d16";
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = wheel.themeColor;
    ctx.stroke();

    // Center icon/logo
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(wheel.icon, centerX, centerY);
    ctx.restore();

    // Top Pointer Arrow (Stationary at 12 o'clock, pointing downward)
    this.drawPointer(centerX, centerY - radius - 2);
  }

  drawPointer(tipX, tipY) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tipX, tipY + 14); // pointer tip dipping into the rim
    ctx.lineTo(tipX - 14, tipY - 14);
    ctx.lineTo(tipX + 14, tipY - 14);
    ctx.closePath();

    ctx.fillStyle = "#fef08a";
    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#ca8a04";
    ctx.stroke();
    ctx.restore();
  }

  spin(onFinishCallback = null) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // Give a powerful random angular kick (between 0.28 and 0.48 rad/frame)
    this.angularVelocity = 0.32 + Math.random() * 0.24;
    window.aacAudio.playTone(340, 0.08, "triangle");

    const animate = () => {
      this.currentAngle = (this.currentAngle + this.angularVelocity) % (Math.PI * 2);
      this.angularVelocity *= this.friction;

      // Play subtle tick chime when slice boundary passes top pointer (top pointer is at -PI/2)
      const wheel = this.getActiveWheel();
      const numSlices = wheel.items.length;
      const sliceAngle = (Math.PI * 2) / numSlices;
      const pointerAngle = (Math.PI * 1.5 - this.currentAngle) % (Math.PI * 2);
      const normalizedAngle = pointerAngle < 0 ? pointerAngle + Math.PI * 2 : pointerAngle;
      const currentSegment = Math.floor(normalizedAngle / sliceAngle);

      if (currentSegment !== this.lastTickSegment) {
        this.lastTickSegment = currentSegment;
        window.aacAudio.playTone(600 + (currentSegment * 25), 0.03, "sine");
        window.aacAudio.hapticPulse();
      }

      this.drawWheel();

      if (this.angularVelocity > this.minVelocity) {
        this.animFrameId = requestAnimationFrame(animate);
      } else {
        // Spin finished! Calculate winning slice
        this.isSpinning = false;
        const winner = wheel.items[currentSegment];
        this.lastWinner = winner;

        // Celebrations!
        window.aacAudio.playCelebrationChime();
        if (typeof confetti === "function") {
          confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
        }

        // Amina announces the food!
        const phrase = `The wheel landed on: ${winner.name}! That sounds wonderful!`;
        window.aacAudio.speak(phrase);

        if (onFinishCallback) {
          onFinishCallback(winner);
        }
      }
    };

    this.animFrameId = requestAnimationFrame(animate);
  }
}

window.foodWheelManager = new FoodWheelManager();
