/**
 * CHANCENVADERS 1978 - Authentic Lunar Diorama Backdrop (Pepper's Ghost Illusion)
 * Replicates the physical painted lunar cardboard diorama placed behind the 
 * 45-degree half-silvered mirror in the original 1978 Taito / Midway upright cabinets
 * (as seen on the Arcade1Up / iiRcade cabinet in Papa Brad's Gaming video).
 */

(function (window) {
  'use strict';

  class LunarBackdrop {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.stars = [];
      this.initStars(80);
    }

    initStars(count) {
      this.stars = [];
      for (let i = 0; i < count; i++) {
        this.stars.push({
          x: Math.random(),
          y: Math.random() * 0.75, // in the upper space region
          size: Math.random() < 0.2 ? 2.5 : 1.2,
          brightness: 0.3 + Math.random() * 0.7,
          twinkleSpeed: 0.02 + Math.random() * 0.04,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    render(width, height) {
      if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width;
        this.canvas.height = height;
      }

      const ctx = this.ctx;

      // Deep celestial space gradient
      const spaceGrad = ctx.createLinearGradient(0, 0, 0, height);
      spaceGrad.addColorStop(0, '#04060c');
      spaceGrad.addColorStop(0.5, '#080d1a');
      spaceGrad.addColorStop(0.75, '#121929');
      spaceGrad.addColorStop(1, '#18201a');
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant Stars with subtle twinkle
      const now = performance.now() * 0.001;
      for (const s of this.stars) {
        const alpha = Math.max(0.2, Math.min(1, s.brightness + Math.sin(now * s.twinkleSpeed * 20 + s.phase) * 0.25));
        ctx.fillStyle = `rgba(220, 240, 255, ${alpha})`;
        ctx.fillRect(Math.floor(s.x * width), Math.floor(s.y * height), s.size, s.size);
      }

      // Distant Glowing Planet / Moon in upper left
      const moonX = width * 0.2;
      const moonY = height * 0.24;
      const moonR = width * 0.14;

      const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 2.2);
      moonGlow.addColorStop(0, 'rgba(255, 90, 40, 0.25)');
      moonGlow.addColorStop(0.6, 'rgba(220, 40, 30, 0.08)');
      moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Planet Sphere
      const planetGrad = ctx.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.3, moonR * 0.1, moonX, moonY, moonR);
      planetGrad.addColorStop(0, '#ff7a36');
      planetGrad.addColorStop(0.6, '#cc3311');
      planetGrad.addColorStop(1, '#550e05');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      // Planet Craters
      ctx.fillStyle = 'rgba(60, 10, 5, 0.45)';
      ctx.beginPath();
      ctx.arc(moonX - moonR * 0.2, moonY - moonR * 0.1, moonR * 0.22, 0, Math.PI * 2);
      ctx.arc(moonX + moonR * 0.35, moonY + moonR * 0.15, moonR * 0.16, 0, Math.PI * 2);
      ctx.arc(moonX + moonR * 0.1, moonY - moonR * 0.4, moonR * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Lunar Surface Terrain Horizon (sitting right beneath the bunkers)
      const horizonY = height * 0.72;

      // Distant Mountain Ridges
      ctx.fillStyle = '#16222b';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, horizonY + 20);
      ctx.lineTo(width * 0.15, horizonY - 10);
      ctx.lineTo(width * 0.35, horizonY + 15);
      ctx.lineTo(width * 0.55, horizonY - 18);
      ctx.lineTo(width * 0.75, horizonY + 8);
      ctx.lineTo(width * 0.9, horizonY - 6);
      ctx.lineTo(width, horizonY + 12);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Foreground Lunar Crust & Crater Rim (Taito 1978 style)
      const crustGrad = ctx.createLinearGradient(0, horizonY + 10, 0, height);
      crustGrad.addColorStop(0, '#1c2d33');
      crustGrad.addColorStop(0.5, '#23383a');
      crustGrad.addColorStop(1, '#0c1817');
      ctx.fillStyle = crustGrad;

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, horizonY + 35);
      ctx.quadraticCurveTo(width * 0.25, horizonY + 10, width * 0.45, horizonY + 30);
      ctx.quadraticCurveTo(width * 0.7, horizonY + 45, width, horizonY + 25);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Lunar Craters on ground
      const drawLunarCrater = (cx, cy, rx, ry) => {
        // Shadow rim
        ctx.fillStyle = '#0b1615';
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight rim
        ctx.strokeStyle = '#3d5c58';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 1, rx * 0.95, ry * 0.85, 0, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();
      };

      drawLunarCrater(width * 0.22, height * 0.88, width * 0.12, height * 0.035);
      drawLunarCrater(width * 0.75, height * 0.86, width * 0.16, height * 0.045);
      drawLunarCrater(width * 0.48, height * 0.94, width * 0.09, height * 0.025);

      // Subtle atmospheric Pepper's Ghost mirror reflection sheen
      const mirrorSheen = ctx.createLinearGradient(0, 0, width, height);
      mirrorSheen.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      mirrorSheen.addColorStop(0.35, 'rgba(255, 255, 255, 0)');
      mirrorSheen.addColorStop(0.7, 'rgba(0, 220, 255, 0.03)');
      mirrorSheen.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = mirrorSheen;
      ctx.fillRect(0, 0, width, height);
    }
  }

  window.SpaceInvadersBackdrop = LunarBackdrop;
})(window);
