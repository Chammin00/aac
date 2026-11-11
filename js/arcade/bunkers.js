/**
 * CHANCENVADERS 1978 - Destructible Bunker / Shield System
 * 4 authentic bunkers with pixel-by-pixel erosion from bullets and alien invasion.
 */

(function (window) {
  'use strict';

  const SPRITES = window.SpaceInvadersSprites.SPRITES;

  class Bunker {
    constructor(x, y, scale) {
      this.x = x;
      this.y = y;
      this.scale = scale;
      this.width = 22 * scale;
      this.height = 16 * scale;

      // Copy default 22x16 template
      const template = SPRITES.bunker[0];
      this.grid = [];
      for (let r = 0; r < 16; r++) {
        this.grid[r] = new Uint8Array(22);
        for (let c = 0; c < 22; c++) {
          this.grid[r][c] = template[r][c];
        }
      }
    }

    /**
     * Check collision with point (px, py).
     * If hit, carve out damage crater and return true.
     */
    checkHit(px, py, isFromBelow) {
      if (
        px < this.x ||
        px >= this.x + this.width ||
        py < this.y ||
        py >= this.y + this.height
      ) {
        return false;
      }

      const col = Math.floor((px - this.x) / this.scale);
      const row = Math.floor((py - this.y) / this.scale);

      if (row < 0 || row >= 16 || col < 0 || col >= 22) return false;

      // Check if there is solid pixel at impact
      if (this.grid[row][col] === 1) {
        this.carveCrater(col, row, isFromBelow);
        return true;
      }

      return false;
    }

    /**
     * Carve realistic jagged blast crater around (centerCol, centerRow)
     */
    carveCrater(centerCol, centerRow, isFromBelow) {
      // Authentic bite radius (2 to 3 pixels with ragged edges)
      const radius = 2.5;
      const rCeil = Math.ceil(radius);

      for (let dr = -rCeil; dr <= rCeil; dr++) {
        for (let dc = -rCeil; dc <= rCeil; dc++) {
          const r = centerRow + dr;
          const c = centerCol + dc;

          if (r >= 0 && r < 16 && c >= 0 && c < 22) {
            const dist = Math.sqrt(dc * dc + dr * dr);
            // Slight directional bias (upward vs downward blast)
            const bias = isFromBelow ? (dr < 0 ? 0.3 : 0) : (dr > 0 ? 0.3 : 0);
            if (dist <= radius + bias + (Math.random() * 0.4 - 0.2)) {
              this.grid[r][c] = 0;
            }
          }
        }
      }
    }

    /**
     * When alien body physically overlaps the bunker, alien eats through bunker
     */
    eraseAlienOverlap(ax, ay, aw, ah) {
      const startCol = Math.max(0, Math.floor((ax - this.x) / this.scale));
      const endCol = Math.min(21, Math.floor((ax + aw - this.x) / this.scale));
      const startRow = Math.max(0, Math.floor((ay - this.y) / this.scale));
      const endRow = Math.min(15, Math.floor((ay + ah - this.y) / this.scale));

      if (startCol <= endCol && startRow <= endRow) {
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            this.grid[r][c] = 0;
          }
        }
      }
    }

    repair(fraction = 0.5) {
      const template = SPRITES.bunker[0];
      for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 22; c++) {
          if (template[r][c] === 1 && this.grid[r][c] === 0) {
            if (Math.random() < fraction) {
              this.grid[r][c] = 1;
            }
          }
        }
      }
    }

    draw(ctx, color) {
      ctx.fillStyle = color;
      for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 22; c++) {
          if (this.grid[r][c] === 1) {
            ctx.fillRect(
              Math.floor(this.x + c * this.scale),
              Math.floor(this.y + r * this.scale),
              this.scale,
              this.scale
            );
          }
        }
      }
    }
  }

  class BunkerManager {
    constructor(canvasWidth, bunkerY, scale) {
      this.bunkers = [];
      this.initBunkers(canvasWidth, bunkerY, scale);
    }

    initBunkers(canvasWidth, bunkerY, scale) {
      this.bunkers = [];
      const numBunkers = 4;
      const bunkerPixelWidth = 22 * scale;
      // Evenly distribute 4 bunkers across canvas
      const totalBunkersWidth = numBunkers * bunkerPixelWidth;
      const spacing = (canvasWidth - totalBunkersWidth) / (numBunkers + 1);

      for (let i = 0; i < numBunkers; i++) {
        const bx = Math.round(spacing + i * (bunkerPixelWidth + spacing));
        this.bunkers.push(new Bunker(bx, bunkerY, scale));
      }
    }

    reset(canvasWidth, bunkerY, scale) {
      this.initBunkers(canvasWidth, bunkerY, scale);
    }

    repair(fraction = 0.5) {
      for (const bunker of this.bunkers) {
        bunker.repair(fraction);
      }
    }

    checkBulletCollision(bullet, isPlayerBullet) {
      for (const bunker of this.bunkers) {
        if (bunker.checkHit(bullet.x, bullet.y, isPlayerBullet)) {
          return true;
        }
      }
      return false;
    }

    eraseAlienOverlap(ax, ay, aw, ah) {
      for (const bunker of this.bunkers) {
        bunker.eraseAlienOverlap(ax, ay, aw, ah);
      }
    }

    draw(ctx, color) {
      for (const bunker of this.bunkers) {
        bunker.draw(ctx, color);
      }
    }
  }

  window.SpaceInvadersBunkers = BunkerManager;
})(window);
