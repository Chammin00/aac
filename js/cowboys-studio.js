/**
 * ============================================================================
 *  DALLAS COWBOYS MEGA STADIUM 3D STUDIO — AMINA AAC INTEGRATION
 *  AT&T-Style Colossal Domed Football Stadium · Accessible 3D WebGL Engine
 *  - Mode 1: Free Roam Stadium (120-yd field, 50-yd Star, End Zones, Tunnel)
 *  - Mode 2: QB Throw Challenge (6 moving targets, 3D spiral arc, streak bonus)
 *  - Mode 3: Field Goal Kicking (Power/Accuracy meter, wind, DOINK/GOOD physics)
 *  - Accessibility: 1-Switch Mode, Direct Touch Aim, Voice Cheering, AAC Dialogue Bridge
 * ============================================================================
 */

(function () {
  'use strict';

  const BASE_Y = 0.0;
  const FIELD_LEN = 120.0;
  const FIELD_W = 53.3;
  const NORTH_GOAL_Z = -60.0;
  const SOUTH_GOAL_Z = 60.0;
  const CROSSBAR_Y = 3.05;
  const UPRIGHT_HALF_W = 2.82;
  const UPRIGHT_TOP_Y = 12.2;
  const GRAVITY = 18.0;

  const FG_DISTANCES = [25, 35, 45, 52, 60];

  const THROW_TARGET_SPECS = [
    { id: 't_slant_l', baseX: -9.5, baseZ: -12.0, y: 2.4, r: 2.25, ampX: 3.5, freq: 1.35, phase: 0.2, pts: 100, label: 'SLANT 22YD', color: 0x38bdf8 },
    { id: 't_slant_r', baseX: 9.5, baseZ: -15.0, y: 2.5, r: 2.25, ampX: 3.8, freq: 1.25, phase: 2.1, pts: 100, label: 'OUT ROUTE 25YD', color: 0x38bdf8 },
    { id: 't_mid_cross', baseX: 0.0, baseZ: -26.0, y: 2.9, r: 2.05, ampX: 9.0, freq: 1.15, phase: 1.0, pts: 200, label: 'DIG CROSS 36YD', color: 0xfacc15 },
    { id: 't_post_r', baseX: 12.0, baseZ: -35.0, y: 3.1, r: 2.05, ampX: 5.2, freq: 1.45, phase: 3.4, pts: 250, label: 'SKINNY POST 45YD', color: 0xfacc15 },
    { id: 't_corner_l', baseX: -14.0, baseZ: -45.0, y: 3.4, r: 2.15, ampX: 4.5, freq: 1.55, phase: 0.7, pts: 350, label: 'CORNER TD 55YD', color: 0xf97316 },
    { id: 't_endzone_star', baseX: 0.0, baseZ: -54.0, y: 3.6, r: 2.45, ampX: 11.5, freq: 1.1, phase: 1.8, pts: 500, label: 'ENDZONE STAR 64YD', color: 0xfde047 }
  ];

  function clamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  }

  class CowboysStudioEngine {
    constructor() {
      this.container = document.getElementById('viewport-container');
      this.canvas = document.getElementById('stadium-canvas');
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.rootGroup = null;

      // Camera orbit state for Free Roam
      this.cameraTarget = new THREE.Vector3(0, 3, 0);
      this.orbitYaw = 0;
      this.orbitPitch = 0.25;
      this.orbitDistance = 45;
      this.isDragging = false;
      this.prevPointer = { x: 0, y: 0 };

      // Procedural textures cache
      this._texCache = {};
      this._jumboCanvas = null;
      this._jumboCtx = null;
      this._jumboTex = null;
      this._jumboHash = '';

      // 3D Objects & FX
      this._targets = [];
      this._arcLine = null;
      this._ballGroup = null;
      this._teeMesh = null;
      this._qbPadMesh = null;
      this._fgPadMesh = null;
      this._fxPool = [];
      this._dummyObj = new THREE.Object3D();

      // Audio & Speech
      this._audioCtx = null;
      this.voiceCheerEnabled = true;
      this.oneSwitchEnabled = false;

      // 1-Switch Sweep State
      this._switchSweepDir = 1;
      this._switchSweepSpeed = 22; // deg per sec

      // Game State
      this.state = {
        mode: 'throw', // 'roam' | 'throw' | 'fieldgoal'
        score: 0,
        streak: 0,
        bestScore: parseInt(localStorage.getItem('amina_cowboys_best') || '0', 10),
        throwsHit: 0,
        throwsAttempted: 0,
        fgMade: 0,
        fgAttempts: 0,
        fgDistanceYd: 45,
        windMph: 2.4,
        aimYawDeg: 0,
        aimPitchDeg: 28,
        meterPhase: 'idle', // 'idle' | 'charging' | 'power' | 'accuracy'
        meterTime: 0,
        powerVal: 0.8,
        accuracyVal: 0,
        powerSpeed: 1.6,
        accuracySpeed: 2.8,
        ballInFlight: false,
        ballKind: 'throw',
        ballPos: { x: 0, y: BASE_Y + 1.2, z: 10 },
        ballVel: { x: 0, y: 0, z: 0 },
        ballSpinPhase: 0,
        ballFlightTime: 0,
        fgEvaluated: false,
        lastOutcome: 'TOUCHDOWN STAR PASS',
        lastDetail: 'Aim at moving route targets and launch spiral pass!'
      };

      this.init();
    }

    init() {
      // 1) Scene, Camera, Renderer
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x020712);
      this.scene.fog = new THREE.FogExp2(0x020712, 0.0035);

      this.camera = new THREE.PerspectiveCamera(54, this.width / this.height, 0.5, 900);
      this.camera.position.set(0, 18, 45);
      this.camera.lookAt(this.cameraTarget);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      // 2) Stadium Lighting
      const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(ambLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.95);
      dirLight1.position.set(40, 80, 50);
      this.scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.5);
      dirLight2.position.set(-40, 60, -50);
      this.scene.add(dirLight2);

      // 3) Build 3D Dallas Cowboys Stadium
      this.rootGroup = new THREE.Group();
      this.rootGroup.name = 'DallasCowboysStadium';
      this.scene.add(this.rootGroup);

      this._buildFieldAndApron();
      this._buildGoalposts();
      this._buildStadiumBowlAndRoof();
      this._buildJumbotron();
      this._buildTargetsAndArc();
      this._buildFootballAndFx();

      // 4) Bind Input Listeners & Resize
      this._bindInputs();
      window.addEventListener('resize', () => this.onResize());

      // 5) Start Render Loop
      this.setMode('throw');
      this.lastTime = performance.now();
      this.animate();

      // 6) Speak welcome cheer
      this.speak("Welcome to Dallas Cowboys Mega Stadium Studio! Aim at the moving routes and throw a touchdown pass!");
    }

    onResize() {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }

    /* -------------------------------------------------------------------------
       PROCEDURAL TEXTURES (Field Turf, Ribbon Boards, Seating Tiers, Jumbotron)
       ------------------------------------------------------------------------- */

    _drawFivePointStar(ctx, cx, cy, outerR, innerR, rotOffset = -Math.PI / 2) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const ang = rotOffset + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = cx + Math.cos(ang) * r;
        const py = cy + Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    _makeTurfTex() {
      if (this._texCache.turf) return this._texCache.turf;
      const w = 1024;
      const h = 2048;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');

      const pxPerYd = h / 120;
      const ezPx = 10 * pxPerYd;

      // 1) Alternating NFL turf stripes across 100 yards
      for (let yd = 0; yd < 100; yd += 5) {
        const y0 = ezPx + yd * pxPerYd;
        ctx.fillStyle = (Math.floor(yd / 5) % 2 === 0) ? '#093d1a' : '#0d4c21';
        ctx.fillRect(0, y0, w, 5 * pxPerYd + 1);
      }

      // Micro grass blade grain
      for (let i = 0; i < 2200; i++) {
        const gx = (i * 197) % w;
        const gy = ezPx + ((i * 521) % Math.floor(100 * pxPerYd));
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.04)';
        ctx.fillRect(gx, gy, 3, 5);
      }

      // 2) North & South Cowboys Navy End Zones
      const drawEndZone = (yTop, flipText) => {
        ctx.fillStyle = '#041E42';
        ctx.fillRect(0, yTop, w, ezPx);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 10;
        ctx.strokeRect(12, yTop + 10, w - 24, ezPx - 20);

        ctx.save();
        ctx.translate(w * 0.5, yTop + ezPx * 0.5);
        if (flipText) ctx.rotate(Math.PI);
        ctx.font = '900 110px "Arial Black", Impact, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeText('COWBOYS', 0, 2);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('COWBOYS', 0, 2);
        ctx.restore();

        // Corner Stars in End Zones
        for (const sx of [96, w - 96]) {
          this._drawFivePointStar(ctx, sx, yTop + ezPx * 0.5, 42, 18);
          ctx.fillStyle = '#f8fafc';
          ctx.fill();
          this._drawFivePointStar(ctx, sx, yTop + ezPx * 0.5, 32, 14);
          ctx.fillStyle = '#041E42';
          ctx.fill();
        }
      };
      drawEndZone(0, false);
      drawEndZone(h - ezPx, true);

      // 3) White outer boundary sidelines & endlines
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 22;
      ctx.strokeRect(11, 11, w - 22, h - 22);

      // 4) Yard lines and hash marks every 1 yd / 5 yds
      ctx.fillStyle = '#f8fafc';
      const hashLeftX = Math.round(w * 0.39);
      const hashRightX = Math.round(w * 0.61);
      for (let yd = 0; yd <= 100; yd++) {
        const y = ezPx + yd * pxPerYd;
        if (yd % 5 === 0) {
          ctx.fillRect(16, y - 3, w - 32, yd === 50 ? 9 : 6);
        } else {
          ctx.fillRect(24, y - 2, 18, 4);
          ctx.fillRect(w - 42, y - 2, 18, 4);
          ctx.fillRect(hashLeftX - 10, y - 2, 20, 4);
          ctx.fillRect(hashRightX - 10, y - 2, 20, 4);
        }
      }

      // 5) Yard Numbers (10..50..10)
      ctx.fillStyle = '#f8fafc';
      ctx.font = '900 46px Impact, "Arial Narrow", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let yd = 10; yd <= 90; yd += 10) {
        const label = String(yd <= 50 ? yd : 100 - yd);
        const y = ezPx + yd * pxPerYd;
        ctx.save();
        ctx.translate(112, y);
        ctx.rotate(Math.PI * 0.5);
        ctx.scale(0.85, 1.0);
        ctx.fillText(label, 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate(w - 112, y);
        ctx.rotate(-Math.PI * 0.5);
        ctx.scale(0.85, 1.0);
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }

      // 6) Midfield 5-Point Dallas Cowboys Star
      ctx.save();
      const cyMid = h * 0.5;
      const cxMid = w * 0.5;
      this._drawFivePointStar(ctx, cxMid, cyMid, 168, 66);
      ctx.fillStyle = '#041E42';
      ctx.fill();
      this._drawFivePointStar(ctx, cxMid, cyMid, 146, 57);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      this._drawFivePointStar(ctx, cxMid, cyMid, 128, 49);
      ctx.fillStyle = '#041E42';
      ctx.fill();
      this._drawFivePointStar(ctx, cxMid, cyMid, 72, 28);
      ctx.strokeStyle = 'rgba(203,213,225,0.45)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      this._texCache.turf = tex;
      return tex;
    }

    _makeRibbonTex(repeats = 5) {
      const key = `ribbon_${repeats}`;
      if (this._texCache[key]) return this._texCache[key];
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#041E42';
      ctx.fillRect(0, 0, 1024, 128);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 4, 1024, 6);
      ctx.fillRect(0, 118, 1024, 6);
      this._drawFivePointStar(ctx, 64, 64, 24, 10);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      this._drawFivePointStar(ctx, 960, 64, 24, 10);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '900 34px "Arial Black", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DALLAS COWBOYS  ·  STAR STADIUM', 512, 66, 740);

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(repeats, 1);
      this._texCache[key] = tex;
      return tex;
    }

    _makeBowlTierTex() {
      if (this._texCache.bowlTier) return this._texCache.bowlTier;
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0f1826';
      ctx.fillRect(0, 0, 512, 256);

      const rowH = 32;
      const colors = ['#041E42', '#1d4ed8', '#cbd5e1', '#f1f5f9', '#0f2d5e', '#38bdf8'];
      for (let r = 0; r < 8; r++) {
        const y0 = r * rowH;
        ctx.fillStyle = r % 2 === 0 ? '#182436' : '#121c2b';
        ctx.fillRect(0, y0, 512, rowH);
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, y0, 512, 5);
        for (let sx = 4; sx < 508; sx += 11) {
          ctx.fillStyle = colors[(r * 17 + Math.floor(sx / 11) * 5) % colors.length];
          ctx.fillRect(sx, y0 + 7, 9, 21);
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 2);
      this._texCache.bowlTier = tex;
      return tex;
    }

    _makeFootballTex() {
      if (this._texCache.football) return this._texCache.football;
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#7c3611';
      ctx.fillRect(0, 0, 256, 128);
      for (let i = 0; i < 360; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.14)' : 'rgba(255,200,150,0.08)';
        ctx.fillRect((i * 47) % 256, (i * 89) % 128, 3, 2);
      }
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 20, 256, 7);
      ctx.fillRect(0, 101, 256, 7);
      ctx.fillRect(122, 36, 12, 56);
      for (let y = 40; y <= 88; y += 8) {
        ctx.fillRect(110, y, 36, 3);
      }
      const tex = new THREE.CanvasTexture(c);
      this._texCache.football = tex;
      return tex;
    }

    _initJumbotronTex() {
      if (this._jumboTex) return this._jumboTex;
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 512;
      this._jumboCanvas = c;
      this._jumboCtx = c.getContext('2d');
      this._jumboTex = new THREE.CanvasTexture(c);
      this._syncJumbotron(true);
      return this._jumboTex;
    }

    _syncJumbotron(force = false) {
      if (!this._jumboCtx || !this._jumboTex) return;
      const st = this.state;
      const hash = `${st.mode}|${st.score}|${st.streak}|${st.fgDistanceYd}|${st.windMph.toFixed(1)}|${st.lastOutcome}`;
      if (!force && this._jumboHash === hash) return;
      this._jumboHash = hash;

      const ctx = this._jumboCtx;
      const W = 1024;
      const H = 512;

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#041E42');
      grad.addColorStop(0.5, '#0b2b5c');
      grad.addColorStop(1, '#020917');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 10;
      ctx.strokeRect(10, 10, W - 20, H - 20);

      // Header Bar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.fillRect(20, 20, W - 40, 82);
      this._drawFivePointStar(ctx, 76, 61, 28, 11);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      this._drawFivePointStar(ctx, W - 76, 61, 28, 11);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '900 40px "Arial Black", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DALLAS COWBOYS  ·  STAR STADIUM', W * 0.5, 62);

      // Outcome / Mode Callout
      const isGood = st.lastOutcome.includes('GOOD') || st.lastOutcome.includes('TOUCHDOWN') || st.lastOutcome.includes('HIT');
      const isBad = st.lastOutcome.includes('NO GOOD') || st.lastOutcome.includes('DOINK') || st.lastOutcome.includes('SHORT') || st.lastOutcome.includes('MISS');
      ctx.fillStyle = isGood ? '#fde047' : (isBad ? '#fb7185' : '#38bdf8');
      ctx.font = '900 68px Impact, "Arial Black", sans-serif';
      ctx.fillText(st.lastOutcome, W * 0.5, 220, W - 96);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '700 28px Arial, sans-serif';
      ctx.fillText(st.lastDetail, W * 0.5, 290, W - 96);

      // Bottom Scoreboard Cards
      const cards = [
        { lbl: 'MODE', val: st.mode === 'throw' ? 'QB THROW' : (st.mode === 'fieldgoal' ? `FG ${st.fgDistanceYd}YD` : 'FREE ROAM') },
        { lbl: 'SCORE', val: String(st.score) },
        { lbl: 'STREAK', val: `x${Math.max(1, st.streak)}` },
        { lbl: 'WIND', val: `${st.windMph >= 0 ? 'R' : 'L'} ${Math.abs(st.windMph).toFixed(1)} MPH` }
      ];
      cards.forEach((cd, idx) => {
        const bx = 38 + idx * 242;
        ctx.fillStyle = 'rgba(4, 30, 66, 0.88)';
        ctx.fillRect(bx, 354, 222, 118);
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 4;
        ctx.strokeRect(bx, 354, 222, 118);
        ctx.fillStyle = '#93c5fd';
        ctx.font = '700 22px Arial, sans-serif';
        ctx.fillText(cd.lbl, bx + 111, 384);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '900 40px Impact, sans-serif';
        ctx.fillText(cd.val, bx + 111, 434);
      });

      this._jumboTex.needsUpdate = true;
    }

    /* -------------------------------------------------------------------------
       BUILD 3D GEOMETRIES (Field, Goalposts, Bowl, Jumbotron, Football, Targets)
       ------------------------------------------------------------------------- */

    _buildFieldAndApron() {
      const apron = new THREE.Mesh(
        new THREE.BoxGeometry(88, 0.4, 152),
        new THREE.MeshLambertMaterial({ color: 0x041E42 })
      );
      apron.position.set(0, BASE_Y - 0.2, 0);
      this.rootGroup.add(apron);

      const field = new THREE.Mesh(
        new THREE.PlaneGeometry(FIELD_W, FIELD_LEN),
        new THREE.MeshLambertMaterial({ map: this._makeTurfTex() })
      );
      field.rotation.x = -Math.PI * 0.5;
      field.position.set(0, BASE_Y + 0.01, 0);
      this.rootGroup.add(field);

      // Glowing QB Pocket Pad & FG Tee Pad
      this._qbPadMesh = new THREE.Mesh(
        new THREE.RingGeometry(1.4, 1.9, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
      );
      this._qbPadMesh.rotation.x = -Math.PI * 0.5;
      this._qbPadMesh.position.set(0, BASE_Y + 0.04, 10);
      this.rootGroup.add(this._qbPadMesh);

      this._fgPadMesh = new THREE.Mesh(
        new THREE.RingGeometry(1.2, 1.7, 24),
        new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
      );
      this._fgPadMesh.rotation.x = -Math.PI * 0.5;
      this._fgPadMesh.position.set(0, BASE_Y + 0.04, -15);
      this.rootGroup.add(this._fgPadMesh);

      // Padded team benches
      const benchMat = new THREE.MeshStandardMaterial({ color: 0x0b2545, roughness: 0.45, metalness: 0.25 });
      [-31.2, 31.2].forEach(bx => {
        [-18, 18].forEach(bz => {
          const bench = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.6, 12.0), benchMat);
          bench.position.set(bx, BASE_Y + 0.35, bz);
          this.rootGroup.add(bench);
        });
      });

      // Cowboys Tunnel Arch on South End Zone
      const tunnel = new THREE.Mesh(
        new THREE.BoxGeometry(12, 6.2, 7.5),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x041E42, emissiveIntensity: 0.45 })
      );
      tunnel.position.set(0, BASE_Y + 3.0, 68);
      this.rootGroup.add(tunnel);
    }

    _buildGoalposts() {
      const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.4 });
      const padMat = new THREE.MeshLambertMaterial({ color: 0x041E42 });

      [NORTH_GOAL_Z, SOUTH_GOAL_Z].forEach(goalZ => {
        const postGroup = new THREE.Group();
        const dir = goalZ < 0 ? -1 : 1;

        // Base Stanchion
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, CROSSBAR_Y, 16), yellowMat);
        post.position.set(0, BASE_Y + CROSSBAR_Y * 0.5, goalZ + dir * 2.0);
        postGroup.add(post);

        // Goose Neck curve
        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 2.0), yellowMat);
        neck.position.set(0, BASE_Y + CROSSBAR_Y - 0.16, goalZ + dir * 1.0);
        postGroup.add(neck);

        // Protective Base Pad
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.8, 16), padMat);
        pad.position.set(0, BASE_Y + 0.9, goalZ + dir * 2.0);
        postGroup.add(pad);

        // Crossbar
        const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, UPRIGHT_HALF_W * 2, 16), yellowMat);
        cross.rotation.z = Math.PI * 0.5;
        cross.position.set(0, BASE_Y + CROSSBAR_Y, goalZ);
        postGroup.add(cross);

        // Uprights (Left & Right)
        const uprightH = UPRIGHT_TOP_Y - CROSSBAR_Y;
        [-UPRIGHT_HALF_W, UPRIGHT_HALF_W].forEach(ux => {
          const up = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, uprightH, 16), yellowMat);
          up.position.set(ux, BASE_Y + CROSSBAR_Y + uprightH * 0.5, goalZ);
          postGroup.add(up);

          // Streamer Flag
          const flag = new THREE.Mesh(
            new THREE.PlaneGeometry(0.18, 1.1),
            new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
          );
          flag.position.set(ux + 0.1, BASE_Y + UPRIGHT_TOP_Y + 0.55, goalZ);
          postGroup.add(flag);
        });

        this.rootGroup.add(postGroup);
      });
    }

    _buildStadiumBowlAndRoof() {
      // 3D Seating Grandstands
      const bowlMat = new THREE.MeshLambertMaterial({ map: this._makeBowlTierTex() });
      const lowerBowl = new THREE.Mesh(new THREE.CylinderGeometry(82, 60, 24, 48, 1, true), bowlMat);
      lowerBowl.position.set(0, BASE_Y + 12, 0);
      this.rootGroup.add(lowerBowl);

      const upperBowl = new THREE.Mesh(new THREE.CylinderGeometry(112, 90, 28, 48, 1, true), bowlMat);
      upperBowl.position.set(0, BASE_Y + 34, 0);
      this.rootGroup.add(upperBowl);

      // LED Ribbon Display Rings
      const ribbonMat = new THREE.MeshBasicMaterial({ map: this._makeRibbonTex(8), side: THREE.DoubleSide });
      const ribbon1 = new THREE.Mesh(new THREE.CylinderGeometry(83, 83, 3.2, 48, 1, true), ribbonMat);
      ribbon1.position.set(0, BASE_Y + 23.5, 0);
      this.rootGroup.add(ribbon1);

      // Translucent Domed Steel Ceiling
      const roofMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.6,
        metalness: 0.4,
        transparent: true,
        opacity: 0.5,
        side: THREE.BackSide
      });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(140, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), roofMat);
      dome.position.set(0, BASE_Y, 0);
      this.rootGroup.add(dome);

      // Structural Steel Arches
      const trussMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
      [-36, 36].forEach(ax => {
        const arch = new THREE.Mesh(new THREE.TorusGeometry(125, 1.2, 8, 36, Math.PI), trussMat);
        arch.position.set(ax, BASE_Y, 0);
        arch.rotation.y = Math.PI * 0.5;
        this.rootGroup.add(arch);
      });
    }

    _buildJumbotron() {
      const jumbotronGroup = new THREE.Group();
      jumbotronGroup.position.set(0, BASE_Y + 38, 0);

      const screenMat = new THREE.MeshBasicMaterial({ map: this._initJumbotronTex() });
      const housingMat = new THREE.MeshStandardMaterial({ color: 0x041E42, metalness: 0.6, roughness: 0.3 });

      // Massive center housing (48 yds long x 22 yds high)
      const housing = new THREE.Mesh(new THREE.BoxGeometry(44, 18, 9), housingMat);
      jumbotronGroup.add(housing);

      // East & West Main Video Screens
      const eastScreen = new THREE.Mesh(new THREE.PlaneGeometry(43.2, 17.2), screenMat);
      eastScreen.position.set(0, 0, 4.55);
      const westScreen = new THREE.Mesh(new THREE.PlaneGeometry(43.2, 17.2), screenMat);
      westScreen.position.set(0, 0, -4.55);
      westScreen.rotation.y = Math.PI;

      jumbotronGroup.add(eastScreen, westScreen);

      // Steel suspension cables
      const cableMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
      [-18, 18].forEach(cx => {
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 45, 8), cableMat);
        cable.position.set(cx, 22.5, 0);
        jumbotronGroup.add(cable);
      });

      this.rootGroup.add(jumbotronGroup);
    }

    _buildTargetsAndArc() {
      // 6 Moving Route Target Rings
      const ringGeom = new THREE.TorusGeometry(1.6, 0.22, 16, 32);
      this._targets = THROW_TARGET_SPECS.map(spec => {
        const mat = new THREE.MeshBasicMaterial({ color: spec.color });
        const mesh = new THREE.Mesh(ringGeom, mat);
        mesh.rotation.x = Math.PI * 0.5;

        const group = new THREE.Group();
        group.position.set(spec.baseX, BASE_Y + spec.y, spec.baseZ);
        group.add(mesh);

        // Core star marker
        const star = new THREE.Mesh(
          new THREE.CircleGeometry(0.7, 5),
          new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
        );
        star.rotation.x = -Math.PI * 0.5;
        group.add(star);

        this.rootGroup.add(group);
        return { spec, group, mesh };
      });

      // Aim Trajectory Arc
      const arcPoints = [];
      for (let i = 0; i <= 36; i++) arcPoints.push(new THREE.Vector3());
      const arcGeom = new THREE.BufferGeometry().setFromPoints(arcPoints);
      this._arcLine = new THREE.Line(
        arcGeom,
        new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3, transparent: true, opacity: 0.85 })
      );
      this.rootGroup.add(this._arcLine);
    }

    _buildFootballAndFx() {
      // 3D Pro Football
      this._ballGroup = new THREE.Group();
      const ballGeom = new THREE.SphereGeometry(0.48, 16, 16);
      ballGeom.scale(1.0, 1.48, 1.0);
      const ballMat = new THREE.MeshLambertMaterial({ map: this._makeFootballTex() });
      const ballMesh = new THREE.Mesh(ballGeom, ballMat);
      ballMesh.rotation.x = Math.PI * 0.5;
      this._ballGroup.add(ballMesh);
      this._ballGroup.visible = false;
      this.rootGroup.add(this._ballGroup);

      // Kicking Tee
      this._teeMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, 0.22, 16),
        new THREE.MeshLambertMaterial({ color: 0x000000 })
      );
      this._teeMesh.position.set(0, BASE_Y + 0.11, -15);
      this._teeMesh.visible = false;
      this.rootGroup.add(this._teeMesh);

      // Particle Pool for bursts & sparks
      const fxGeom = new THREE.SphereGeometry(0.25, 8, 8);
      const fxMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      this._fxInst = new THREE.InstancedMesh(fxGeom, fxMat, 48);
      this._fxPool = [];
      for (let i = 0; i < 48; i++) {
        this._fxPool.push({ x: 0, y: -999, z: 0, vx: 0, vy: 0, vz: 0, life: 0 });
      }
      this.rootGroup.add(this._fxInst);
    }

    /* -------------------------------------------------------------------------
       INPUT HANDLING, TOUCH CONTROLS & 1-SWITCH SCANNING
       ------------------------------------------------------------------------- */

    _bindInputs() {
      // Mode Pills
      document.getElementById('pill-mode-roam')?.addEventListener('click', () => this.setMode('roam'));
      document.getElementById('pill-mode-throw')?.addEventListener('click', () => this.setMode('throw'));
      document.getElementById('pill-mode-fg')?.addEventListener('click', () => this.setMode('fieldgoal'));

      // Main Action Button
      document.getElementById('btn-main-action')?.addEventListener('click', () => this.handleActionClick());

      // Aim Left / Right
      document.getElementById('btn-aim-left')?.addEventListener('click', () => this.adjustAim(-3.5));
      document.getElementById('btn-aim-right')?.addEventListener('click', () => this.adjustAim(3.5));

      // FG Distance Toggle
      document.getElementById('btn-distance-cycle')?.addEventListener('click', () => this.cycleFgDistance());

      // 1-Switch Mode Toggle
      const switchBtn = document.getElementById('btn-toggle-switch-mode');
      const shield = document.getElementById('switch-shield');
      const banner = document.getElementById('switch-banner');
      switchBtn?.addEventListener('click', () => {
        this.oneSwitchEnabled = !this.oneSwitchEnabled;
        switchBtn.classList.toggle('active', this.oneSwitchEnabled);
        shield?.classList.toggle('active', this.oneSwitchEnabled);
        banner?.classList.toggle('active', this.oneSwitchEnabled);
        this.speak(this.oneSwitchEnabled ? "Single switch mode enabled. Tap anywhere to throw or kick." : "Single switch mode disabled.");
      });

      shield?.addEventListener('click', () => {
        if (this.oneSwitchEnabled) this.handleActionClick();
      });

      // Voice Cheer Toggle
      const voiceBtn = document.getElementById('btn-toggle-voice-cheer');
      voiceBtn?.addEventListener('click', () => {
        this.voiceCheerEnabled = !this.voiceCheerEnabled;
        voiceBtn.classList.toggle('active', this.voiceCheerEnabled);
        this.speak(this.voiceCheerEnabled ? "Voice cheering active!" : "Voice cheering muted.");
      });

      // AAC Send to Board Modal
      const sendAacBtn = document.getElementById('btn-send-aac-board');
      const modal = document.getElementById('phrase-picker-modal');
      const closeModalBtn = document.getElementById('btn-close-picker');
      sendAacBtn?.addEventListener('click', () => modal?.classList.add('open'));
      closeModalBtn?.addEventListener('click', () => modal?.classList.remove('open'));

      // Phrase buttons inside modal
      document.querySelectorAll('.phrase-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const phrase = btn.getAttribute('data-phrase') || btn.innerText.trim();
          this.sendToAacSentenceStrip(phrase);
        });
      });

      // Orbit controls pointer drag for Free Roam
      this.canvas.addEventListener('pointerdown', (e) => {
        if (this.state.mode === 'roam') {
          this.isDragging = true;
          this.prevPointer = { x: e.clientX, y: e.clientY };
        }
      });
      window.addEventListener('pointermove', (e) => {
        if (this.isDragging && this.state.mode === 'roam') {
          const dx = e.clientX - this.prevPointer.x;
          const dy = e.clientY - this.prevPointer.y;
          this.prevPointer = { x: e.clientX, y: e.clientY };
          this.orbitYaw -= dx * 0.007;
          this.orbitPitch = clamp(this.orbitPitch + dy * 0.005, 0.05, 1.4);
        }
      });
      window.addEventListener('pointerup', () => { this.isDragging = false; });

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
          e.preventDefault();
          this.handleActionClick();
        } else if (e.code === 'ArrowLeft') {
          this.adjustAim(-3);
        } else if (e.code === 'ArrowRight') {
          this.adjustAim(3);
        } else if (e.key === '1') {
          this.setMode('roam');
        } else if (e.key === '2') {
          this.setMode('throw');
        } else if (e.key === '3') {
          this.setMode('fieldgoal');
        }
      });
    }

    setMode(newMode) {
      this.state.mode = newMode;
      document.querySelectorAll('.mode-pill-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(`pill-mode-${newMode === 'fieldgoal' ? 'fg' : newMode}`)?.classList.add('active');

      const actionBtn = document.getElementById('btn-main-action');
      const aimControls = document.getElementById('aim-controls');
      const meterBox = document.getElementById('kicking-meter-box');
      const distBtn = document.getElementById('btn-distance-cycle');

      this.state.ballInFlight = false;
      this._ballGroup.visible = false;

      if (newMode === 'throw') {
        this.cameraTarget.set(0, 3, -20);
        this.camera.position.set(0, 4, 18);
        this.camera.lookAt(this.cameraTarget);
        if (actionBtn) actionBtn.innerHTML = `<span>🏈 THROW PASS</span>`;
        if (aimControls) aimControls.style.display = 'flex';
        if (meterBox) meterBox.style.display = 'none';
        if (distBtn) distBtn.style.display = 'none';
        this._targets.forEach(t => { t.group.visible = true; });
        this._arcLine.visible = true;
        this._teeMesh.visible = false;
        this.state.lastOutcome = 'TOUCHDOWN STAR PASS';
        this.state.lastDetail = 'Aim spiral pass at moving route rings';
      } else if (newMode === 'fieldgoal') {
        this.updateFgTeePosition();
        if (actionBtn) actionBtn.innerHTML = `<span>👟 KICK FIELD GOAL</span>`;
        if (aimControls) aimControls.style.display = 'flex';
        if (meterBox) meterBox.style.display = 'flex';
        if (distBtn) distBtn.style.display = 'inline-flex';
        this._targets.forEach(t => { t.group.visible = false; });
        this._arcLine.visible = false;
        this._teeMesh.visible = true;
        this.state.meterPhase = 'idle';
        this.state.lastOutcome = `FIELD GOAL ${this.state.fgDistanceYd} YARDS`;
        this.state.lastDetail = 'Tap kick: set power then nail accuracy sweet spot!';
      } else {
        // Free Roam
        this.orbitDistance = 55;
        this.cameraTarget.set(0, 3, 0);
        if (actionBtn) actionBtn.innerHTML = `<span>⭐ 50-YD STAR</span>`;
        if (aimControls) aimControls.style.display = 'none';
        if (meterBox) meterBox.style.display = 'none';
        if (distBtn) distBtn.style.display = 'none';
        this._targets.forEach(t => { t.group.visible = true; });
        this._arcLine.visible = false;
        this._teeMesh.visible = false;
        this.state.lastOutcome = 'FREE ROAM STADIUM TOUR';
        this.state.lastDetail = 'Explore 120-yd emerald turf, endzones and suites';
      }

      this._syncJumbotron(true);
      this._updateHud();
    }

    adjustAim(degDelta) {
      this.state.aimYawDeg = clamp(this.state.aimYawDeg + degDelta, -28, 28);
      this._updateHud();
    }

    cycleFgDistance() {
      const idx = (FG_DISTANCES.indexOf(this.state.fgDistanceYd) + 1) % FG_DISTANCES.length;
      this.state.fgDistanceYd = FG_DISTANCES[idx];
      this.updateFgTeePosition();
      this.state.lastOutcome = `FIELD GOAL ${this.state.fgDistanceYd} YDS`;
      this._syncJumbotron(true);
      this._updateHud();
      this.speak(`${this.state.fgDistanceYd} yard field goal attempt.`);
    }

    updateFgTeePosition() {
      // 10 yds endzone + distance
      const teeZ = NORTH_GOAL_Z + this.state.fgDistanceYd;
      this._teeMesh.position.set(0, BASE_Y + 0.11, teeZ);
      this._fgPadMesh.position.set(0, BASE_Y + 0.04, teeZ);
      this.cameraTarget.set(0, 6, NORTH_GOAL_Z);
      this.camera.position.set(0, 4, teeZ + 12);
      this.camera.lookAt(this.cameraTarget);
    }

    handleActionClick() {
      if (this.state.mode === 'roam') {
        // Teleport to 50-yd Star
        this.cameraTarget.set(0, 1, 0);
        this.camera.position.set(0, 3.5, 12);
        this.camera.lookAt(this.cameraTarget);
        this.showOutcome('MIDFIELD 50-YD STAR', 'Standing on the legendary Cowboys Star');
        this.speak("Standing on the Dallas Cowboys 50-yard star!");
        return;
      }

      if (this.state.ballInFlight) return;

      if (this.state.mode === 'throw') {
        this.launchSpiralPass();
      } else if (this.state.mode === 'fieldgoal') {
        this.stepKickingMeter();
      }
    }

    launchSpiralPass() {
      const st = this.state;
      st.ballInFlight = true;
      st.ballKind = 'throw';
      st.throwsAttempted++;
      st.ballFlightTime = 0;

      st.ballPos = { x: 0, y: BASE_Y + 1.8, z: 10 };
      this._ballGroup.position.set(st.ballPos.x, st.ballPos.y, st.ballPos.z);
      this._ballGroup.visible = true;

      // Trajectory velocity calculation
      const yawRad = (st.aimYawDeg * Math.PI) / 180;
      const speed = 36.0;
      st.ballVel = {
        x: -Math.sin(yawRad) * speed,
        y: 11.5,
        z: -Math.cos(yawRad) * speed
      };

      this._playSfx('throw');
    }

    stepKickingMeter() {
      const st = this.state;
      if (st.meterPhase === 'idle') {
        st.meterPhase = 'charging';
        st.meterTime = 0;
      } else if (st.meterPhase === 'charging') {
        st.meterPhase = 'accuracy';
      } else if (st.meterPhase === 'accuracy') {
        st.meterPhase = 'idle';
        this.kickFieldGoal();
      }
    }

    kickFieldGoal() {
      const st = this.state;
      st.ballInFlight = true;
      st.ballKind = 'fieldgoal';
      st.fgAttempts++;
      st.fgEvaluated = false;
      st.ballFlightTime = 0;

      const teeZ = NORTH_GOAL_Z + st.fgDistanceYd;
      st.ballPos = { x: 0, y: BASE_Y + 0.35, z: teeZ };
      this._ballGroup.position.set(st.ballPos.x, st.ballPos.y, st.ballPos.z);
      this._ballGroup.visible = true;

      const yawRad = ((st.aimYawDeg + st.accuracyVal * 8.0) * Math.PI) / 180;
      const kickPower = Math.max(0.4, st.powerVal);
      const speed = 22.0 + (st.fgDistanceYd / 60.0) * 22.0 * kickPower;

      st.ballVel = {
        x: -Math.sin(yawRad) * speed + (st.windMph * 0.15),
        y: 18.0 * kickPower,
        z: -Math.cos(yawRad) * speed
      };

      this._playSfx('kick');
    }

    /* -------------------------------------------------------------------------
       PHYSICS, TARGET HITS & GOALPOST COLLISIONS
       ------------------------------------------------------------------------- */

    updatePhysics(dt) {
      const st = this.state;

      // 1) Update Moving Route Targets
      const nowSec = performance.now() * 0.001;
      this._targets.forEach(t => {
        const spec = t.spec;
        const curX = spec.baseX + Math.sin(nowSec * spec.freq + spec.phase) * spec.ampX;
        t.group.position.x = curX;
      });

      // 2) 1-Switch Auto-Sweep
      if (this.oneSwitchEnabled && !st.ballInFlight) {
        if (st.mode === 'throw') {
          st.aimYawDeg += this._switchSweepDir * this._switchSweepSpeed * dt;
          if (st.aimYawDeg > 24) { st.aimYawDeg = 24; this._switchSweepDir = -1; }
          else if (st.aimYawDeg < -24) { st.aimYawDeg = -24; this._switchSweepDir = 1; }
          this._updateHud();
        } else if (st.mode === 'fieldgoal') {
          if (st.meterPhase === 'idle') {
            this.stepKickingMeter();
          }
        }
      }

      // 3) Update Kicking Meter Animation
      if (st.mode === 'fieldgoal') {
        st.meterTime += dt;
        if (st.meterPhase === 'charging') {
          st.powerVal = 0.5 + 0.5 * Math.sin(st.meterTime * st.powerSpeed * Math.PI);
        } else if (st.meterPhase === 'accuracy') {
          st.accuracyVal = Math.sin(st.meterTime * st.accuracySpeed * Math.PI);
        }
        this._updateMeterUI();
      }

      // 4) Update Aim Trajectory Arc
      if (st.mode === 'throw' && this._arcLine) {
        const points = [];
        const yawRad = (st.aimYawDeg * Math.PI) / 180;
        const p0 = new THREE.Vector3(0, BASE_Y + 1.8, 10);
        const v0 = new THREE.Vector3(-Math.sin(yawRad) * 36, 11.5, -Math.cos(yawRad) * 36);
        for (let i = 0; i <= 36; i++) {
          const t = i * 0.045;
          points.push(new THREE.Vector3(
            p0.x + v0.x * t,
            p0.y + v0.y * t - 0.5 * GRAVITY * t * t,
            p0.z + v0.z * t
          ));
        }
        this._arcLine.geometry.setFromPoints(points);
      }

      // 5) Ball Flight Simulation
      if (st.ballInFlight) {
        st.ballFlightTime += dt;
        st.ballPos.x += st.ballVel.x * dt;
        st.ballPos.y += st.ballVel.y * dt;
        st.ballPos.z += st.ballVel.z * dt;
        st.ballVel.y -= GRAVITY * dt;

        st.ballSpinPhase += dt * 26.0;
        this._ballGroup.position.set(st.ballPos.x, st.ballPos.y, st.ballPos.z);
        this._ballGroup.rotation.z = st.ballSpinPhase;

        // Camera follow ball in flight
        if (st.mode === 'throw') {
          this.camera.position.x = st.ballPos.x * 0.35;
          this.camera.position.y = Math.max(3.5, st.ballPos.y + 2.0);
          this.camera.lookAt(st.ballPos.x, st.ballPos.y, st.ballPos.z);
        } else if (st.mode === 'fieldgoal') {
          this.camera.lookAt(st.ballPos.x, st.ballPos.y, NORTH_GOAL_Z);
        }

        // Check Target Collisions in QB Throw
        if (st.ballKind === 'throw') {
          for (let i = 0; i < this._targets.length; i++) {
            const t = this._targets[i];
            const tp = t.group.position;
            const dist = Math.hypot(st.ballPos.x - tp.x, st.ballPos.y - tp.y, st.ballPos.z - tp.z);
            if (dist <= t.spec.r + 0.6) {
              st.ballInFlight = false;
              st.throwsHit++;
              st.streak++;
              const gain = t.spec.pts * Math.max(1, st.streak);
              st.score += gain;
              if (st.score > st.bestScore) {
                st.bestScore = st.score;
                localStorage.setItem('amina_cowboys_best', String(st.bestScore));
              }

              this._emitBurst(tp.x, tp.y, tp.z);
              this._playSfx('hit');
              this.showOutcome('TOUCHDOWN BULLSEYE!', `${t.spec.label} +${gain} PTS! (Streak x${st.streak})`);
              this.speak(`Touchdown! ${t.spec.label}, ${gain} points!`);
              this._syncJumbotron(true);
              this._updateHud();
              setTimeout(() => this.resetThrowPosition(), 1400);
              return;
            }
          }
        }

        // Check Goalpost Plane in Field Goal
        if (st.ballKind === 'fieldgoal' && !st.fgEvaluated) {
          if (st.ballPos.z <= NORTH_GOAL_Z) {
            st.fgEvaluated = true;
            const relY = st.ballPos.y - BASE_Y;
            const crossX = st.ballPos.x;

            const isBetweenUprights = Math.abs(crossX) < UPRIGHT_HALF_W;
            const isAboveCrossbar = relY >= CROSSBAR_Y;
            const hitsUpright = Math.abs(Math.abs(crossX) - UPRIGHT_HALF_W) < 0.35 && relY >= CROSSBAR_Y;
            const hitsCrossbar = Math.abs(crossX) <= UPRIGHT_HALF_W && Math.abs(relY - CROSSBAR_Y) < 0.35;

            if (hitsUpright || hitsCrossbar) {
              st.streak = 0;
              this._playSfx('doink');
              this.showOutcome('DOINK!', 'Bounced off the upright crossbar!');
              this.speak("Doink! Off the upright!");
            } else if (isBetweenUprights && isAboveCrossbar) {
              st.fgMade++;
              st.streak++;
              const gain = st.fgDistanceYd * 10 * Math.max(1, st.streak);
              st.score += gain;
              if (st.score > st.bestScore) {
                st.bestScore = st.score;
                localStorage.setItem('amina_cowboys_best', String(st.bestScore));
              }

              this._emitBurst(crossX, BASE_Y + relY, NORTH_GOAL_Z);
              this._playSfx('good');
              this.showOutcome("IT'S GOOD!", `${st.fgDistanceYd}-YD Kick Split the Uprights! (+${gain} PTS)`);
              this.speak(`It is good! Split the uprights from ${st.fgDistanceYd} yards!`);
            } else {
              st.streak = 0;
              this._playSfx('miss');
              const missLabel = crossX < 0 ? 'WIDE LEFT' : (crossX > 0 ? 'WIDE RIGHT' : 'SHORT');
              this.showOutcome(missLabel, `${st.fgDistanceYd}-YD Attempt missed the uprights`);
              this.speak(`No good, ${missLabel.toLowerCase()}!`);
            }

            this._syncJumbotron(true);
            this._updateHud();
            setTimeout(() => this.resetFgPosition(), 1800);
          }
        }

        // Ground Landing Check
        if (st.ballPos.y <= BASE_Y + 0.22) {
          st.ballInFlight = false;
          st.streak = 0;
          this._playSfx('miss');
          if (st.ballKind === 'throw') {
            this.showOutcome('INCOMPLETE PASS', 'Adjust aim & trajectory arc');
            this.speak("Incomplete pass. Try another throw!");
            setTimeout(() => this.resetThrowPosition(), 1100);
          } else {
            this.showOutcome('SHORT — NO GOOD', `Fell short of the uprights`);
            setTimeout(() => this.resetFgPosition(), 1100);
          }
          this._syncJumbotron(true);
          this._updateHud();
        }
      }

      // 6) Update Burst Particle Pool
      if (this._fxInst) {
        const d = this._dummyObj;
        for (let i = 0; i < this._fxPool.length; i++) {
          const p = this._fxPool[i];
          if (p.life > 0) {
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.z += p.vz * dt;
            p.vy -= 9.8 * dt;
            d.position.set(p.x, p.y, p.z);
            d.scale.setScalar(Math.max(0.1, p.life));
          } else {
            d.position.set(0, -999, 0);
          }
          d.updateMatrix();
          this._fxInst.setMatrixAt(i, d.matrix);
        }
        this._fxInst.instanceMatrix.needsUpdate = true;
      }
    }

    _emitBurst(x, y, z) {
      for (let i = 0; i < this._fxPool.length; i++) {
        const p = this._fxPool[i];
        p.x = x; p.y = y; p.z = z;
        const theta = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 8;
        p.vx = Math.cos(theta) * speed;
        p.vy = 3 + Math.random() * 7;
        p.vz = Math.sin(theta) * speed;
        p.life = 0.8 + Math.random() * 0.5;
      }
    }

    resetThrowPosition() {
      this.state.ballInFlight = false;
      this._ballGroup.visible = false;
      this.cameraTarget.set(0, 3, -20);
      this.camera.position.set(0, 4, 18);
      this.camera.lookAt(this.cameraTarget);
    }

    resetFgPosition() {
      this.state.ballInFlight = false;
      this._ballGroup.visible = false;
      this.updateFgTeePosition();
    }

    showOutcome(title, subtitle) {
      const callout = document.getElementById('outcome-callout');
      const titleEl = document.getElementById('outcome-title');
      const subEl = document.getElementById('outcome-subtitle');
      if (titleEl) titleEl.innerText = title;
      if (subEl) subEl.innerText = subtitle;
      if (callout) {
        callout.classList.add('show');
        clearTimeout(this._outcomeTimeout);
        this._outcomeTimeout = setTimeout(() => {
          callout.classList.remove('show');
        }, 2200);
      }
      this.state.lastOutcome = title;
      this.state.lastDetail = subtitle;
    }

    _updateHud() {
      const st = this.state;
      const scoreVal = document.getElementById('hud-score-val');
      const streakVal = document.getElementById('hud-streak-val');
      const bestVal = document.getElementById('hud-best-val');
      const aimVal = document.getElementById('hud-aim-deg');
      const distVal = document.getElementById('btn-distance-cycle');

      if (scoreVal) scoreVal.innerText = st.score;
      if (streakVal) streakVal.innerText = `x${Math.max(1, st.streak)}`;
      if (bestVal) bestVal.innerText = st.bestScore;
      if (aimVal) aimVal.innerText = `${st.aimYawDeg >= 0 ? '+' : ''}${st.aimYawDeg.toFixed(0)}°`;
      if (distVal) distVal.innerText = `📏 ${st.fgDistanceYd} YDS`;
    }

    _updateMeterUI() {
      const fill = document.getElementById('meter-fill');
      const marker = document.getElementById('meter-marker');
      if (fill) fill.style.width = `${this.state.powerVal * 100}%`;
      if (marker) marker.style.left = `${(this.state.accuracyVal * 0.5 + 0.5) * 100}%`;
    }

    /* -------------------------------------------------------------------------
       PROCEDURAL WEB AUDIO SYNTHESIZER
       ------------------------------------------------------------------------- */

    _playSfx(kind) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      try {
        if (!this._audioCtx) this._audioCtx = new Ctx();
        const ac = this._audioCtx;
        if (ac.state === 'suspended') ac.resume();
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        if (kind === 'throw') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(240, now);
          osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc.connect(gain); gain.connect(ac.destination);
          osc.start(now); osc.stop(now + 0.15);
        } else if (kind === 'kick') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(55, now + 0.16);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain); gain.connect(ac.destination);
          osc.start(now); osc.stop(now + 0.19);
        } else if (kind === 'hit') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(587.3, now);
          osc.frequency.setValueAtTime(880.0, now + 0.08);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain); gain.connect(ac.destination);
          osc.start(now); osc.stop(now + 0.26);
        } else if (kind === 'good') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(392, now);
          osc.frequency.setValueAtTime(523.25, now + 0.1);
          osc.frequency.setValueAtTime(783.99, now + 0.2);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
          osc.connect(gain); gain.connect(ac.destination);
          osc.start(now); osc.stop(now + 0.45);
        } else if (kind === 'doink') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(210, now + 0.24);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.connect(gain); gain.connect(ac.destination);
          osc.start(now); osc.stop(now + 0.29);
        } else if (kind === 'miss') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(190, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
          osc.connect(gain); gain.connect(ac.destination);
          osc.start(now); osc.stop(now + 0.25);
        }
      } catch (_) {}
    }

    /* -------------------------------------------------------------------------
       SPEECH SYNTHESIS & AAC DIALOGUE BRIDGE
       ------------------------------------------------------------------------- */

    speak(text) {
      if (!this.voiceCheerEnabled || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.0;
        u.pitch = 1.05;

        // Try British / Afro-Euro voice profile
        const voices = window.speechSynthesis.getVoices();
        const enGb = voices.find(v => v.lang.includes('en-GB') || v.name.includes('UK') || v.name.includes('Amina'));
        if (enGb) u.voice = enGb;
        window.speechSynthesis.speak(u);
      } catch (_) {}
    }

    sendToAacSentenceStrip(phraseText) {
      // Store in session storage for the main AAC board
      sessionStorage.setItem("AAC_INCOMING_DIALOGUE", JSON.stringify({
        source: "Dallas Cowboys Studio",
        text: phraseText,
        score: this.state.score
      }));

      // Speak cheer before navigating
      this.speak(`Returning to board: ${phraseText}`);

      setTimeout(() => {
        window.location.href = "index.html?fromGame=1";
      }, 350);
    }

    /* -------------------------------------------------------------------------
       MAIN ANIMATION LOOP
       ------------------------------------------------------------------------- */

    animate() {
      requestAnimationFrame(() => this.animate());

      const now = performance.now();
      const dt = Math.min((now - this.lastTime) * 0.001, 0.1);
      this.lastTime = now;

      // Update Free Roam Orbit Camera
      if (this.state.mode === 'roam' && !this.state.ballInFlight) {
        const cx = this.cameraTarget.x + Math.sin(this.orbitYaw) * Math.cos(this.orbitPitch) * this.orbitDistance;
        const cy = this.cameraTarget.y + Math.sin(this.orbitPitch) * this.orbitDistance;
        const cz = this.cameraTarget.z + Math.cos(this.orbitYaw) * Math.cos(this.orbitPitch) * this.orbitDistance;
        this.camera.position.set(cx, cy, cz);
        this.camera.lookAt(this.cameraTarget);
      }

      this.updatePhysics(dt);
      this.renderer.render(this.scene, this.camera);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.cowboysEngine = new CowboysStudioEngine();
  });
})();
