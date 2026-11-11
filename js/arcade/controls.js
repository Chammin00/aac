/**
 * CHANCENVADERS 1978 - Input & Controller Manager
 * Keyboard, Virtual Arcade Buttons, Gamepad API, and Direct Point-and-Click Finger/Cursor Tracking.
 */

(function (window) {
  'use strict';

  class InputManager {
    constructor() {
      this.keys = {
        left: false,
        right: false,
        fire: false,
        pause: false,
        start: false,
        coin: false,
        colorMode: false,
        scanlines: false,
      };

      this.firePressed = false;
      this.startPressed = false;
      this.pausePressed = false;
      this.coinPressed = false;
      this.colorPressed = false;

      // Point & Click Finger Cursor Tracking
      this.pointerX = null;
      this.pointerY = null;
      this.isPointerDown = false;
      this.pointerAutoFireTimer = 0;

      this.initKeyboard();
      this.initGamepad();
    }

    initKeyboard() {
      window.addEventListener('keydown', (e) => {
        if (window.SpaceInvadersAudio) {
          window.SpaceInvadersAudio.ensureUnlocked();
        }

        switch (e.code) {
          case 'ArrowLeft':
          case 'KeyA':
            this.keys.left = true;
            this.pointerX = null; // Keyboard takes over pointer target
            e.preventDefault();
            break;
          case 'ArrowRight':
          case 'KeyD':
            this.keys.right = true;
            this.pointerX = null;
            e.preventDefault();
            break;
          case 'Space':
            if (!this.keys.fire) {
              this.firePressed = true;
            }
            this.keys.fire = true;
            e.preventDefault();
            break;
          case 'Enter':
          case 'Digit1':
            if (!this.keys.start) {
              this.startPressed = true;
            }
            this.keys.start = true;
            e.preventDefault();
            break;
          case 'KeyC':
            if (!this.keys.colorMode) {
              this.colorPressed = true;
            }
            this.keys.colorMode = true;
            e.preventDefault();
            break;
          case 'KeyP':
            if (!this.keys.pause) {
              this.pausePressed = true;
            }
            this.keys.pause = true;
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
            this.keys.left = false;
            break;
          case 'ArrowRight':
          case 'KeyD':
            this.keys.right = false;
            break;
          case 'Space':
            this.keys.fire = false;
            break;
          case 'Enter':
          case 'Digit1':
            this.keys.start = false;
            break;
          case 'KeyC':
            this.keys.colorMode = false;
            break;
          case 'KeyP':
            this.keys.pause = false;
            break;
        }
      });
    }

    initGamepad() {
      this.gamepadIndex = null;
      window.addEventListener('gamepadconnected', (e) => {
        this.gamepadIndex = e.gamepad.index;
      });
      window.addEventListener('gamepaddisconnected', (e) => {
        if (this.gamepadIndex === e.gamepad.index) {
          this.gamepadIndex = null;
        }
      });
    }

    pollGamepad() {
      if (this.gamepadIndex === null) return;
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[this.gamepadIndex];
      if (!gp) return;

      const leftStickX = gp.axes[0] || 0;
      const dpadLeft = gp.buttons[14] && gp.buttons[14].pressed;
      const dpadRight = gp.buttons[15] && gp.buttons[15].pressed;

      if (leftStickX < -0.3 || dpadLeft) {
        this.keys.left = true;
        this.pointerX = null;
      }

      if (leftStickX > 0.3 || dpadRight) {
        this.keys.right = true;
        this.pointerX = null;
      }

      const fireBtn = (gp.buttons[0] && gp.buttons[0].pressed) || (gp.buttons[7] && gp.buttons[7].pressed);
      if (fireBtn) {
        if (!this.keys.fire) {
          this.firePressed = true;
        }
        this.keys.fire = true;
      }

      const startBtn = gp.buttons[9] && gp.buttons[9].pressed;
      if (startBtn && !this.keys.start) {
        this.startPressed = true;
        this.keys.start = true;
      }
    }

    /**
     * Bind direct point-and-click / touch cursor tracking to game canvas
     */
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
        this.startPressed = true; // Also starts game from attract mode on tap!
      };

      const handlePointerMove = (e) => {
        if (this.isPointerDown || e.pointerType === 'mouse') {
          updatePointerCoords(e);
        }
      };

      const handlePointerUp = (e) => {
        this.isPointerDown = false;
      };

      canvasElement.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);

      // Support touch devices directly
      canvasElement.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handlePointerDown(e);
      }, { passive: false });

      canvasElement.addEventListener('touchmove', (e) => {
        e.preventDefault();
        handlePointerMove(e);
      }, { passive: false });

      canvasElement.addEventListener('touchend', (e) => {
        handlePointerUp(e);
      }, { passive: false });
    }

    /**
     * Bind virtual touch/mouse buttons from arcade cabinet overlay
     */
    bindVirtualButtons(elements) {
      if (!elements) return;

      const triggerAudio = () => {
        if (window.SpaceInvadersAudio) {
          window.SpaceInvadersAudio.ensureUnlocked();
        }
      };

      if (elements.btnLeft) {
        const pressLeft = (e) => { e.preventDefault(); triggerAudio(); this.keys.left = true; this.pointerX = null; };
        const releaseLeft = (e) => { e.preventDefault(); this.keys.left = false; };
        elements.btnLeft.addEventListener('pointerdown', pressLeft);
        elements.btnLeft.addEventListener('pointerup', releaseLeft);
        elements.btnLeft.addEventListener('pointerleave', releaseLeft);
        elements.btnLeft.addEventListener('pointercancel', releaseLeft);
      }

      if (elements.btnRight) {
        const pressRight = (e) => { e.preventDefault(); triggerAudio(); this.keys.right = true; this.pointerX = null; };
        const releaseRight = (e) => { e.preventDefault(); this.keys.right = false; };
        elements.btnRight.addEventListener('pointerdown', pressRight);
        elements.btnRight.addEventListener('pointerup', releaseRight);
        elements.btnRight.addEventListener('pointerleave', releaseRight);
        elements.btnRight.addEventListener('pointercancel', releaseRight);
      }

      if (elements.btnFire) {
        const pressFire = (e) => {
          e.preventDefault();
          triggerAudio();
          this.keys.fire = true;
          this.firePressed = true;
        };
        const releaseFire = (e) => { e.preventDefault(); this.keys.fire = false; };
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

    /**
     * Consume one-shot triggers
     */
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
