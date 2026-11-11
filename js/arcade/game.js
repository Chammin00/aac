/**
 * CHANCENVADERS 1978 - Museum-Grade Authentic Space Invaders Engine
 * Enhanced with Orbital Tower Level Ascension, Powerups, and Continuous Swept Hitboxes.
 */

(function (window) {
  'use strict';

  const Sprites = window.SpaceInvadersSprites;
  const Audio = window.SpaceInvadersAudio;
  const Input = window.SpaceInvadersInput;
  const BunkerManager = window.SpaceInvadersBunkers;

  // Screen Dimensions (448 x 512 native scale)
  const NATIVE_WIDTH = 224;
  const NATIVE_HEIGHT = 256;
  const SCALE = 2;
  const WIDTH = NATIVE_WIDTH * SCALE;
  const HEIGHT = NATIVE_HEIGHT * SCALE;

  // Orbital Elevator Tower Altitude Tiers
  const TOWER_TIERS = [
    { name: 'LUNAR SUB-BASE', altitude: '0m', color: '#00FF66' },
    { name: 'ORBITAL ELEVATOR', altitude: '12,500m', color: '#00E5FF' },
    { name: 'MESOSPHERE CITADEL', altitude: '45,000m', color: '#FFE600' },
    { name: 'STRATOSPHERE GANTRY', altitude: '90,000m', color: '#FF7700' },
    { name: 'THERMOSPHERE APEX', altitude: '160,000m', color: '#FF0055' },
    { name: 'DEEP SPACE GATEWAY', altitude: '350,000m', color: '#CC00FF' }
  ];

  // Color Palettes
  const PALETTES = {
    lunarDiorama: {
      name: "1978 Lunar Backdrop (Pepper's Ghost)",
      ufo: '#FF2222',
      squid: '#FFFFFF',
      crab: '#FFFFFF',
      octopus: '#FFFFFF',
      player: '#00FF44',
      bunker: '#00FF44',
      ground: '#00FF44',
      bullet: '#FFFFFF',
      bomb: '#FFFFFF',
      text: '#FFFFFF',
      overlayMode: 'lunar'
    },
    cellophane: {
      name: '1978 Arcade Cellophane',
      ufo: '#FF2222',
      squid: '#FFFFFF',
      crab: '#FFFFFF',
      octopus: '#FFFFFF',
      player: '#00FF44',
      bunker: '#00FF44',
      ground: '#00FF44',
      bullet: '#FFFFFF',
      bomb: '#FFFFFF',
      text: '#FFFFFF',
      overlayMode: 'cellophane'
    },
    neon: {
      name: 'Retro Neon Arcade',
      ufo: '#FF1155',
      squid: '#00E5FF',
      crab: '#FFE600',
      octopus: '#FF00A0',
      player: '#00FF66',
      bunker: '#00FF66',
      ground: '#00FF66',
      bullet: '#FFFFFF',
      bomb: '#FFAA00',
      text: '#FFFFFF',
      overlayMode: 'flat'
    },
    monochrome: {
      name: '1978 True Monochrome B&W',
      ufo: '#FFFFFF',
      squid: '#FFFFFF',
      crab: '#FFFFFF',
      octopus: '#FFFFFF',
      player: '#FFFFFF',
      bunker: '#FFFFFF',
      ground: '#FFFFFF',
      bullet: '#FFFFFF',
      bomb: '#FFFFFF',
      text: '#FFFFFF',
      overlayMode: 'flat'
    },
    greenPhosphor: {
      name: 'P1 Phosphor Green CRT',
      ufo: '#33FF55',
      squid: '#33FF55',
      crab: '#33FF55',
      octopus: '#33FF55',
      player: '#33FF55',
      bunker: '#33FF55',
      ground: '#33FF55',
      bullet: '#33FF55',
      bomb: '#33FF55',
      text: '#33FF55',
      overlayMode: 'flat'
    },
    amberPhosphor: {
      name: 'P3 Phosphor Amber CRT',
      ufo: '#FFB000',
      squid: '#FFB000',
      crab: '#FFB000',
      octopus: '#FFB000',
      player: '#FFB000',
      bunker: '#FFB000',
      ground: '#FFB000',
      bullet: '#FFB000',
      bomb: '#FFB000',
      text: '#FFB000',
      overlayMode: 'flat'
    }
  };

  const COLOR_MODE_KEYS = ['lunarDiorama', 'cellophane', 'neon', 'monochrome', 'greenPhosphor', 'amberPhosphor'];

  // Game States
  const STATES = {
    ATTRACT: 0,
    PLAYING: 1,
    PLAYER_DYING: 2,
    WAVE_CLEARED: 3,
    GAME_OVER: 4,
    PAUSED: 5,
    TOWER_ASCENDING: 6
  };

  class SpaceInvadersGame {
    constructor(canvas, backdropCanvas = null) {
      this.canvas = canvas;
      this.backdropCanvas = backdropCanvas;
      this.ctx = canvas.getContext('2d', { alpha: true });
      this.canvas.width = WIDTH;
      this.canvas.height = HEIGHT;

      // Palette setup
      this.currentPaletteIndex = 0;
      this.palette = PALETTES[COLOR_MODE_KEYS[this.currentPaletteIndex]];

      // High Score from storage
      this.highScore = parseInt(localStorage.getItem('chancenvaders_hiscore') || '1000', 10);
      this.credits = 1;

      // Juice: Screen shake & Hit-stop
      this.shakeDuration = 0;
      this.shakeIntensity = 0;
      this.hitStopFrames = 0;

      // Powerups system
      this.powerups = [];
      this.activePowerup = null;
      this.playerShieldHits = 0;
      this.powerupBanner = null;
      this.nukeFlash = 0;

      // Tower Ascension system
      this.towerAscensionTimer = 0;
      this.ascensionBonus = 0;
      this.thrusterParticles = [];

      // Attract easter egg animation
      this.attractFrame = 0;
      this.attractStep = 0;
      this.attractAlienX = 0;
      this.hasFixedY = false;

      // Bunkers manager
      const bunkerY = HEIGHT - 64 * SCALE;
      this.bunkers = new BunkerManager(WIDTH, bunkerY, SCALE);

      // Start in Attract Mode
      this.state = STATES.ATTRACT;
      this.savedStateBeforePause = STATES.PLAYING;

      this.initWave(1, 0, 3);

      this.lastTime = performance.now();
      this.stepTimer = 0;

      // UI update callback
      this.onStatsChange = null;
    }

    initWave(wave, score, lives) {
      this.wave = wave;
      this.score = score;
      this.lives = lives;
      this.shotsFired = 0;

      // Reset Powerups on new tier
      this.powerups = [];
      this.activePowerup = null;
      this.playerShieldHits = 0;
      this.powerupBanner = null;
      this.thrusterParticles = [];
      this.nukeFlash = 0;

      // Player Cannon setup
      this.playerWidth = 13 * SCALE;
      this.playerHeight = 8 * SCALE;
      this.playerX = (WIDTH - this.playerWidth) / 2;
      this.playerY = HEIGHT - 26 * SCALE;
      this.playerSpeed = 6.5 * SCALE; // Fast keyboard speed
      this.playerDyingTimer = 0;
      this.playerDeathFrame = 0;
      this.playerAutoFireCooldown = 0;

      // Active player lasers (multi-shot enabled)
      this.playerBullets = [];

      // Alien swarm matrix (5 rows × 11 columns)
      this.alienRows = 5;
      this.alienCols = 11;
      this.totalAliens = 55;
      this.aliens = [];
      this.alienCount = 55;

      // Swarm bounding position (drops lower on higher tiers)
      const startRowY = Math.min(30 + ((wave - 1) % 6) * 6, 60) * SCALE;
      this.swarmX = 14 * SCALE;
      this.swarmY = startRowY;
      this.swarmDir = 1; // 1 = right, -1 = left
      this.swarmStepAnim = 0;

      // March speed based on survivors
      this.marchStepInterval = this.calculateStepInterval();
      this.marchTimer = 0;

      for (let r = 0; r < this.alienRows; r++) {
        this.aliens[r] = [];
        let type = 'squid';
        let points = 30;
        let width = 8 * SCALE;
        if (r === 1 || r === 2) {
          type = 'crab';
          points = 20;
          width = 11 * SCALE;
        } else if (r === 3 || r === 4) {
          type = 'octopus';
          points = 10;
          width = 12 * SCALE;
        }

        for (let c = 0; c < this.alienCols; c++) {
          this.aliens[r][c] = {
            alive: true,
            type: type,
            points: points,
            width: width,
            height: 8 * SCALE,
            relX: c * 16 * SCALE,
            relY: r * 14 * SCALE
          };
        }
      }

      // Alien bombs
      this.alienBombs = [];
      this.bombTimer = 0;
      this.bombDropInterval = Math.max(14, 26 - Math.min(wave, 5) * 2);

      // Mystery Saucer / UFO setup
      this.ufo = null;
      this.ufoTimer = 0;
      this.ufoSpawnInterval = 320 + Math.floor(Math.random() * 220);
      this.ufoScorePopup = null;

      // Alien explosion effect
      this.explosion = null;

      // Reset Bunkers for wave
      const bunkerY = HEIGHT - 64 * SCALE;
      this.bunkers.reset(WIDTH, bunkerY, SCALE);

      Audio.resetMarch();
      this.triggerStats();
    }

    calculateStepInterval() {
      // Exhilarating fast-paced march (eliminates tortoise speed)
      // 55 aliens: 8 frames (~130ms) -> 30 aliens: 5 frames -> 10 aliens: 2 frames -> 1-3 aliens: 1 frame!
      const ratio = this.alienCount / this.totalAliens;
      return Math.max(1, Math.floor(ratio * 7) + 1);
    }

    startNewGame() {
      this.initWave(1, 0, 3);
      this.state = STATES.PLAYING;
      this.triggerStats();
    }

    cycleColorMode() {
      this.currentPaletteIndex = (this.currentPaletteIndex + 1) % COLOR_MODE_KEYS.length;
      this.palette = PALETTES[COLOR_MODE_KEYS[this.currentPaletteIndex]];
      this.triggerStats();
    }

    togglePause() {
      if (this.state === STATES.PAUSED) {
        this.state = this.savedStateBeforePause;
      } else if (this.state === STATES.PLAYING) {
        this.savedStateBeforePause = this.state;
        this.state = STATES.PAUSED;
      }
      this.triggerStats();
    }

    triggerStats() {
      if (this.onStatsChange) {
        this.onStatsChange({
          score: this.score,
          highScore: this.highScore,
          lives: this.lives,
          wave: this.wave,
          tierName: TOWER_TIERS[(this.wave - 1) % TOWER_TIERS.length].name,
          altitude: TOWER_TIERS[(this.wave - 1) % TOWER_TIERS.length].altitude,
          credits: this.credits,
          paletteName: this.palette.name,
          state: this.state
        });
      }
    }

    addScore(pts) {
      const oldScore = this.score;
      this.score += pts;
      // Bonus life dip switch: 1,500 points
      if (oldScore < 1500 && this.score >= 1500) {
        this.lives++;
        Audio.playCoinInsert();
      }
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('chancenvaders_hiscore', this.highScore.toString());
      }
      this.triggerStats();
    }

    triggerHitJuice(shakeInt = 3, shakeTime = 6, freezeFrames = 3) {
      this.shakeIntensity = shakeInt * SCALE;
      this.shakeDuration = shakeTime;
      this.hitStopFrames = freezeFrames;
    }

    // =========================================================================
    // POWERUPS SYSTEM
    // =========================================================================

    checkDropPowerup(x, y, alienPoints) {
      // 30pts (Squid): 35% chance, 20pts (Crab): 25%, 10pts (Octo): 18%
      const threshold = alienPoints === 30 ? 0.35 : (alienPoints === 20 ? 0.25 : 0.18);
      if (Math.random() < threshold) {
        this.dropRandomPowerup(x, y, false);
      }
    }

    dropRandomPowerup(x, y, isGuaranteed = false) {
      const types = ['spread', 'plasma', 'shield', 'rapid', 'nuke'];
      const picked = types[Math.floor(Math.random() * types.length)];

      this.powerups.push({
        x: x - 4 * SCALE,
        y: y,
        w: 9 * SCALE,
        h: 9 * SCALE,
        type: picked,
        vy: 1.6 * SCALE, // Floats down gently
        pulse: 0
      });

      Audio.playPowerupSpawn();
    }

    collectPowerup(type) {
      Audio.playPowerupCollect();
      this.triggerHitJuice(2, 6, 2);

      if (type === 'spread') {
        this.activePowerup = { type: 'spread', name: 'SPREAD LASER', timer: 720, maxTimer: 720, color: '#00E5FF' };
        this.powerupBanner = { text: 'SPREAD LASER ACTIVATED!', color: '#00E5FF', timer: 80 };
      } else if (type === 'plasma') {
        this.activePowerup = { type: 'plasma', name: 'PLASMA HYPER-BEAM', timer: 600, maxTimer: 600, color: '#00FF66' };
        this.powerupBanner = { text: 'PIERCING PLASMA BEAM!', color: '#00FF66', timer: 80 };
      } else if (type === 'shield') {
        this.playerShieldHits = 2;
        this.bunkers.repair(0.65);
        this.activePowerup = { type: 'shield', name: 'FORCEFIELD SHIELD', timer: 900, maxTimer: 900, color: '#FFE600' };
        this.powerupBanner = { text: 'FORCEFIELD + BUNKERS REPAIRED!', color: '#FFE600', timer: 80 };
      } else if (type === 'rapid') {
        this.activePowerup = { type: 'rapid', name: 'OVERDRIVE GATLING', timer: 480, maxTimer: 480, color: '#FF7700' };
        this.powerupBanner = { text: 'OVERDRIVE RAPID FIRE!', color: '#FF7700', timer: 80 };
      } else if (type === 'nuke') {
        // Instant screen-wide EMP wave
        this.nukeFlash = 16;
        this.alienBombs = [];
        this.addScore(400);
        Audio.playNukeDetonation();
        this.triggerHitJuice(6, 18, 8);

        // Destroy lowest active row of aliens
        for (let r = this.alienRows - 1; r >= 0; r--) {
          let rowHadAliens = false;
          for (let c = 0; c < this.alienCols; c++) {
            if (this.aliens[r][c].alive) {
              this.aliens[r][c].alive = false;
              this.alienCount--;
              rowHadAliens = true;
            }
          }
          if (rowHadAliens) break;
        }

        this.powerupBanner = { text: 'TACTICAL EMP NUKE DETONATED!', color: '#FF2222', timer: 90 };
        this.marchStepInterval = this.calculateStepInterval();
      }
    }

    updatePowerups() {
      // Move falling pods
      for (let i = this.powerups.length - 1; i >= 0; i--) {
        const pod = this.powerups[i];
        pod.y += pod.vy;
        pod.pulse = (pod.pulse || 0) + 0.1;

        // Off bottom of screen
        if (pod.y >= HEIGHT - 18 * SCALE) {
          this.powerups.splice(i, 1);
          continue;
        }

        // Check player collection
        if (
          pod.x + pod.w >= this.playerX &&
          pod.x <= this.playerX + this.playerWidth &&
          pod.y + pod.h >= this.playerY &&
          pod.y <= this.playerY + this.playerHeight
        ) {
          this.collectPowerup(pod.type);
          this.powerups.splice(i, 1);
        }
      }

      // Count down active powerup
      if (this.activePowerup) {
        this.activePowerup.timer--;
        if (this.activePowerup.timer <= 0) {
          this.activePowerup = null;
        }
      }

      // Count down banner
      if (this.powerupBanner) {
        this.powerupBanner.timer--;
        if (this.powerupBanner.timer <= 0) {
          this.powerupBanner = null;
        }
      }

      // Fade nuke flash
      if (this.nukeFlash > 0) {
        this.nukeFlash--;
      }
    }

    // =========================================================================
    // UPDATE LOGIC
    // =========================================================================

    update() {
      Input.pollGamepad();

      if (Input.consumePause()) {
        this.togglePause();
      }
      if (Input.consumeColor()) {
        this.cycleColorMode();
      }
      if (Input.consumeCoin()) {
        this.credits++;
        this.triggerStats();
      }

      if (this.state === STATES.ATTRACT) {
        this.updateAttract();
        if (Input.consumeStart() || Input.consumeFire()) {
          this.startNewGame();
        }
        return;
      }

      if (this.state === STATES.GAME_OVER) {
        if (Input.consumeStart() || Input.consumeFire()) {
          this.state = STATES.ATTRACT;
          this.triggerStats();
        }
        return;
      }

      if (this.state === STATES.PAUSED) {
        return;
      }

      if (this.hitStopFrames > 0) {
        this.hitStopFrames--;
        return;
      }

      if (this.state === STATES.PLAYER_DYING) {
        this.updatePlayerDying();
        return;
      }

      if (this.state === STATES.TOWER_ASCENDING) {
        this.updateTowerAscension();
        return;
      }

      // Active Gameplay Updates
      this.updatePlayer();
      this.updateSwarm();
      this.updatePlayerBullets();
      this.updateAlienBombs();
      this.updatePowerups();
      this.updateUfo();

      // Fade temporary explosion effect
      if (this.explosion) {
        this.explosion.duration--;
        if (this.explosion.duration <= 0) {
          this.explosion = null;
        }
      }

      // Fade UFO score pop
      if (this.ufoScorePopup) {
        this.ufoScorePopup.duration--;
        if (this.ufoScorePopup.duration <= 0) {
          this.ufoScorePopup = null;
        }
      }
    }

    updatePlayer() {
      // 1. Direct Point & Click / Finger Tracking
      if (Input.pointerX !== null) {
        const targetX = Input.pointerX - (this.playerWidth / 2);
        this.playerX = Math.max(8 * SCALE, Math.min(WIDTH - 8 * SCALE - this.playerWidth, targetX));
      } else {
        // Keyboard controls
        if (Input.keys.left) {
          this.playerX -= this.playerSpeed;
          if (this.playerX < 8 * SCALE) this.playerX = 8 * SCALE;
        }
        if (Input.keys.right) {
          this.playerX += this.playerSpeed;
          if (this.playerX + this.playerWidth > WIDTH - 8 * SCALE) {
            this.playerX = WIDTH - 8 * SCALE - this.playerWidth;
          }
        }
      }

      // 2. Firing Logic: Tap, Point-and-Click, or Rapid Hold
      if (this.playerAutoFireCooldown > 0) {
        this.playerAutoFireCooldown--;
      }

      const wantsToFire = Input.consumeFire() ||
        (Input.isPointerDown && this.playerAutoFireCooldown <= 0) ||
        (Input.keys.fire && this.playerAutoFireCooldown <= 0);

      const maxBullets = (this.activePowerup?.type === 'spread') ? 6 : (this.activePowerup?.type === 'rapid' ? 8 : 4);

      if (wantsToFire && this.playerBullets.length < maxBullets) {
        this.shotsFired++;
        const pType = this.activePowerup?.type;

        if (pType === 'rapid') {
          this.playerAutoFireCooldown = 3; // Hyper-rapid overdrive!
        } else {
          this.playerAutoFireCooldown = 7;
        }

        const gunCenterX = this.playerX + (this.playerWidth / 2);
        const gunTipY = this.playerY - 4 * SCALE;

        if (pType === 'spread') {
          // Spread shot: 3 angled beams
          this.playerBullets.push(
            { x: gunCenterX - 1 * SCALE, y: gunTipY, prevX: gunCenterX - 1 * SCALE, prevY: gunTipY, w: 2 * SCALE, h: 7 * SCALE, vx: 0, speed: 15 * SCALE, isPiercing: false },
            { x: gunCenterX - 1 * SCALE, y: gunTipY, prevX: gunCenterX - 1 * SCALE, prevY: gunTipY, w: 2 * SCALE, h: 7 * SCALE, vx: -3.5 * SCALE, speed: 14 * SCALE, isPiercing: false },
            { x: gunCenterX - 1 * SCALE, y: gunTipY, prevX: gunCenterX - 1 * SCALE, prevY: gunTipY, w: 2 * SCALE, h: 7 * SCALE, vx: 3.5 * SCALE, speed: 14 * SCALE, isPiercing: false }
          );
          Audio.playPlayerShoot();
        } else if (pType === 'plasma') {
          // Piercing plasma hyper-beam
          this.playerBullets.push({
            x: gunCenterX - 2 * SCALE,
            y: gunTipY,
            prevX: gunCenterX - 2 * SCALE,
            prevY: gunTipY,
            w: 4 * SCALE,
            h: 10 * SCALE,
            vx: 0,
            speed: 16 * SCALE,
            isPiercing: true
          });
          Audio.playPlasmaShoot();
        } else {
          // Standard laser bolt
          this.playerBullets.push({
            x: gunCenterX - 1 * SCALE,
            y: gunTipY,
            prevX: gunCenterX - 1 * SCALE,
            prevY: gunTipY,
            w: 2 * SCALE,
            h: 7 * SCALE,
            vx: 0,
            speed: 15 * SCALE,
            isPiercing: false
          });
          Audio.playPlayerShoot();
        }
      }
    }

    /**
     * Overhauled Hitbox Detection with Continuous Swept Raycasting
     * Completely eliminates bullet tunneling regardless of speed!
     */
    updatePlayerBullets() {
      for (let b = this.playerBullets.length - 1; b >= 0; b--) {
        const bullet = this.playerBullets[b];
        bullet.prevX = bullet.x;
        bullet.prevY = bullet.y;

        bullet.x += (bullet.vx || 0);
        bullet.y -= bullet.speed;

        // Off screen top
        if (bullet.y <= 24 * SCALE) {
          this.playerBullets.splice(b, 1);
          continue;
        }

        // 1. UFO collision (with vertical sweep)
        if (this.ufo && !this.ufo.exploding) {
          const bTop = Math.min(bullet.y, bullet.prevY);
          const bBottom = Math.max(bullet.y, bullet.prevY);
          const ufoTop = this.ufo.y - 2 * SCALE;
          const ufoBottom = this.ufo.y + this.ufo.h + 2 * SCALE;

          if (
            bullet.x >= this.ufo.x - 4 * SCALE &&
            bullet.x <= this.ufo.x + this.ufo.w + 4 * SCALE &&
            bBottom >= ufoTop &&
            bTop <= ufoBottom
          ) {
            const scoreTable = [50, 100, 150, 300];
            const awarded = (this.shotsFired % 15 === 0) ? 300 : scoreTable[Math.floor(Math.random() * 3)];
            this.addScore(awarded);
            Audio.playUfoHit();
            this.triggerHitJuice(4, 10, 5);

            // UFO always drops guaranteed powerup!
            this.dropRandomPowerup(this.ufo.x + (this.ufo.w / 2), this.ufo.y + (this.ufo.h / 2), true);

            this.ufoScorePopup = {
              x: this.ufo.x,
              y: this.ufo.y,
              score: awarded,
              duration: 50
            };
            this.ufo = null;
            this.playerBullets.splice(b, 1);
            continue;
          }
        }

        // 2. Bunker collision
        if (this.bunkers.checkBulletCollision(bullet, true)) {
          if (!bullet.isPiercing) {
            this.playerBullets.splice(b, 1);
            continue;
          }
        }

        // 3. Alien Bombs collision in mid-air
        let hitBomb = false;
        for (let i = 0; i < this.alienBombs.length; i++) {
          const bomb = this.alienBombs[i];
          if (
            Math.abs(bullet.x - bomb.x) <= 5 * SCALE &&
            Math.abs(bullet.y - bomb.y) <= 7 * SCALE
          ) {
            this.explosion = {
              x: bomb.x - 4 * SCALE,
              y: bomb.y - 4 * SCALE,
              type: 'alien',
              duration: 8
            };
            this.alienBombs.splice(i, 1);
            if (!bullet.isPiercing) {
              this.playerBullets.splice(b, 1);
              hitBomb = true;
              break;
            }
          }
        }
        if (hitBomb) continue;

        // 4. Alien Swarm collision with 100% Reliable Continuous Swept Hitbox
        let hitAlien = false;
        for (let r = 0; r < this.alienRows; r++) {
          for (let c = 0; c < this.alienCols; c++) {
            const alien = this.aliens[r][c];
            if (!alien.alive) continue;

            const ax = this.swarmX + alien.relX;
            const ay = this.swarmY + alien.relY;

            // Swept vertical segment bounds
            const bTop = Math.min(bullet.y, bullet.prevY);
            const bBottom = Math.max(bullet.y, bullet.prevY);
            const aTop = ay - 2 * SCALE;
            const aBottom = ay + alien.height + 2 * SCALE;

            // Swept horizontal bounds with generous hit margin
            const bLeft = Math.min(bullet.x, bullet.prevX) - 2 * SCALE;
            const bRight = Math.max(bullet.x + bullet.w, bullet.prevX + bullet.w) + 2 * SCALE;
            const aLeft = ax - 3 * SCALE;
            const aRight = ax + alien.width + 3 * SCALE;

            const overlapY = (bBottom >= aTop && bTop <= aBottom);
            const overlapX = (bRight >= aLeft && bLeft <= aRight);

            if (overlapX && overlapY) {
              alien.alive = false;
              this.alienCount--;
              this.addScore(alien.points);
              Audio.playAlienExplosion();
              this.triggerHitJuice(2, 5, 2);

              // Chance to drop powerup capsule
              this.checkDropPowerup(ax + (alien.width / 2), ay + (alien.height / 2), alien.points);

              this.explosion = {
                x: ax,
                y: ay,
                type: 'alien',
                duration: 10
              };

              this.marchStepInterval = this.calculateStepInterval();

              if (!bullet.isPiercing) {
                this.playerBullets.splice(b, 1);
              }

              // Check if wave cleared -> Initiate Tower Ascension!
              if (this.alienCount === 0) {
                this.state = STATES.TOWER_ASCENDING;
                this.towerAscensionTimer = 110;
                this.ascensionBonus = this.wave * 500;
                this.addScore(this.ascensionBonus);
                Audio.playTowerAscend();
                Audio.stopUfoSiren();
              }

              hitAlien = true;
              break;
            }
          }
          if (hitAlien && !bullet.isPiercing) break;
        }
      }
    }

    updateSwarm() {
      this.marchTimer++;
      if (this.marchTimer < this.marchStepInterval) return;
      this.marchTimer = 0;

      // Find living bounds
      let minCol = this.alienCols;
      let maxCol = -1;
      let maxRow = -1;

      for (let r = 0; r < this.alienRows; r++) {
        for (let c = 0; c < this.alienCols; c++) {
          if (this.aliens[r][c].alive) {
            if (c < minCol) minCol = c;
            if (c > maxCol) maxCol = c;
            if (r > maxRow) maxRow = r;
          }
        }
      }

      if (maxCol === -1) return; // All dead

      const stepSize = 3.5 * SCALE; // Fast, snappy march across screen
      const dropSize = 8 * SCALE;

      // Calculate pixel edges
      const leftEdge = this.swarmX + minCol * 16 * SCALE;
      const rightEdge = this.swarmX + maxCol * 16 * SCALE + 12 * SCALE;

      let shouldDrop = false;
      if (this.swarmDir === 1 && rightEdge >= WIDTH - 10 * SCALE) {
        this.swarmDir = -1;
        shouldDrop = true;
      } else if (this.swarmDir === -1 && leftEdge <= 10 * SCALE) {
        this.swarmDir = 1;
        shouldDrop = true;
      }

      if (shouldDrop) {
        this.swarmY += dropSize;
      } else {
        this.swarmX += this.swarmDir * stepSize;
      }

      // Step animation & beat
      this.swarmStepAnim = 1 - this.swarmStepAnim;
      Audio.playMarchNote();

      // Check invasion condition (aliens reach player baseline)
      const lowestAlienY = this.swarmY + maxRow * 14 * SCALE + 8 * SCALE;
      if (lowestAlienY >= this.playerY) {
        this.killPlayer(true);
        return;
      }

      // Check alien eating bunkers
      for (let r = 0; r < this.alienRows; r++) {
        for (let c = 0; c < this.alienCols; c++) {
          const a = this.aliens[r][c];
          if (!a.alive) continue;
          const ax = this.swarmX + a.relX;
          const ay = this.swarmY + a.relY;
          if (ay + a.height >= HEIGHT - 64 * SCALE) {
            this.bunkers.eraseAlienOverlap(ax, ay, a.width, a.height);
          }
        }
      }
    }

    updateAlienBombs() {
      // Spawn bombs
      this.bombTimer++;
      if (this.bombTimer >= this.bombDropInterval && this.alienBombs.length < 4) {
        this.bombTimer = 0;
        this.dropAlienBomb();
      }

      // Update existing bombs
      for (let i = this.alienBombs.length - 1; i >= 0; i--) {
        const bomb = this.alienBombs[i];
        bomb.y += bomb.speed;
        bomb.animFrame = (bomb.animFrame + 1) % 4;

        // Ground collision
        if (bomb.y >= HEIGHT - 18 * SCALE) {
          this.alienBombs.splice(i, 1);
          continue;
        }

        // Bunker collision
        if (this.bunkers.checkBulletCollision(bomb, false)) {
          this.alienBombs.splice(i, 1);
          continue;
        }

        // Player collision
        if (
          bomb.x >= this.playerX - 2 * SCALE &&
          bomb.x <= this.playerX + this.playerWidth + 2 * SCALE &&
          bomb.y >= this.playerY - 2 * SCALE &&
          bomb.y <= this.playerY + this.playerHeight
        ) {
          // If forcefield shield is active, deflect bomb without dying!
          if (this.playerShieldHits > 0) {
            this.playerShieldHits--;
            Audio.playShieldDeflect();
            this.triggerHitJuice(3, 8, 3);
            this.alienBombs.splice(i, 1);
            if (this.playerShieldHits <= 0 && this.activePowerup?.type === 'shield') {
              this.activePowerup = null;
            }
            continue;
          }

          this.alienBombs.splice(i, 1);
          this.killPlayer(false);
          return;
        }
      }
    }

    dropAlienBomb() {
      const candidateCols = [];
      for (let c = 0; c < this.alienCols; c++) {
        for (let r = this.alienRows - 1; r >= 0; r--) {
          if (this.aliens[r][c].alive) {
            candidateCols.push({ col: c, row: r });
            break;
          }
        }
      }

      if (candidateCols.length === 0) return;

      const shooter = candidateCols[Math.floor(Math.random() * candidateCols.length)];
      const ax = this.swarmX + shooter.col * 16 * SCALE + 5 * SCALE;
      const ay = this.swarmY + shooter.row * 14 * SCALE + 8 * SCALE;

      const types = ['rolling', 'plunger', 'squiggly'];
      const bombType = types[Math.floor(Math.random() * types.length)];

      this.alienBombs.push({
        x: ax,
        y: ay,
        type: bombType,
        animFrame: 0,
        speed: (4.0 + Math.min(2.5, this.wave * 0.35)) * SCALE
      });
    }

    updateUfo() {
      if (!this.ufo) {
        this.ufoTimer++;
        if (this.ufoTimer >= this.ufoSpawnInterval) {
          this.ufoTimer = 0;
          this.ufoSpawnInterval = 350 + Math.floor(Math.random() * 250);

          const fromLeft = Math.random() < 0.5;
          const ufoW = 16 * SCALE;
          const ufoH = 7 * SCALE;

          this.ufo = {
            x: fromLeft ? -ufoW : WIDTH,
            y: 30 * SCALE,
            w: ufoW,
            h: ufoH,
            speed: (fromLeft ? 1 : -1) * 2.8 * SCALE
          };
          Audio.startUfoSiren();
        }
      } else {
        this.ufo.x += this.ufo.speed;
        if (
          (this.ufo.speed > 0 && this.ufo.x > WIDTH + 10 * SCALE) ||
          (this.ufo.speed < 0 && this.ufo.x < -20 * SCALE)
        ) {
          Audio.stopUfoSiren();
          this.ufo = null;
        }
      }
    }

    /**
     * Tower Level Ascension Sequence
     */
    updateTowerAscension() {
      this.towerAscensionTimer--;

      // Spawn thruster rocket sparks below cannon
      for (let i = 0; i < 3; i++) {
        this.thrusterParticles.push({
          x: this.playerX + (this.playerWidth / 2) + (Math.random() * 12 - 6) * SCALE,
          y: this.playerY + this.playerHeight,
          vx: (Math.random() * 2 - 1) * SCALE,
          vy: (3.5 + Math.random() * 4) * SCALE,
          life: 20,
          maxLife: 20,
          color: Math.random() < 0.5 ? '#00FF66' : '#FFE600'
        });
      }

      // Update particles
      for (let i = this.thrusterParticles.length - 1; i >= 0; i--) {
        const pt = this.thrusterParticles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        if (pt.life <= 0) {
          this.thrusterParticles.splice(i, 1);
        }
      }

      if (this.towerAscensionTimer <= 0) {
        this.initWave(this.wave + 1, this.score, this.lives);
        this.bunkers.repair(0.4); // Tower ascension structural recharge
        this.state = STATES.PLAYING;
      }
    }

    killPlayer(isInvasion) {
      this.state = STATES.PLAYER_DYING;
      this.playerDyingTimer = 85;
      this.triggerHitJuice(5, 18, 10);
      Audio.stopUfoSiren();
      Audio.playPlayerDeath();

      if (isInvasion) {
        this.lives = 0;
      } else {
        this.lives--;
      }
      this.triggerStats();
    }

    updatePlayerDying() {
      this.playerDyingTimer--;
      if (this.playerDyingTimer % 6 === 0) {
        this.playerDeathFrame = 1 - this.playerDeathFrame;
      }

      if (this.playerDyingTimer <= 0) {
        if (this.lives <= 0) {
          this.state = STATES.GAME_OVER;
        } else {
          // Respawn player
          this.playerX = (WIDTH - this.playerWidth) / 2;
          this.playerBullets = [];
          this.alienBombs = [];
          this.activePowerup = null;
          this.playerShieldHits = 0;
          this.state = STATES.PLAYING;
        }
        this.triggerStats();
      }
    }

    // =========================================================================
    // ATTRACT MODE (Classic Arcade Title & Easter Egg Animation)
    // =========================================================================

    updateAttract() {
      this.attractFrame++;
      if (this.attractStep === 0) {
        this.attractAlienX = WIDTH + 10 * SCALE;
        this.hasFixedY = false;
        this.attractStep = 1;
      } else if (this.attractStep === 1) {
        this.attractAlienX -= 1 * SCALE;
        if (this.attractAlienX <= (WIDTH / 2) + 20 * SCALE) {
          this.attractStep = 2;
          this.attractWait = 40;
        }
      } else if (this.attractStep === 2) {
        this.attractWait--;
        if (this.attractWait <= 0) {
          this.hasFixedY = true;
          this.attractStep = 3;
        }
      } else if (this.attractStep === 3) {
        this.attractAlienX -= 1 * SCALE;
        if (this.attractAlienX < -20 * SCALE) {
          this.attractStep = 0;
        }
      }
    }

    // =========================================================================
    // RENDER PASS
    // =========================================================================

    render() {
      this.ctx.save();

      // Screen Shake
      if (this.shakeDuration > 0) {
        const ox = (Math.random() * 2 - 1) * this.shakeIntensity;
        const oy = (Math.random() * 2 - 1) * this.shakeIntensity;
        this.ctx.translate(ox, oy);
        this.shakeDuration--;
      }

      // Background clear
      if (this.palette.overlayMode === 'lunar') {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.ctx.fillStyle = 'rgba(2, 5, 10, 0.45)';
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
      } else {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }

      // Tactical Nuke Screen Flash
      if (this.nukeFlash > 0) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.nukeFlash / 16})`;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }

      // HUD Header
      this.renderHUD();

      // Orbital Tower Spire Graphic on Right Edge
      this.renderTowerSpire();

      if (this.state === STATES.ATTRACT) {
        this.renderAttract();
      } else {
        this.renderGameWorld();
      }

      // Ground Line
      this.ctx.fillStyle = this.getColorAtY(HEIGHT - 16 * SCALE, this.palette.ground);
      this.ctx.fillRect(0, HEIGHT - 16 * SCALE, WIDTH, 1 * SCALE);

      // Bottom Status: Lives Cannon icons & Credits
      this.renderFooter();

      // Active Powerup HUD Badge & Floating Alert
      this.renderPowerupHUD();

      // Tower Ascension Sequence Banner
      if (this.state === STATES.TOWER_ASCENDING) {
        this.renderTowerAscensionBanner();
      }

      // Pause Banner
      if (this.state === STATES.PAUSED) {
        this.renderPauseBanner();
      }

      // Game Over Banner
      if (this.state === STATES.GAME_OVER) {
        this.renderGameOverBanner();
      }

      this.ctx.restore();
    }

    getColorAtY(y, defaultColor) {
      if (this.palette.overlayMode === 'cellophane' || this.palette.overlayMode === 'lunar') {
        if (y < 46 * SCALE) {
          return '#FF2222';
        } else if (y >= HEIGHT - 68 * SCALE) {
          return '#00FF44';
        } else {
          return '#FFFFFF';
        }
      }
      return defaultColor;
    }

    renderHUD() {
      const p = this.palette;
      const textCol = p.text;

      // SCORE<1>
      Sprites.drawText(this.ctx, 'SCORE<1>', 14 * SCALE, 10 * SCALE, SCALE, textCol);
      const scoreStr = String(this.score).padStart(4, '0');
      Sprites.drawText(this.ctx, scoreStr, 22 * SCALE, 20 * SCALE, SCALE, textCol);

      // HI-SCORE
      Sprites.drawText(this.ctx, 'HI-SCORE', (WIDTH / 2) - 26 * SCALE, 10 * SCALE, SCALE, textCol);
      const hiScoreStr = String(this.highScore).padStart(4, '0');
      Sprites.drawText(this.ctx, hiScoreStr, (WIDTH / 2) - 16 * SCALE, 20 * SCALE, SCALE, textCol);

      // Current Tower Tier & Altitude
      const currentTier = TOWER_TIERS[(this.wave - 1) % TOWER_TIERS.length];
      Sprites.drawText(this.ctx, 'TIER ' + this.wave, WIDTH - 72 * SCALE, 10 * SCALE, SCALE, currentTier.color);
      Sprites.drawText(this.ctx, currentTier.altitude, WIDTH - 72 * SCALE, 20 * SCALE, SCALE, textCol);
    }

    /**
     * Render the Ascension Tower Spire along the right side of the screen
     */
    renderTowerSpire() {
      const spireX = WIDTH - 8 * SCALE;
      const topY = 40 * SCALE;
      const bottomY = HEIGHT - 22 * SCALE;
      const totalHeight = bottomY - topY;

      // Vertical elevator track line
      this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(spireX, topY);
      this.ctx.lineTo(spireX, bottomY);
      this.ctx.stroke();

      // Render 6 Tier Nodes
      const tierCount = TOWER_TIERS.length;
      const currentTierIndex = (this.wave - 1) % tierCount;

      for (let i = 0; i < tierCount; i++) {
        const nodeY = bottomY - (i / (tierCount - 1)) * totalHeight;
        const isCurrent = (i === currentTierIndex);

        this.ctx.fillStyle = isCurrent ? '#FFE600' : (i < currentTierIndex ? '#00FF66' : 'rgba(100, 130, 160, 0.4)');
        this.ctx.fillRect(spireX - 2 * SCALE, nodeY - 1 * SCALE, 5 * SCALE, 2 * SCALE);

        // Blinking beacon on current active tier
        if (isCurrent && Math.floor(performance.now() * 0.005) % 2 === 0) {
          this.ctx.fillStyle = '#00E5FF';
          this.ctx.beginPath();
          this.ctx.arc(spireX + 0.5 * SCALE, nodeY, 3 * SCALE, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    renderPowerupHUD() {
      // 1. Active Powerup Duration Bar at top
      if (this.activePowerup) {
        const ap = this.activePowerup;
        const barWidth = 100 * SCALE;
        const barX = (WIDTH - barWidth) / 2;
        const barY = 32 * SCALE;
        const progress = ap.timer / ap.maxTimer;

        // Background bar
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(barX - 2 * SCALE, barY - 2 * SCALE, barWidth + 4 * SCALE, 6 * SCALE);

        // Filled time bar
        this.ctx.fillStyle = ap.color || '#00FF66';
        this.ctx.fillRect(barX, barY, barWidth * progress, 3 * SCALE);

        // Label
        Sprites.drawText(this.ctx, ap.name, (WIDTH / 2) - 40 * SCALE, barY - 8 * SCALE, 1.2 * SCALE, ap.color);
      }

      // 2. Floating Powerup Pickup Alert Banner
      if (this.powerupBanner) {
        const pb = this.powerupBanner;
        Sprites.drawText(
          this.ctx,
          pb.text,
          (WIDTH / 2) - (pb.text.length * 2.5 * SCALE),
          (HEIGHT / 2) - 48 * SCALE,
          SCALE,
          pb.color || '#00E5FF'
        );
      }
    }

    renderFooter() {
      const p = this.palette;
      const greenCol = this.getColorAtY(HEIGHT - 8 * SCALE, p.player);

      // Lives count digit
      Sprites.drawText(this.ctx, String(this.lives), 10 * SCALE, HEIGHT - 12 * SCALE, SCALE, greenCol);

      // Lives Cannon icons
      for (let i = 0; i < Math.max(0, this.lives - 1); i++) {
        Sprites.drawSprite(
          this.ctx,
          Sprites.SPRITES.cannon[0],
          (20 + i * 16) * SCALE,
          HEIGHT - 13 * SCALE,
          SCALE,
          greenCol
        );
      }

      // CREDITS
      const credText = 'CREDIT ' + String(this.credits).padStart(2, '0');
      Sprites.drawText(this.ctx, credText, WIDTH - 78 * SCALE, HEIGHT - 12 * SCALE, SCALE, greenCol);
    }

    renderGameWorld() {
      const p = this.palette;

      // 1. Mystery UFO
      if (this.ufo) {
        const ufoCol = this.getColorAtY(this.ufo.y, p.ufo);
        Sprites.drawSprite(this.ctx, Sprites.SPRITES.ufo[0], this.ufo.x, this.ufo.y, SCALE, ufoCol);
      }

      // UFO floating bonus score
      if (this.ufoScorePopup) {
        const ufoCol = this.getColorAtY(this.ufoScorePopup.y, p.ufo);
        Sprites.drawText(
          this.ctx,
          String(this.ufoScorePopup.score),
          this.ufoScorePopup.x,
          this.ufoScorePopup.y,
          SCALE,
          ufoCol
        );
      }

      // 2. Swarm Aliens
      for (let r = 0; r < this.alienRows; r++) {
        for (let c = 0; c < this.alienCols; c++) {
          const a = this.aliens[r][c];
          if (!a.alive) continue;

          const ax = this.swarmX + a.relX;
          const ay = this.swarmY + a.relY;

          let col = p.squid;
          let spriteList = Sprites.SPRITES.squid;
          if (a.type === 'crab') {
            col = p.crab;
            spriteList = Sprites.SPRITES.crab;
          } else if (a.type === 'octopus') {
            col = p.octopus;
            spriteList = Sprites.SPRITES.octopus;
          }

          const actualCol = this.getColorAtY(ay, col);
          const matrix = spriteList[this.swarmStepAnim];
          Sprites.drawSprite(this.ctx, matrix, ax, ay, SCALE, actualCol);
        }
      }

      // 3. Falling Powerup Pods (Pulsing glowing 8-bit capsules)
      for (const pod of this.powerups) {
        let sprite = Sprites.SPRITES.powerupSpread[0];
        let podColor = '#00E5FF';

        if (pod.type === 'plasma') {
          sprite = Sprites.SPRITES.powerupPlasma[0];
          podColor = '#00FF66';
        } else if (pod.type === 'shield') {
          sprite = Sprites.SPRITES.powerupShield[0];
          podColor = '#FFE600';
        } else if (pod.type === 'rapid') {
          sprite = Sprites.SPRITES.powerupRapid[0];
          podColor = '#FF7700';
        } else if (pod.type === 'nuke') {
          sprite = Sprites.SPRITES.powerupNuke[0];
          podColor = '#FF2222';
        }

        // Draw pulsing powerup sprite
        Sprites.drawSprite(this.ctx, sprite, pod.x, pod.y, SCALE, podColor);
      }

      // 4. Alien Explosions
      if (this.explosion) {
        const expCol = this.getColorAtY(this.explosion.y, '#FFFFFF');
        Sprites.drawSprite(
          this.ctx,
          Sprites.SPRITES.alienExplosion[0],
          this.explosion.x,
          this.explosion.y,
          SCALE,
          expCol
        );
      }

      // 5. Bunkers
      const bunkerCol = this.getColorAtY(HEIGHT - 60 * SCALE, p.bunker);
      this.bunkers.draw(this.ctx, bunkerCol);

      // 6. Player Cannon & Forcefield Bubble
      if (this.state === STATES.PLAYER_DYING) {
        const expMatrix = Sprites.SPRITES.playerExplosion[this.playerDeathFrame];
        Sprites.drawSprite(
          this.ctx,
          expMatrix,
          this.playerX - 2 * SCALE,
          this.playerY,
          SCALE,
          this.getColorAtY(this.playerY, p.player)
        );
      } else {
        Sprites.drawSprite(
          this.ctx,
          Sprites.SPRITES.cannon[0],
          this.playerX,
          this.playerY,
          SCALE,
          this.getColorAtY(this.playerY, p.player)
        );

        // Forcefield Shield Bubble Aura
        if (this.playerShieldHits > 0) {
          const centerX = this.playerX + (this.playerWidth / 2);
          const centerY = this.playerY + (this.playerHeight / 2);
          this.ctx.save();
          this.ctx.strokeStyle = this.playerShieldHits === 2 ? '#FFE600' : '#00E5FF';
          this.ctx.lineWidth = 1.5;
          this.ctx.beginPath();
          this.ctx.ellipse(centerX, centerY, (this.playerWidth / 2) + 6 * SCALE, (this.playerHeight / 2) + 5 * SCALE, 0, 0, Math.PI * 2);
          this.ctx.stroke();

          // Subtle shield glow fill
          this.ctx.fillStyle = this.playerShieldHits === 2 ? 'rgba(255, 230, 0, 0.15)' : 'rgba(0, 229, 255, 0.15)';
          this.ctx.fill();
          this.ctx.restore();
        }
      }

      // 7. Player Lasers
      for (const b of this.playerBullets) {
        const col = b.isPiercing ? '#00FFAA' : this.getColorAtY(b.y, p.bullet);
        this.ctx.fillStyle = col;
        this.ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.w, b.h);
      }

      // Point-and-Click Aim Reticle & Guide Beam
      if (Input.pointerX !== null || Input.isPointerDown) {
        const aimX = this.playerX + (this.playerWidth / 2);
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 255, 85, 0.28)';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([4, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(aimX, this.playerY - 6 * SCALE);
        this.ctx.lineTo(aimX, 32 * SCALE);
        this.ctx.stroke();

        // Laser Reticle Ring
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'rgba(0, 255, 85, 0.6)';
        this.ctx.fillStyle = 'rgba(0, 255, 85, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(aimX, 34 * SCALE, 4 * SCALE, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
      }

      // 8. Alien Bombs
      for (const bomb of this.alienBombs) {
        let shotFrames = Sprites.SPRITES.shotRolling;
        if (bomb.type === 'plunger') shotFrames = Sprites.SPRITES.shotPlunger;
        if (bomb.type === 'squiggly') shotFrames = Sprites.SPRITES.shotSquiggly;

        const matrix = shotFrames[bomb.animFrame % shotFrames.length];
        const bombCol = this.getColorAtY(bomb.y, p.bomb);
        Sprites.drawSprite(this.ctx, matrix, bomb.x, bomb.y, SCALE, bombCol);
      }

      // 9. Rocket Thruster Exhaust Particles (During Ascension)
      for (const pt of this.thrusterParticles) {
        this.ctx.fillStyle = pt.color;
        this.ctx.fillRect(Math.floor(pt.x), Math.floor(pt.y), 2 * SCALE, 2 * SCALE);
      }
    }

    /**
     * Cinematic Level Ascension Banner (Orbital Elevator Climbing)
     */
    renderTowerAscensionBanner() {
      const centerX = WIDTH / 2;
      const centerY = HEIGHT / 2;

      this.ctx.fillStyle = 'rgba(0, 5, 12, 0.85)';
      this.ctx.fillRect(0, centerY - 38 * SCALE, WIDTH, 76 * SCALE);

      // Ascension Title
      Sprites.drawText(this.ctx, '* TIER CLEARED! *', centerX - 56 * SCALE, centerY - 24 * SCALE, SCALE, '#FFE600');

      // Altitude Tier Target
      const nextTier = TOWER_TIERS[this.wave % TOWER_TIERS.length];
      const targetText = 'ASCENDING: ' + nextTier.name;
      Sprites.drawText(this.ctx, targetText, centerX - (targetText.length * 3 * SCALE), centerY - 8 * SCALE, SCALE, nextTier.color);

      // Altitude Meter
      const altText = 'ALTITUDE: ' + nextTier.altitude;
      Sprites.drawText(this.ctx, altText, centerX - (altText.length * 3 * SCALE), centerY + 6 * SCALE, SCALE, '#00E5FF');

      // Ascension Score Bonus
      const bonusText = '+' + this.ascensionBonus + ' ASCENSION BONUS';
      Sprites.drawText(this.ctx, bonusText, centerX - (bonusText.length * 3 * SCALE), centerY + 20 * SCALE, SCALE, '#00FF66');
    }

    renderAttract() {
      const p = this.palette;
      const textCol = p.text;
      const centerX = WIDTH / 2;

      // P L A Y
      Sprites.drawText(this.ctx, 'P L A', centerX - 28 * SCALE, 44 * SCALE, SCALE, textCol);
      if (this.hasFixedY) {
        Sprites.drawText(this.ctx, 'Y', centerX + 12 * SCALE, 44 * SCALE, SCALE, textCol);
      } else {
        Sprites.drawText(this.ctx, 'V', centerX + 12 * SCALE, 44 * SCALE, SCALE, textCol);
      }

      // SPACE  INVADERS
      Sprites.drawText(this.ctx, 'SPACE  INVADERS', centerX - 56 * SCALE, 60 * SCALE, SCALE, textCol);

      // *SCORE ADVANCE TABLE*
      Sprites.drawText(this.ctx, '*SCORE ADVANCE TABLE*', centerX - 76 * SCALE, 84 * SCALE, SCALE, textCol);

      // UFO = ? MYSTERY
      Sprites.drawSprite(this.ctx, Sprites.SPRITES.ufo[0], centerX - 48 * SCALE, 100 * SCALE, SCALE, p.ufo);
      Sprites.drawText(this.ctx, '= ?  MYSTERY', centerX - 24 * SCALE, 101 * SCALE, SCALE, textCol);

      // Squid = 30 POINTS
      Sprites.drawSprite(this.ctx, Sprites.SPRITES.squid[0], centerX - 44 * SCALE, 116 * SCALE, SCALE, p.squid);
      Sprites.drawText(this.ctx, '= 30 POINTS', centerX - 24 * SCALE, 117 * SCALE, SCALE, textCol);

      // Crab = 20 POINTS
      Sprites.drawSprite(this.ctx, Sprites.SPRITES.crab[0], centerX - 46 * SCALE, 132 * SCALE, SCALE, p.crab);
      Sprites.drawText(this.ctx, '= 20 POINTS', centerX - 24 * SCALE, 133 * SCALE, SCALE, textCol);

      // Octopus = 10 POINTS
      Sprites.drawSprite(this.ctx, Sprites.SPRITES.octopus[0], centerX - 47 * SCALE, 148 * SCALE, SCALE, p.octopus);
      Sprites.drawText(this.ctx, '= 10 POINTS', centerX - 24 * SCALE, 149 * SCALE, SCALE, textCol);

      // Powerups Guide
      Sprites.drawText(this.ctx, '*POWERUPS: S P R N*', centerX - 66 * SCALE, 168 * SCALE, SCALE, '#00E5FF');

      // Animated Easter Egg Alien walking
      if (this.attractStep > 0) {
        const walkFrame = Math.floor(this.attractFrame / 10) % 2;
        Sprites.drawSprite(
          this.ctx,
          Sprites.SPRITES.squid[walkFrame],
          this.attractAlienX,
          44 * SCALE,
          SCALE,
          p.squid
        );
      }

      // INSERT COIN / PRESS START
      const blink = Math.floor(this.attractFrame / 30) % 2 === 0;
      if (blink) {
        Sprites.drawText(this.ctx, 'PRESS 1 OR FIRE TO START', centerX - 84 * SCALE, 192 * SCALE, SCALE, '#FFE600');
      }

      // High Score Dip Switch Note
      Sprites.drawText(this.ctx, 'TAITO 1978 REPLICA', centerX - 62 * SCALE, 214 * SCALE, SCALE, '#00FF66');
    }

    renderPauseBanner() {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, (HEIGHT / 2) - 24 * SCALE, WIDTH, 48 * SCALE);

      Sprites.drawText(
        this.ctx,
        'P A U S E D',
        (WIDTH / 2) - 38 * SCALE,
        (HEIGHT / 2) - 10 * SCALE,
        SCALE,
        '#FFE600'
      );
      Sprites.drawText(
        this.ctx,
        'PRESS P TO RESUME',
        (WIDTH / 2) - 54 * SCALE,
        (HEIGHT / 2) + 6 * SCALE,
        SCALE,
        '#FFFFFF'
      );
    }

    renderGameOverBanner() {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, (HEIGHT / 2) - 28 * SCALE, WIDTH, 56 * SCALE);

      Sprites.drawText(
        this.ctx,
        'G A M E   O V E R',
        (WIDTH / 2) - 58 * SCALE,
        (HEIGHT / 2) - 12 * SCALE,
        SCALE,
        '#FF2222'
      );
      Sprites.drawText(
        this.ctx,
        'PRESS FIRE TO RESTART',
        (WIDTH / 2) - 72 * SCALE,
        (HEIGHT / 2) + 6 * SCALE,
        SCALE,
        '#FFFFFF'
      );
    }

    // Main 60 FPS Loop
    loop(timestamp) {
      this.update();
      this.render();
      window.requestAnimationFrame((ts) => this.loop(ts));
    }

    start() {
      window.requestAnimationFrame((ts) => this.loop(ts));
    }
  }

  window.SpaceInvadersGame = SpaceInvadersGame;
})(window);
