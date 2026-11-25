/**
 * CHANCE INVADERS 1978 - Input & Controller Manager
 * Keyboard, Virtual Arcade Buttons, Full Xbox / 8BitDo / Android HID Gamepad API,
 * and Direct Point-and-Click Finger/Cursor Tracking.
 */

(function (window) {
  'use strict';

  class InputManager {
    constructor() {
      this.kbKeys = { left: false, right: false, fire: false, pause: false, start: false, coin: false, colorMode: false };
      this.btnKeys = { left: false, right: false, fire: false };
      this.gpKeys = { left: false, right: false, fire: false };
      this.keys = {
        left: false,
        right: false,
        fire: false,
        pause: false,
        start: false,
        coin: false,
        colorMode: false,
        scanlines: false
      };

      this.firePressed = false;
      this.startPressed = false;
      this.pausePressed = false;
      this.coinPressed = false;
      this.colorPressed = false;

      this.pointerX = null;
      this.pointerY = null;
      this.isPointerDown = false;
      this.pointerAutoFireTimer = 0;

      this.gamepadConnected = false;
      this.gamepadName = '';
      this._gpPrev = {};
      this._gpRestAxes = null;

      this.initKeyboard();
      this.initGamepad();
    }

    _syncKeys() {
      this.keys.left = this.kbKeys.left || this.btnKeys.left || this.gpKeys.left;
      this.keys.right = this.kbKeys.right || this.btnKeys.right || this.gpKeys.right;
      this.keys.fire = this.kbKeys.fire || this.btnKeys.fire || this.gpKeys.fire;
      this.keys.pause = this.kbKeys.pause;
      this.keys.start = this.kbKeys.start;
      this.keys.coin = this.kbKeys.coin;
      this.keys.colorMode = this.kbKeys.colorMode;
    }

    initKeyboard() {
      window.addEventListener('keydown', (e) => {
        if (window.SpaceInvadersAudio) {
          window.SpaceInvadersAudio.ensureUnlocked();
        }

        switch (e.code) {
          case 'ArrowLeft':
          case 'KeyA':
            this.kbKeys.left = true;
            this.pointerX = null;
            this._syncKeys();
            e.preventDefault();
            break;
          case 'ArrowRight':
          case 'KeyD':
            this.kbKeys.right = true;
            this.pointerX = null;
            this._syncKeys();
            e.preventDefault();
            break;
          case 'Space':
            if (!this.kbKeys.fire) {
              this.firePressed = true;
            }
            this.kbKeys.fire = true;
            this._syncKeys();
            e.preventDefault();
            break;
          case 'Enter':
          case 'Digit1':
            if (!this.kbKeys.start) {
              this.startPressed = true;
              this.coinPressed = true;
            }
            this.kbKeys.start = true;
            this._syncKeys();
            e.preventDefault();
            break;
          case 'KeyC':
            if (!this.kbKeys.colorMode) {
              this.colorPressed = true;
            }
            this.kbKeys.colorMode = true;
            this._syncKeys();
            e.preventDefault();
            break;
          case 'KeyP':
            if (!this.kbKeys.pause) {
              this.pausePressed = true;
            }
            this.kbKeys.pause = true;
            this._syncKeys();
            e.preventDefault();
            break;
          case 'KeyM':
            if (window.SpaceInvadersAudio) {
              window.SpaceInvadersAudio.toggleMute();
            }
            e.preventDefault();
            break;
        }
      });

      window.addEventListener('keyup', (e) => {
        switch (e.code) {
          case 'ArrowLeft':
          case 'KeyA':
            this.kbKeys.left = false;
            this._syncKeys();
            break;
          case 'ArrowRight':
          case 'KeyD':
            this.kbKeys.right = false;
            this._syncKeys();
            break;
          case 'Space':
            this.kbKeys.fire = false;
            this._syncKeys();
            break;
          case 'Enter':
          case 'Digit1':
            this.kbKeys.start = false;
            this._syncKeys();
            break;
          case 'KeyC':
            this.kbKeys.colorMode = false;
            this._syncKeys();
            break;
          case 'KeyP':
            this.kbKeys.pause = false;
            this._syncKeys();
            break;
        }
      });
    }

    initGamepad() {
      window.addEventListener('gamepadconnected', (e) => {
        if (e && e.gamepad) {
          this.gamepadConnected = true;
          this.gamepadName = e.gamepad.id || 'Controller';
          this._gpRestAxes = Array.from(e.gamepad.axes || []).map(v => (typeof v === 'number' && !Number.isNaN(v)) ? v : 0);
        }
      });
      window.addEventListener('gamepaddisconnected', () => {
        this.gamepadConnected = false;
        this.gamepadName = '';
        this._gpRestAxes = null;
        this.gpKeys.left = false;
        this.gpKeys.right = false;
        this.gpKeys.fire = false;
        this._syncKeys();
      });
    }

    pollGamepad() {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let gp = null;
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].connected) {
          gp = gamepads[i];
          break;
        }
      }
      if (!gp) {
        if (this.gamepadConnected || this.gpKeys.left || this.gpKeys.right || this.gpKeys.fire) {
          this.gamepadConnected = false;
          this.gamepadName = '';
          this._gpRestAxes = null;
          this.gpKeys.left = false;
          this.gpKeys.right = false;
          this.gpKeys.fire = false;
          this._syncKeys();
        }
        return;
      }

      if (!this.gamepadConnected || (gp.id || '') !== this.gamepadName) {
        this.gamepadConnected = true;
        this.gamepadName = gp.id || 'Controller';
        this._gpRestAxes = Array.from(gp.axes || []).map(v => (typeof v === 'number' && !Number.isNaN(v)) ? v : 0);
      }

      const btnVal = (idx) => {
        const b = gp.buttons && gp.buttons[idx];
        if (!b) return 0;
        return typeof b === 'object' ? (b.value || (b.pressed ? 1 : 0)) : Number(b);
      };
      const isDown = (idx) => btnVal(idx) > 0.35;
      const axisTrig = (idx) => {
        if (!gp.axes || idx >= gp.axes.length) return 0;
        const rest = (this._gpRestAxes && typeof this._gpRestAxes[idx] === 'number') ? this._gpRestAxes[idx] : 0;
        const v = gp.axes[idx];
        if (typeof v !== 'number' || Number.isNaN(v)) return 0;
        if (rest < -0.5) return Math.max(0, Math.min(1, (v + 1) * 0.5));
        if (Math.abs(rest) > 0.5) return 0;
        return v > 0.25 ? Math.min(1, v) : 0;
      };
      const just = (key, cur) => {
        const prev = Boolean(this._gpPrev[key]);
        this._gpPrev[key] = Boolean(cur);
        return Boolean(cur) && !prev;
      };

      let hatLeft = false;
      let hatRight = false;
      if (gp.axes && gp.axes.length > 9 && typeof gp.axes[9] === 'number' && Math.abs(gp.axes[9]) <= 1.05) {
        const h = gp.axes[9];
        hatRight = h > -0.85 && h < 0.0;
        hatLeft = h >= 0.28;
      }

      const lx = (gp.axes && gp.axes[0]) || 0;
      const moveLeft = lx < -0.26 || isDown(14) || hatLeft;
      const moveRight = lx > 0.26 || isDown(15) || hatRight;
      if (moveLeft || moveRight) {
        this.pointerX = null;
      }
      this.gpKeys.left = Boolean(moveLeft && !moveRight);
      this.gpKeys.right = Boolean(moveRight && !moveLeft);

      const fireBtn = isDown(0) || isDown(1) || isDown(2) || isDown(5) || isDown(7) || axisTrig(4) > 0.45 || axisTrig(5) > 0.45;
      if (just('fire', fireBtn)) {
        if (window.SpaceInvadersAudio) window.SpaceInvadersAudio.ensureUnlocked();
        this.firePressed = true;
        // Also insert coin & start seamlessly if in attract / game over
        this.coinPressed = true;
        this.startPressed = true;
      }
      this.gpKeys.fire = Boolean(fireBtn);

      const startBtn = isDown(9) || isDown(11);
      if (just('start', startBtn)) {
        if (window.SpaceInvadersAudio) window.SpaceInvadersAudio.ensureUnlocked();
        this.coinPressed = true;
        this.startPressed = true;
        this.pausePressed = true;
      }

      const colorBtn = isDown(3) || isDown(4) || isDown(6);
      if (just('color', colorBtn)) {
        this.colorPressed = true;
      }

      const backBtn = isDown(8) || isDown(10);
      if (just('back', backBtn) && window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({ type: 'CLOSE_WEB_ARCADE' }, '*');
        } catch (e) {}
      }

      this._syncKeys();
    }

    bindPointerCanvas(canvasElement, gameWidth, gameHeight) {
      if (!canvasElement) return;

      const updatePointerCoords = (e) => {
        const rect = canvasElement.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
        const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
        if (clientX === null || clientY === null) return;
        const scaleX = gameWidth / rect.width;
        const scaleY = gameHeight / rect.height;
        this.pointerX = Math.max(0, Math.min(gameWidth, (clientX - rect.left) * scaleX));
        this.pointerY = Math.max(0, Math.min(gameHeight, (clientY - rect.top) * scaleY));
      };

      const handlePointerDown = (e) => {
        e.preventDefault();
        if (window.SpaceInvadersAudio) {
          window.SpaceInvadersAudio.ensureUnlocked();
        }
        this.isPointerDown = true;
        updatePointerCoords(e);
        this.firePressed = true;
        this.startPressed = true;
      };

      const handlePointerMove = (e) => {
        if (this.isPointerDown || e.pointerType === 'mouse') {
          updatePointerCoords(e);
        }
      };

      const handlePointerUp = () => {
        this.isPointerDown = false;
      };

      canvasElement.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);

      canvasElement.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handlePointerDown(e);
      }, { passive: false });

      canvasElement.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handlePointerMove(e);
      }, { passive: false });

      canvasElement.addEventListener('touchend', () => {
        handlePointerUp();
      }, { passive: false });
    }

    bindVirtualButtons(elements) {
      if (!elements) return;
      const triggerAudio = () => {
        if (window.SpaceInvadersAudio) {
          window.SpaceInvadersAudio.ensureUnlocked();
        }
      };

      if (elements.btnLeft) {
        const pressLeft = (e) => { e.preventDefault(); triggerAudio(); this.btnKeys.left = true; this.pointerX = null; this._syncKeys(); };
        const releaseLeft = (e) => { e.preventDefault(); this.btnKeys.left = false; this._syncKeys(); };
        elements.btnLeft.addEventListener('pointerdown', pressLeft);
        elements.btnLeft.addEventListener('pointerup', releaseLeft);
        elements.btnLeft.addEventListener('pointerleave', releaseLeft);
        elements.btnLeft.addEventListener('pointercancel', releaseLeft);
      }

      if (elements.btnRight) {
        const pressRight = (e) => { e.preventDefault(); triggerAudio(); this.btnKeys.right = true; this.pointerX = null; this._syncKeys(); };
        const releaseRight = (e) => { e.preventDefault(); this.btnKeys.right = false; this._syncKeys(); };
        elements.btnRight.addEventListener('pointerdown', pressRight);
        elements.btnRight.addEventListener('pointerup', releaseRight);
        elements.btnRight.addEventListener('pointerleave', releaseRight);
        elements.btnRight.addEventListener('pointercancel', releaseRight);
      }

      if (elements.btnFire) {
        const pressFire = (e) => {
          e.preventDefault();
          triggerAudio();
          this.btnKeys.fire = true;
          this.firePressed = true;
          this._syncKeys();
        };
        const releaseFire = (e) => { e.preventDefault(); this.btnKeys.fire = false; this._syncKeys(); };
        elements.btnFire.addEventListener('pointerdown', pressFire);
        elements.btnFire.addEventListener('pointerup', releaseFire);
        elements.btnFire.addEventListener('pointerleave', releaseFire);
        elements.btnFire.addEventListener('pointercancel', releaseFire);
      }

      if (elements.btnCoin) {
        elements.btnCoin.addEventListener('click', (e) => {
          e.preventDefault();
          triggerAudio();
          if (window.SpaceInvadersAudio) {
            window.SpaceInvadersAudio.playCoinInsert();
          }
          this.coinPressed = true;
        });
      }

      if (elements.btnStart) {
        elements.btnStart.addEventListener('click', (e) => {
          e.preventDefault();
          triggerAudio();
          this.startPressed = true;
        });
      }
    }

    consumeFire() {
      const res = this.firePressed;
      this.firePressed = false;
      return res;
    }

    consumeStart() {
      const res = this.startPressed;
      this.startPressed = false;
      return res;
    }

    consumePause() {
      const res = this.pausePressed;
      this.pausePressed = false;
      return res;
    }

    consumeCoin() {
      const res = this.coinPressed;
      this.coinPressed = false;
      return res;
    }

    consumeColor() {
      const res = this.colorPressed;
      this.colorPressed = false;
      return res;
    }
  }

  window.SpaceInvadersInput = new InputManager();
})(window);
