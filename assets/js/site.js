/* ==========================================================================
   Aryan Bandyopadhyay — site behaviour
   No frameworks. No CDN. No trackers.
   ---------------------------------------------------------------------------
   Contents
     0.  Utilities
     1.  Content model (project technical specs & citations)
     2.  Theme controller
     3.  Header, mobile nav, scroll-spy, reading thread
     4.  Reveal-on-scroll
     5.  Chart engine (dependency-free canvas plots)
     6.  Hero instrument  (4H-SiC LGAD carrier transport  |  Burgers shock)
     7.  Lab explorer    (Mott-Schottky · field profile · live FFT spectra)
     8.  Research filtering & search
     9.  Overlays: project sheet · CV · command palette · lightbox · toast
     10. Small affordances (copy, print, clock)
   ========================================================================== */
(function () {
  'use strict';

  /* ======================================================================
     0. UTILITIES
     ====================================================================== */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  function throttle(fn, wait) {
    var last = 0, timer = null;
    return function () {
      var now = Date.now();
      var args = arguments;
      var self = this;
      var remaining = wait - (now - last);
      if (remaining <= 0) {
        if (timer) { clearTimeout(timer); timer = null; }
        last = now;
        fn.apply(self, args);
      } else if (!timer) {
        timer = setTimeout(function () {
          last = Date.now();
          timer = null;
          fn.apply(self, args);
        }, remaining);
      }
    };
  }

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { /* private mode — silently ignore */ }
    return null;
  }

  /* CSS custom property lookup with a numeric fallback. */
  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  var SITE = {
    email: 'aryan.bandyopadhyay@niser.ac.in',
    name: 'Aryan Bandyopadhyay',
    domain: 'aryanbandyopadhyay.me'
  };

  /* ======================================================================
     1. CONTENT MODEL — technical specifications for the project sheets
     ====================================================================== */
  var PROJECT_SPECS = {
    lgad: {
      eyebrow: 'Detector physics · IIT Mandi',
      title: 'Electrical, Gain & Radiation Characterization of 4H-SiC LGADs',
      sub: 'Summer Research Intern · Advisor: Prof. Prabhakar Palni · May 2026 – present',
      metrics: [
        { k: 'Breakdown / pinch-off', v: 'V_pt = 75.5 V' },
        { k: 'Peak field', v: '1.65–1.74 MV/cm' },
        { k: 'α gain (150–350 V)', v: 'M = 2.02–2.84' },
        { k: 'Irradiated α-CCE', v: '52.5 %' }
      ],
      method: [
        'Derived a first-principles <strong>Lucky-Drift</strong> impact-ionization model for 4H-SiC along ⟨0001⟩ — a<sub>h</sub> = 1.92 × 10⁷ cm⁻¹, b<sub>h</sub> = 9.80 × 10⁶ V/cm — and implemented it in <strong>Silvaco Victory Device</strong>.',
        'Validated static C–V, 1/C² <strong>Mott–Schottky</strong> behaviour and reverse I–V against 50 µm epitaxial SICAR prototypes.',
        'Reproduced ²⁴¹Am α-particle charge collection and internal gain within 1σ across 150–350 V, and quantified MIP gain (2.06–2.81).',
        'Modelled proton-irradiated <strong>C-DLTS</strong> trap compensation (Z<sub>1/2</sub>, EH<sub>3</sub>, EH<sub>6/7</sub> up to 10¹⁴ n<sub>eq</sub>/cm²), capturing Fermi-level pinning and the collapse of α-CCE to 52.5%.'
      ],
      stack: ['Silvaco Victory Device', 'Synopsys Sentaurus', 'Lucky-Drift impact ionization', 'Mott–Schottky analysis', 'C-DLTS', 'Python'],
      cite: '@unpublished{Bandyopadhyay2026SiCLGAD,\n  author = {Bandyopadhyay, Aryan and Palni, Prabhakar},\n  title  = {Electrical, Gain and Radiation Characterization of 4H-SiC Low Gain Avalanche Detectors},\n  note   = {IIT Mandi Summer Research Internship; manuscript in preparation},\n  year   = {2026}\n}'
    },
    burgers: {
      eyebrow: 'Computational fluid dynamics · NISER',
      title: 'Shock Waves & Burgers Turbulence in 1D Viscous Fluids',
      sub: 'Research project · Advisor: Prof. Subhasish Basak · Oct 2026 – Nov 2026',
      metrics: [
        { k: 'Shock thickness', v: 'δ ∝ ν^0.985' },
        { k: 'Energy spectrum', v: 'E(k) ∝ k⁻²·⁰³' },
        { k: 'Spectral convergence', v: '10⁻⁹' },
        { k: 'Reference solution', v: '8,192-pt Cole–Hopf' }
      ],
      method: [
        'Implemented five 1D viscous Burgers solvers from scratch: <strong>Strang-split spectral FFT</strong>, Crank–Nicolson with Sherman–Morrison, Lax–Wendroff, Upwind and FTCS.',
        'Verified spatial convergence (to spectral 10⁻⁹) and von Neumann stability against an <strong>8,192-point exact Cole–Hopf</strong> reference.',
        'Extracted shock thickness (δ ∝ ν^0.985), the energy spectrum (E(k) ∝ k⁻²·⁰³) and bifractal structure-function scaling ζ<sub>p</sub>.',
        'Quantified upwind numerical viscosity (ν<sub>num</sub>/ν = 3.7 at N = 256) and grid-locking transitions across three decades of viscosity.'
      ],
      stack: ['Spectral FFT', 'Crank–Nicolson', 'Sherman–Morrison', 'Cole–Hopf transform', 'Structure functions', 'Python'],
      cite: '@software{Bandyopadhyay2026Burgers,\n  author = {Bandyopadhyay, Aryan},\n  title  = {Shock Waves and Burgers Turbulence in 1D Viscous Fluids},\n  year   = {2026},\n  url    = {https://github.com/Aryans-lab/Computational_Physics_Lab/tree/main/project_burgulence}\n}'
    },
    galaxy: {
      eyebrow: 'Scientific ML · NISER',
      title: 'Galaxy Morphology Classification using CNNs',
      sub: 'Independent computational project · School of Physical Sciences · Jul 2025',
      metrics: [
        { k: 'ROC–AUC', v: '0.966 ± 0.001' },
        { k: 'PR–AUC', v: '0.983' },
        { k: 'Macro-F1', v: '0.893' },
        { k: 'Held-out set', v: 'N = 23,433' }
      ],
      method: [
        'Built a <strong>leak-free stratified</strong> pipeline on 156,219 debiased Galaxy Zoo 2 galaxies (t₀₁ &gt; 0.8) with training-isolated oversampling.',
        'Benchmarked a custom 3-block VGG-style CNN against a frozen ImageNet ResNet50 and against classical photometric descriptors (Gini, M₂₀, concentration) with XGBoost.',
        'Reported bootstrap confidence intervals and <strong>Grad-CAM</strong> evidence for every headline metric.'
      ],
      stack: ['PyTorch', 'CNN', 'ResNet50', 'XGBoost', 'Grad-CAM', 'Bootstrap CI'],
      cite: '@software{Bandyopadhyay2025GalaxyCNN,\n  author = {Bandyopadhyay, Aryan},\n  title  = {Galaxy Morphology Classification using Convolutional Neural Networks},\n  year   = {2025},\n  url    = {https://github.com/Aryans-lab/Galaxy-Morphology-Classification-using-CNNs}\n}'
    },
    pinn: {
      eyebrow: 'Scientific ML · NISER',
      title: 'Inverse PINNs & Cramér–Rao Bound Analysis for Heat Diffusion',
      sub: 'Independent research project · School of Physical Sciences · Jun 2025 – Aug 2025',
      metrics: [
        { k: 'Relative L² error', v: '6.0 × 10⁻⁴' },
        { k: 'Pseudo-experiments', v: '4,000' },
        { k: 'Dimensional sweep', v: '1D → 3D' },
        { k: 'Estimator bound', v: 'Cramér–Rao' }
      ],
      method: [
        'Solved 1D–3D heat diffusion with <strong>exact-constraint PINNs</strong> and Levenberg–Marquardt optimisation, reaching 6.0 × 10⁻⁴ relative L² error.',
        'Derived the closed-form ideal-PINN objective through a stochastic heat-equation equivalence, and proved that omitting the marginal log-determinant <strong>induces estimator bias</strong>.',
        'Characterised UV variance scaling across 1D–3D and implemented a one-loop correction recovering <strong>Cramér–Rao bound</strong> accuracy across 4,000 pseudo-experiments.'
      ],
      stack: ['PyTorch', 'PINNs', 'Levenberg–Marquardt', 'Fisher information', 'Stochastic heat equation', 'NumPy'],
      cite: '@software{Bandyopadhyay2025HeatPINNs,\n  author = {Bandyopadhyay, Aryan},\n  title  = {Inverse PINNs and Cramer-Rao Bound Analysis for 1D-3D Heat Diffusion},\n  year   = {2025},\n  url    = {https://github.com/Aryans-lab/Heat-Diffusion-PINNs}\n}'
    },
    topology: {
      eyebrow: 'Mathematical physics · NISER',
      title: 'Topological Structures & Metric Spaces',
      sub: 'Summer reading project · Advisor: Dr. Chitrabhanu Chaudhuri · May 2025 – Jul 2025',
      metrics: [
        { k: 'Framework', v: 'Point-set topology' },
        { k: 'Focus', v: 'Invariants' },
        { k: 'Role', v: 'Foundations' }
      ],
      method: [
        'Studied metric spaces, point-set topology, continuity, compactness and connectedness.',
        'Examined homeomorphisms, quotient topologies and topological invariants relevant to physical systems.'
      ],
      stack: ['Metric spaces', 'Compactness', 'Quotient topology', 'Invariants'],
      cite: '@misc{Bandyopadhyay2025Topology,\n  author = {Bandyopadhyay, Aryan},\n  title  = {Topological Structures and Metric Spaces in Physical Systems},\n  note   = {Summer Reading Project, NISER Bhubaneswar (Advisor: Dr. Chitrabhanu Chaudhuri)},\n  year   = {2025}\n}'
    }
  };

  /* Physical constants used by the live instruments (values as implemented). */
  var SIC = {
    aH: 1.92e7,        // cm^-1   Lucky-Drift pre-factor, 4H-SiC <0001>
    bH: 9.80e6,        // V/cm    Lucky-Drift exponential scale
    VPT: 75.5,         // V       full-depletion / pinch-off (Mott-Schottky knee)
    EPEAK_REF: 1.71e6, // V/cm    peak field at 250 V (measured 1.65-1.74 MV/cm)
    VREF: 250
  };

  /* ======================================================================
     2. THEME CONTROLLER
     ====================================================================== */
  var Theme = (function () {
    var KEY = 'ab-theme';
    var root = document.documentElement;
    var meta = $('meta[name="theme-color"]');

    function apply(mode) {
      root.setAttribute('data-theme', mode);
      if (meta) meta.setAttribute('content', mode === 'light' ? '#f7f5f0' : '#060911');
      $$('[data-theme-toggle]').forEach(function (btn) {
        btn.setAttribute('aria-label', mode === 'light' ? 'Switch to obsidian lab theme' : 'Switch to journal paper theme');
        btn.setAttribute('title', mode === 'light' ? 'Obsidian lab (dark)' : 'Journal paper (light)');
      });
      document.dispatchEvent(new CustomEvent('themechange', { detail: { mode: mode } }));
    }

    function current() { return root.getAttribute('data-theme') || 'dark'; }

    function set(mode, persist) {
      apply(mode);
      if (persist !== false) store(KEY, mode);
    }

    function toggle() { set(current() === 'light' ? 'dark' : 'light'); }

    function init() {
      var saved = store(KEY);
      if (saved === 'light' || saved === 'dark') {
        apply(saved);
      } else {
        apply(prefersReduced ? 'dark' : 'dark');
      }
      $$('[data-theme-toggle]').forEach(function (btn) {
        btn.addEventListener('click', toggle);
      });
    }

    return { init: init, set: set, toggle: toggle, current: current };
  })();

  /* ======================================================================
     3. HEADER, MOBILE NAV, SCROLL-SPY, READING THREAD
     ====================================================================== */
  var Nav = (function () {
    function init() {
      var header = $('.masthead');
      var thread = $('.progress-thread');
      var toTop = $('.to-top');
      var panel = $('.mobile-panel');
      var toggleBtn = $('.mobile-toggle');
      var links = $$('.nav__link');
      var sections = links
        .map(function (a) {
          var id = (a.getAttribute('href') || '').replace('#', '');
          return id ? document.getElementById(id) : null;
        })
        .filter(Boolean);

      /* Header elevation + reading thread + back-to-top */
      var onScroll = throttle(function () {
        var y = window.scrollY || window.pageYOffset;
        if (header) header.classList.toggle('is-stuck', y > 12);
        if (toTop) toTop.classList.toggle('is-visible', y > 700);
        if (thread) {
          var max = document.documentElement.scrollHeight - window.innerHeight;
          thread.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
        }
      }, 16);

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      if (toTop) {
        toTop.addEventListener('click', function () {
          window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
        });
      }

      /* Scroll spy */
      if ('IntersectionObserver' in window && sections.length) {
        var visible = new Set();
        var spy = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) visible.add(entry.target.id);
              else visible.delete(entry.target.id);
            });
            var first = null;
            for (var i = 0; i < sections.length; i++) {
              if (visible.has(sections[i].id)) { first = sections[i].id; break; }
            }
            if (first) {
              links.forEach(function (a) {
                a.classList.toggle('is-active', a.getAttribute('href') === '#' + first);
              });
            }
          },
          { rootMargin: '-18% 0px -70% 0px', threshold: 0 }
        );
        sections.forEach(function (s) { spy.observe(s); });
      }

      /* Mobile panel */
      if (panel && toggleBtn) {
        toggleBtn.addEventListener('click', function () {
          var open = panel.classList.toggle('is-open');
          toggleBtn.setAttribute('aria-expanded', String(open));
        });
        panel.addEventListener('click', function (e) {
          if (e.target.closest('a, button')) {
            panel.classList.remove('is-open');
            toggleBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }
    }
    return { init: init };
  })();

  /* ======================================================================
     4. REVEAL ON SCROLL
     ====================================================================== */
  var Reveal = (function () {
    function init() {
      var items = $$('.reveal');
      if (!items.length) return;
      if (!('IntersectionObserver' in window) || prefersReduced) {
        items.forEach(function (el) { el.classList.add('is-in'); });
        return;
      }
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      items.forEach(function (el, i) {
        if (!el.style.getPropertyValue('--reveal-delay')) {
          el.style.setProperty('--reveal-delay', (i % 6) * 55 + 'ms');
        }
        io.observe(el);
      });
    }
    return { init: init };
  })();

  /* ======================================================================
     5. CHART ENGINE
     A compact canvas plotting core: linear + log axes, grid, ticks,
     series paths, markers, shaded bands and annotations.
     ====================================================================== */
  function Chart(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.pad = { t: 18, r: 16, b: 44, l: 52 };
    this.style = {};
  }

  Chart.prototype._palette = function () {
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      light: light,
      ink: light ? '#0d1522' : '#f1f5f9',
      muted: light ? '#5a6b82' : '#8b9ab0',
      faint: light ? '#7d8b9f' : '#5d6b80',
      grid: light ? 'rgba(24,35,51,0.10)' : 'rgba(148,163,184,0.13)',
      gridMinor: light ? 'rgba(24,35,51,0.05)' : 'rgba(148,163,184,0.06)',
      axis: light ? 'rgba(24,35,51,0.28)' : 'rgba(148,163,184,0.35)',
      signal: light ? '#0369a1' : '#38bdf8',
      verd: light ? '#047857' : '#34d399',
      verdigris: light ? '#047857' : '#34d399',
      amber: light ? '#a16207' : '#fbbf24',
      violet: light ? '#6d28d9' : '#a78bfa',
      rose: light ? '#be123c' : '#fb7185'
    };
  };

  Chart.prototype.resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    var w = Math.max(160, Math.round(rect.width));
    var h = Math.max(120, Math.round(rect.height));
    if (this.canvas.width !== w * this.dpr || this.canvas.height !== h * this.dpr) {
      this.canvas.width = w * this.dpr;
      this.canvas.height = h * this.dpr;
    }
    this.w = w;
    this.h = h;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };

  Chart.prototype.draw = function (cfg) {
    this.resize();
    var ctx = this.ctx;
    var P = this._palette();
    var w = this.w, h = this.h;
    var pad = this.pad;
    var plotW = w - pad.l - pad.r;
    var plotH = h - pad.t - pad.b;
    if (plotW < 20 || plotH < 20) return;

    ctx.clearRect(0, 0, w, h);

    var xa = cfg.x, ya = cfg.y;
    var xLog = xa.type === 'log';
    var yLog = ya.type === 'log';
    var x0 = xa.min, x1 = xa.max, y0 = ya.min, y1 = ya.max;

    function sx(v) {
      var t = xLog
        ? (Math.log10(v) - Math.log10(x0)) / (Math.log10(x1) - Math.log10(x0))
        : (v - x0) / (x1 - x0);
      return pad.l + t * plotW;
    }
    function sy(v) {
      var t = yLog
        ? (Math.log10(v) - Math.log10(y0)) / (Math.log10(y1) - Math.log10(y0))
        : (v - y0) / (y1 - y0);
      return pad.t + plotH - t * plotH;
    }

    /* --- plot background --- */
    ctx.fillStyle = P.light ? 'rgba(255,255,255,0.55)' : 'rgba(3,5,9,0.35)';
    ctx.fillRect(pad.l, pad.t, plotW, plotH);

    /* --- grid --- */
    var xticks = this._ticks(xa, 6);
    var yticks = this._ticks(ya, 5);

    ctx.lineWidth = 1;
    ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = 'middle';

    yticks.forEach(function (t) {
      var y = Math.round(sy(t.value)) + 0.5;
      ctx.strokeStyle = t.major ? P.grid : P.gridMinor;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + plotW, y);
      ctx.stroke();
      if (t.major) {
        ctx.fillStyle = P.faint;
        ctx.textAlign = 'right';
        ctx.fillText(t.label, pad.l - 8, y);
      }
    });

    xticks.forEach(function (t) {
      var x = Math.round(sx(t.value)) + 0.5;
      ctx.strokeStyle = t.major ? P.grid : P.gridMinor;
      ctx.beginPath();
      ctx.moveTo(x, pad.t);
      ctx.lineTo(x, pad.t + plotH);
      ctx.stroke();
      if (t.major) {
        ctx.fillStyle = P.faint;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(t.label, x, pad.t + plotH + 8);
        ctx.textBaseline = 'middle';
      }
    });

    /* --- axes --- */
    ctx.strokeStyle = P.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l + 0.5, pad.t);
    ctx.lineTo(pad.l + 0.5, pad.t + plotH + 0.5);
    ctx.lineTo(pad.l + plotW, pad.t + plotH + 0.5);
    ctx.stroke();

    /* --- axis titles --- */
    ctx.fillStyle = P.muted;
    ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
    if (xa.label) {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(xa.label, pad.l + plotW, h - 4);
    }
    if (ya.label) {
      ctx.save();
      ctx.translate(11, pad.t + 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(ya.label, 0, 0);
      ctx.restore();
    }

    /* --- shaded bands --- */
    (cfg.bands || []).forEach(function (band) {
      var xa1 = sx(band.from), xa2 = sx(band.to);
      ctx.fillStyle = band.color || (P.light ? 'rgba(3,105,161,0.07)' : 'rgba(56,189,248,0.08)');
      ctx.fillRect(Math.min(xa1, xa2), pad.t, Math.abs(xa2 - xa1), plotH);
    });

    /* --- series --- */
    var self = this;
    (cfg.series || []).forEach(function (s) {
      if (!s.points || s.points.length < 2) return;
      var color = P[s.color] || s.color || P.signal;
      if (typeof color !== 'string') color = P.signal;
      ctx.save();
      ctx.beginPath();
      ctx.rect(pad.l, pad.t - 2, plotW, plotH + 4);
      ctx.clip();

      if (s.fill) {
        var grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + plotH);
        grad.addColorStop(0, self._alpha(color, 0.22));
        grad.addColorStop(1, self._alpha(color, 0));
        ctx.beginPath();
        s.points.forEach(function (p, i) {
          var px = sx(p[0]), py = sy(p[1]);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.lineTo(sx(s.points[s.points.length - 1][0]), pad.t + plotH);
        ctx.lineTo(sx(s.points[0][0]), pad.t + plotH);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.beginPath();
      s.points.forEach(function (p, i) {
        var px = sx(p[0]), py = sy(p[1]);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = s.width || 1.9;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (s.dashed) ctx.setLineDash(s.dashed === true ? [5, 4] : s.dashed);
      else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);

      /* markers */
      if (s.marker) {
        s.points.forEach(function (p) {
          if (p[2] === 0) return;
          var px = sx(p[0]), py = sy(p[1]);
          ctx.beginPath();
          ctx.arc(px, py, s.markerSize || 3, 0, Math.PI * 2);
          ctx.fillStyle = P.light ? '#fffefb' : '#05070c';
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        });
      }
      ctx.restore();
    });

    /* --- annotations --- */
    (cfg.annotations || []).forEach(function (a) {
      var x = sx(a.x), y = sy(a.y);
      ctx.fillStyle = P[a.color || 'muted'] || P.muted;
      ctx.font = (a.mono === false ? '' : '') + '10px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = a.align || 'left';
      ctx.textBaseline = 'middle';

      if (a.line) {
        ctx.save();
        ctx.strokeStyle = self._alpha(P[a.color || 'muted'] || P.muted, 0.6);
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (a.line === 'v') { ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + plotH); }
        else { ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + plotW, y); }
        ctx.stroke();
        ctx.restore();
      }
      if (a.text) ctx.fillText(a.text, x + (a.dx || 0), y + (a.dy || 0));
    });

    /* --- legend --- */
    if (cfg.legend && cfg.legend.length) {
      var lx = pad.l + 10;
      var ly = pad.t + 8;
      ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      cfg.legend.forEach(function (item) {
        var color = P[item.color] || item.color || P.signal;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash(item.dashed ? [4, 3] : []);
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + 14, ly);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = P.muted;
        ctx.fillText(item.label, lx + 19, ly);
        ly += 15;
      });
    }
  };

  Chart.prototype._alpha = function (color, a) {
    /* Accept #rrggbb or rgb(); never throw on an unexpected token */
    if (typeof color !== 'string' || !color) return 'rgba(148,163,184,' + a + ')';
    if (color.charAt(0) === '#') {
      var r = parseInt(color.substr(1, 2), 16);
      var g = parseInt(color.substr(3, 2), 16);
      var b = parseInt(color.substr(5, 2), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }
    return color;
  };

  Chart.prototype._ticks = function (axis, target) {
    var ticks = [];
    var min = axis.min, max = axis.max;
    if (axis.type === 'log') {
      var lo = Math.floor(Math.log10(min));
      var hi = Math.ceil(Math.log10(max));
      for (var e = lo; e <= hi; e++) {
        for (var m = 1; m < 10; m++) {
          var v = m * Math.pow(10, e);
          if (v < min * 0.999 || v > max * 1.001) continue;
          var major = m === 1;
          ticks.push({ value: v, major: major, label: major ? this._logLabel(v) : '' });
        }
      }
      return ticks;
    }
    var span = max - min;
    var raw = span / target;
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var norm = raw / mag;
    var step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
    var start = Math.ceil(min / step) * step;
    for (var val = start; val <= max + step * 0.001; val += step) {
      ticks.push({ value: val, major: true, label: this._numLabel(val, step) });
    }
    return ticks;
  };

  Chart.prototype._logLabel = function (v) {
    if (v >= 1e6) return (v / 1e6) + 'M';
    if (v >= 1000) return (v / 1000) + 'k';
    if (v >= 1) return String(v);
    if (v >= 0.001) return String(v);
    return v.toExponential(0).replace('e', 'e');
  };

  Chart.prototype._numLabel = function (v, step) {
    var dec = step < 1 ? Math.min(3, Math.ceil(-Math.log10(step))) : 0;
    if (Math.abs(v) >= 1e4) return (v / 1000).toFixed(0) + 'k';
    return v.toFixed(dec);
  };

  /* ======================================================================
     6. HERO INSTRUMENT
     Mode A — 4H-SiC LGAD: carrier drift, impact-ionisation multiplication
              inside the gain layer, α-track injection on click.
     Mode B — Burgers: the exact tanh shock steepening out of a shear wave.
     ====================================================================== */
  var Hero = (function () {
    var canvas, ctx, dpr = 1;
    var w = 600, h = 375;
    var mode = 'sic';
    var raf = null;
    var visible = true;
    var carriers = [];
    var alphaTracks = [];
    var tPhase = 0;
    var readoutL, readoutR, titleEl, pulseBtn;

    function size() {
      if (!canvas) return;
      var rect = canvas.getBoundingClientRect();
      w = Math.max(280, Math.round(rect.width));
      h = Math.max(180, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      carriers = [];
      var n = w < 420 ? 26 : 42;
      for (var i = 0; i < n; i++) {
        carriers.push({
          x: Math.random() * w,
          y: 24 + Math.random() * (h - 62),
          vx: 0.5 + Math.random() * 0.85,
          vy: (Math.random() - 0.5) * 0.42,
          hole: Math.random() > 0.4,
          life: 1,
          gain: 0,
          r: 1.5 + Math.random() * 0.9
        });
      }
    }

    function inject(x, y) {
      if (mode !== 'sic') {
        tPhase = 0;
        return;
      }
      alphaTracks.push({ x: x, y: y, r: 0, life: 1 });
      for (var i = 0; i < 14; i++) {
        carriers.push({
          x: x,
          y: y + (Math.random() - 0.5) * 7,
          vx: 0.9 + Math.random() * 1.5,
          vy: (Math.random() - 0.5) * 1.1,
          hole: i % 2 === 0,
          life: 1,
          gain: 1,
          r: 1.7
        });
      }
      if (carriers.length > 190) carriers.splice(0, carriers.length - 190);
    }

    function palette() {
      var light = document.documentElement.getAttribute('data-theme') === 'light';
      return {
        light: light,
        grid: light ? 'rgba(24,35,51,0.07)' : 'rgba(56,189,248,0.07)',
        lattice: light ? 'rgba(24,35,51,0.16)' : 'rgba(148,163,184,0.2)',
        signal: light ? '#0369a1' : '#38bdf8',
        verd: light ? '#047857' : '#34d399',
      verdigris: light ? '#047857' : '#34d399',
        amber: light ? '#a16207' : '#fbbf24',
        label: light ? 'rgba(3,105,161,0.85)' : 'rgba(56,189,248,0.7)',
        faint: light ? 'rgba(24,35,51,0.4)' : 'rgba(148,163,184,0.45)'
      };
    }

    function drawGrid(P) {
      ctx.strokeStyle = P.grid;
      ctx.lineWidth = 1;
      var step = 30;
      for (var x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, h);
        ctx.stroke();
      }
      for (var y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(w, Math.round(y) + 0.5);
        ctx.stroke();
      }
    }

    function drawSiC(P, dt) {
      var gx = w * 0.55;
      var gw = Math.max(64, w * 0.2);

      /* epitaxial stack bands */
      var bandH = (h - 24) / 3;
      var stacks = [
        { label: 'p⁺ contact', y: 12, fill: P.light ? 'rgba(24,35,51,0.045)' : 'rgba(148,163,184,0.055)' },
        { label: 'gain layer', y: 12 + bandH, fill: 'rgba(56,189,248,0.055)' },
        { label: 'n⁻ epi (50 µm)', y: 12 + bandH * 2, fill: P.light ? 'rgba(4,120,87,0.04)' : 'rgba(52,211,153,0.035)' }
      ];
      stacks.forEach(function (s) {
        ctx.fillStyle = s.fill;
        ctx.fillRect(0, s.y, w, bandH);
        ctx.fillStyle = P.faint;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(s.label, 8, s.y + 5);
      });

      /* hexagonal lattice hints */
      ctx.fillStyle = P.lattice;
      var stepX = 26, stepY = 22;
      for (var lx = 12; lx < gx; lx += stepX) {
        for (var ly = 20; ly < h - 12; ly += stepY) {
          var off = ((ly / stepY) | 0) % 2 ? stepX / 2 : 0;
          ctx.beginPath();
          ctx.arc(lx + off, ly, 1.05, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* high-field multiplication zone */
      var grad = ctx.createLinearGradient(gx, 0, gx + gw, 0);
      grad.addColorStop(0, 'rgba(56,189,248,0.02)');
      grad.addColorStop(0.45, P.light ? 'rgba(3,105,161,0.16)' : 'rgba(56,189,248,0.2)');
      grad.addColorStop(1, 'rgba(52,211,153,0.03)');
      ctx.fillStyle = grad;
      ctx.fillRect(gx, 12, gw, h - 26);

      ctx.strokeStyle = P.light ? 'rgba(3,105,161,0.35)' : 'rgba(56,189,248,0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(gx, 12);
      ctx.lineTo(gx, h - 14);
      ctx.moveTo(gx + gw, 12);
      ctx.lineTo(gx + gw, h - 14);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = P.label;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('E = 1.71 MV/cm', gx + 5, h - 30);

      /* carriers */
      for (var i = carriers.length - 1; i >= 0; i--) {
        var p = carriers[i];
        var inGain = p.x >= gx && p.x <= gx + gw;
        var boost = inGain ? 2.35 : 1;
        var speed = p.vx * boost * dt * 60;

        p.x += speed;
        p.y += p.vy * dt * 60 * (inGain ? 1.2 : 1);

        if (p.y < 20 || p.y > h - 18) p.vy *= -1;
        if (p.x > w + 4) {
          if (p.gain) {
            p.life -= 0.05;
            if (p.life <= 0) { carriers.splice(i, 1); continue; }
          }
          p.x = -2;
          p.y = 22 + Math.random() * (h - 46);
        }

        var energy = inGain ? 1 + (1 - Math.abs((p.x - (gx + gw / 2)) / (gw / 2))) * 0.8 : 0.55;

        /* impact-ionisation glint */
        if (inGain && Math.random() < 0.028) {
          ctx.strokeStyle = P.light ? 'rgba(161,98,7,0.5)' : 'rgba(251,191,36,0.55)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 7, p.y + (Math.random() - 0.5) * 9);
          ctx.stroke();
        }

        ctx.globalAlpha = p.gain ? Math.max(0.18, p.life) : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (inGain ? 1.22 : 1), 0, Math.PI * 2);
        ctx.fillStyle = p.hole ? P.verd : P.signal;
        ctx.fill();

        /* drift trail */
        ctx.globalAlpha = 0.16 * energy;
        ctx.strokeStyle = p.hole ? P.verd : P.signal;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - 8 * energy, p.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      /* α tracks */
      for (var a = alphaTracks.length - 1; a >= 0; a--) {
        var tr = alphaTracks[a];
        tr.r += 2.4;
        tr.life -= 0.022;
        if (tr.life <= 0) { alphaTracks.splice(a, 1); continue; }
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, tr.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(251,191,36,' + (tr.life * 0.55).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* moving scan line */
      var scanY = ((tPhase * 34) % (h - 26)) + 13;
      ctx.strokeStyle = P.light ? 'rgba(3,105,161,0.18)' : 'rgba(56,189,248,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();
    }

    function drawBurgers(P, dt) {
      tPhase += dt;
      var U = 1;
      var nu = 0.018;
      var x0 = w * 0.5 - 40 * Math.sin(tPhase * 0.55);
      var amp = 1;
      var step = 3;

      /* pre-shock shear wave */
      ctx.beginPath();
      for (var x = 0; x <= w; x += step) {
        var base = Math.sin((x / w) * Math.PI * 1.4 + tPhase * 0.9) * 0.22;
        var shock = -U * Math.tanh((x - x0) / (2 * nu / U * 60));
        var y = h * 0.5 - (shock + base * (1 - Math.abs(shock))) * h * 0.3 * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = P.signal;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      var g2 = ctx.createLinearGradient(0, h * 0.2, 0, h);
      g2.addColorStop(0, 'rgba(56,189,248,0.10)');
      g2.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = g2;
      ctx.fill();

      /* spectrum tail E(k) ~ k^-2 */
      ctx.beginPath();
      var baseY = h - 26;
      for (var k = 1; k < 120; k++) {
        var kx = (k / 120) * (w - 40) + 20;
        var e = Math.pow(k, -2) * 26 + 2;
        var ky = baseY - e;
        if (k === 1) ctx.moveTo(kx, ky);
        else ctx.lineTo(kx, ky);
      }
      ctx.strokeStyle = P.amber;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = P.faint;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('E(k) ∝ k⁻²·⁰³', 22, baseY - 30);
      ctx.textBaseline = 'top';
      ctx.fillText('u(x,t)', 22, 20);
      ctx.textAlign = 'right';
      ctx.fillText('x →', w - 18, baseY + 6);
    }

    function frame(now) {
      if (!visible) { raf = null; return; }
      var dt = Math.min(0.05, (now - (frame.last || now)) / 1000 || 0.016);
      frame.last = now;

      var P = palette();
      ctx.clearRect(0, 0, w, h);
      drawGrid(P);

      if (mode === 'sic') { tPhase += dt; drawSiC(P, dt); }
      else drawBurgers(P, dt);

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (raf === null && !prefersReduced) raf = requestAnimationFrame(frame);
      if (prefersReduced) {
        /* single static frame */
        var P = palette();
        ctx.clearRect(0, 0, w, h);
        drawGrid(P);
        if (mode === 'sic') drawSiC(P, 0.016); else drawBurgers(P, 0.016);
      }
    }

    function setMode(next) {
      mode = next;
      tPhase = 0;
      $$('[data-hero-mode]').forEach(function (b) {
        b.setAttribute('aria-selected', String(b.getAttribute('data-hero-mode') === next));
      });
      if (titleEl) {
        titleEl.textContent = next === 'sic'
          ? '4H-SiC LGAD · carrier drift & gain'
          : 'Burgers shock · spectral decay';
      }
      if (readoutL) {
        readoutL.textContent = next === 'sic'
          ? 'E_peak = 1.71 MV/cm · V_pt = 75.5 V'
          : 'δ = 4ν/U · E(k) ∝ k⁻²·⁰³';
      }
      if (readoutR) {
        readoutR.textContent = next === 'sic'
          ? 'click to inject ²⁴¹Am α-track'
          : 'ν = 1.8 × 10⁻² · Cole–Hopf exact';
      }
      if (pulseBtn) {
        pulseBtn.textContent = next === 'sic' ? 'Inject α-track' : 'Re-steepen shock';
        pulseBtn.setAttribute('aria-label', next === 'sic' ? 'Inject an alpha particle track' : 'Restart the shock');
      }
    }

    function init() {
      canvas = $('#heroCanvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      readoutL = $('#heroReadoutA');
      readoutR = $('#heroReadoutB');
      titleEl = $('#heroInstrumentTitle');
      pulseBtn = $('#heroPulse');

      size();
      setMode('sic');

      window.addEventListener('resize', throttle(size, 180));

      canvas.addEventListener('pointerdown', function (e) {
        var rect = canvas.getBoundingClientRect();
        inject(e.clientX - rect.left, e.clientY - rect.top);
      });

      var modeBtns = $$('[data-hero-mode]');
      modeBtns.forEach(function (b) {
        b.addEventListener('click', function () { setMode(b.getAttribute('data-hero-mode')); });
      });

      if (pulseBtn) {
        pulseBtn.addEventListener('click', function () {
          if (mode === 'sic') inject(w * 0.3, h * 0.5);
          else tPhase = 0;
        });
      }

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            visible = en.isIntersecting;
            if (visible) start();
            else if (raf) { cancelAnimationFrame(raf); raf = null; }
          });
        }, { threshold: 0.05 }).observe(canvas);
      }

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          if (raf) { cancelAnimationFrame(raf); raf = null; }
        } else if (visible) start();
      });

      document.addEventListener('themechange', function () {
        if (prefersReduced) start();
      });

      start();
    }

    return { init: init };
  })();

  /* ======================================================================
     7. LAB EXPLORER
     ---------------------------------------------------------------------
     lgad    : analyst instrument. 1/C² Mott–Schottky + field profile,
               calibrated to the measured anchors of the study.
     burgers : the exact tanh shock and a live radix-2 FFT of the profile.
     galaxy / pinn : figure-backed galleries of the project's own output.
     ====================================================================== */
  var Lab = (function () {
    var chart = null;
    var module = 'lgad';
    var state = {
      bias: 250,
      fluence: 0,        /* 0 = unirradiated, 1 = 1e14 n_eq/cm² */
      lgadView: 'cv',    /* 'cv' | 'field' */
      nuExp: -3.0,
      burgersView: 'profile',
      galaxyFig: 0,
      pinnFig: 0
    };

    var titleEl, badgeEl, descEl;
    var panels = {};

    /* ---- physics helpers ---- */
    function peakField(V, fluence) {
      var e = SIC.EPEAK_REF * Math.pow(clamp(V, 30, 400) / SIC.VREF, 0.86);
      if (fluence) e = Math.min(e, 0.63 * SIC.EPEAK_REF) * (0.82 + 0.18 * clamp(V / 350, 0, 1));
      return e; /* V/cm */
    }

    function luckyDrift(E) {
      return SIC.aH * Math.exp(-SIC.bH / Math.max(E, 1e4)); /* cm^-1 */
    }

    function gain(V, fluence) {
      if (V <= SIC.VPT) return 1;
      var t = clamp((V - SIC.VPT) / (150 - SIC.VPT), 0, 1);
      var ramp = 1 + (2.02 - 1) * t;
      var above = Math.max(0, V - 150) * 0.0041;
      var g = ramp + above;
      if (fluence) g = 1 + (g - 1) * 0.42;
      return g;
    }

    function cce(V, fluence) {
      if (fluence) {
        return 52.5 * (1 - Math.exp(-V / 42));
      }
      return 99.3 * (1 - Math.exp(-V / 34));
    }

    /* ---- 1/C² Mott–Schottky (normalised) ---- */
    function mottSchottky(V) {
      if (V >= SIC.VPT) return 1;
      return clamp((V + 1.9) / (SIC.VPT + 1.9), 0.02, 1);
    }

    /* ---- field profile across the 50 µm epi ---- */
    function fieldProfile(V, fluence) {
      var e0 = peakField(V, fluence);
      var depth = 50; /* µm */
      var pts = [];
      var n = 90;
      var depleted = clamp(0.42 + V / 620, 0.42, 1);
      for (var i = 0; i <= n; i++) {
        var x = (i / n) * depth;
        var rel = 1 - x / (depth * depleted);
        var e = e0 * Math.max(0, rel) * (fluence ? 0.94 : 1);
        if (fluence) {
          /* Fermi-level pinning: field collapses to a low, nearly flat plateau */
          e = e0 * (0.2 + 0.8 * Math.max(0, rel)) * 0.9;
        }
        pts.push([x, e]);
      }
      return pts;
    }

    /* ---- radix-2 FFT ---- */
    function fft(re, im) {
      var n = re.length;
      for (var i = 1, j = 0; i < n; i++) {
        var bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) {
          var tr = re[i]; re[i] = re[j]; re[j] = tr;
          var ti = im[i]; im[i] = im[j]; im[j] = ti;
        }
      }
      for (var len = 2; len <= n; len <<= 1) {
        var ang = (-2 * Math.PI) / len;
        var wr = Math.cos(ang), wi = Math.sin(ang);
        for (var s = 0; s < n; s += len) {
          var cr = 1, ci = 0;
          for (var k = 0; k < len / 2; k++) {
            var ur = re[s + k], ui = im[s + k];
            var vr = re[s + k + len / 2] * cr - im[s + k + len / 2] * ci;
            var vi = re[s + k + len / 2] * ci + im[s + k + len / 2] * cr;
            re[s + k] = ur + vr; im[s + k] = ui + vi;
            re[s + k + len / 2] = ur - vr; im[s + k + len / 2] = ui - vi;
            var ncr = cr * wr - ci * wi;
            ci = cr * wi + ci * wr;
            cr = ncr;
          }
        }
      }
    }

    /* Periodic tanh shock on [0, 2π): u(x) = −U tanh( U·(x−π) / 2ν ).
       The k = 0 mode is removed so the spectrum describes the fluctuation
       energy, exactly as the solver's post-processing does. */
    function burgersSpectrum(nu, U, N) {
      N = N || 1024;
      var re = new Float64Array(N);
      var im = new Float64Array(N);
      var L = 2 * Math.PI;
      var x0 = Math.PI;
      var mean = 0;
      for (var i = 0; i < N; i++) {
        var x = (i / N) * L;
        var val = -U * Math.tanh((U * (x - x0)) / (2 * nu));
        re[i] = val;
        mean += val;
        im[i] = 0;
      }
      mean /= N;

      /* windowed (Hann) transform to suppress the periodic-edge discontinuity */
      for (var j = 0; j < N; j++) {
        var w = 0.5 - 0.5 * Math.cos((2 * Math.PI * j) / (N - 1));
        re[j] = (re[j] - mean) * w;
      }

      fft(re, im);

      var out = [];
      for (var k = 1; k < N / 2; k++) {
        var power = (re[k] * re[k] + im[k] * im[k]) / (N * N);
        if (power > 0) out.push([k, power]);
      }
      return out;
    }

    function burgersProfile(nu, U, N) {
      N = N || 400;
      var L = 2 * Math.PI;
      var pts = [];
      for (var i = 0; i <= N; i++) {
        var x = (i / N) * L;
        pts.push([x, -U * Math.tanh((U * (x - Math.PI)) / (2 * nu))]);
      }
      return pts;
    }

    /* ---- module descriptors ---- */
    var MODULES = {
      lgad: {
        badge: 'Detector instrument',
        title: '4H-SiC LGAD response',
        desc: 'Mott–Schottky depletion behaviour and the internal field profile of a 50 µm epitaxial SICAR diode. The analytic instrument is anchored to the measured quantities of the study.',
        controls: 'lgad',
        metrics: [
          { label: 'Peak field', key: 'epeak', cls: 'signal' },
          { label: 'Hole ionisation α_h', key: 'alpha', cls: 'amber' },
          { label: 'Internal gain M', key: 'gain', cls: 'verdigris' },
          { label: 'α-CCE', key: 'cce', cls: 'violet' }
        ]
      },
      burgers: {
        badge: 'Spectral solver',
        title: 'Burgers shock structure',
        desc: 'The exact Cole–Hopf tanh shock, recomputed as you move the viscosity slider. The right-hand view is a live 1024-point radix-2 FFT of the profile — computed in this browser.',
        controls: 'burgers',
        metrics: [
          { label: 'Shock thickness δ', key: 'delta', cls: 'signal' },
          { label: 'Fit exponent', key: 'exp', cls: 'verdigris' },
          { label: 'Spectral slope', key: 'slope', cls: 'amber' },
          { label: 'Grid points', key: 'grid', cls: 'violet' }
        ]
      },
      galaxy: {
        badge: 'Model output',
        title: 'Galaxy morphology CNN',
        desc: 'Published output of the classification pipeline on 23,433 held-out Galaxy Zoo 2 galaxies. Select a panel to inspect the original figure.',
        controls: 'galaxy',
        metrics: [
          { label: 'ROC–AUC', key: 'auc', cls: 'signal' },
          { label: 'PR–AUC', key: 'prauc', cls: 'verdigris' },
          { label: 'Macro-F1', key: 'f1', cls: 'amber' },
          { label: 'Test galaxies', key: 'n', cls: 'violet' }
        ]
      },
      pinn: {
        badge: 'Model output',
        title: 'Inverse PINN diagnostics',
        desc: 'Estimator behaviour of the exact-constraint PINN against the Cramér–Rao bound, and the 3D forward solve. Select a panel to inspect the original figure.',
        controls: 'pinn',
        metrics: [
          { label: 'Relative L² error', key: 'l2', cls: 'signal' },
          { label: 'Pseudo-experiments', key: 'nexp', cls: 'verdigris' },
          { label: 'UV scaling', key: 'uv', cls: 'amber' },
          { label: 'Dimensions', key: 'dims', cls: 'violet' }
        ]
      }
    };

    var GALAXY_FIGS = [
      { src: 'assets/img/figures/galaxy-roc-curve.png', caption: 'ROC curve on the held-out test set (AUC = 0.977 per panel).' },
      { src: 'assets/img/figures/galaxy-confusion-matrix.png', caption: 'Confusion matrix across morphological classes.' },
      { src: 'assets/img/figures/galaxy-per-class-metrics.png', caption: 'Per-class precision / recall / F1 breakdown.' }
    ];

    var PINN_FIGS = [
      { src: 'assets/img/figures/pinn-uv-divergence.png', caption: 'UV variance growth across 1D–3D with the one-loop correction applied.' },
      { src: 'assets/img/figures/pinn-bias-vs-weight.png', caption: 'Estimator bias versus loss weight, referenced to the Cramér–Rao bound.' },
      { src: 'assets/img/figures/pinn-3d-snapshots.png', caption: '3D heat-diffusion field from the exact-constraint PINN solve.' }
    ];

    /* ---- metric rendering ---- */
    function fmtE(v) { return (v / 1e6).toFixed(2) + ' MV/cm'; }
    function fmtAlpha(v) {
      var e = Math.log10(v);
      var m = Math.floor(e);
      return (v / Math.pow(10, m)).toFixed(2) + '×10' + supDigits(m) + ' cm⁻¹';
    }
    function supDigits(n) {
      var map = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
      return String(n).split('').map(function (c) { return map[c] || c; }).join('');
    }

    function setMetrics(values, target) {
      var wrap = typeof target === 'string' ? $(target) : (target || $('#labMetrics'));
      if (!wrap) return;
      var html = '';
      values.forEach(function (m) {
        html += '<div class="metric"><div class="metric__label">' + m.label + '</div>' +
          '<div class="metric__value metric__value--' + m.cls + '">' + m.value + '</div></div>';
      });
      wrap.innerHTML = html;
    }

    /* ---- chart drawing per module ---- */
    function ensureChart() {
      if (!chart) {
        var el = $('#labChart');
        if (!el) return null;
        chart = new Chart(el);
      }
      return chart;
    }

    function drawLgad() {
      if (!ensureChart()) return;
      var V = state.bias;
      var fl = state.fluence === 1;

      var e = peakField(V, fl);
      var a = luckyDrift(e);
      var g = gain(V, fl);
      var c = cce(V, fl);

      setMetrics([
        { label: 'Peak field', cls: 'signal', value: fmtE(e) },
        { label: 'Hole ionisation α_h', cls: 'amber', value: fmtAlpha(a) },
        { label: 'Internal gain M', cls: 'verdigris', value: g.toFixed(2) },
        { label: 'α-CCE', cls: 'violet', value: c.toFixed(1) + ' %' }
      ], '#labMetrics');

      var titleEl2 = $('#labChartTitle');
      var subEl = $('#labChartSub');

      if (state.lgadView === 'cv') {
        if (titleEl2) titleEl2.textContent = '1/C² — Mott–Schottky';
        if (subEl) subEl.textContent = fl ? '1×10¹⁴ n_eq/cm²' : 'Unirradiated';

        var pts = [];
        for (var v = 0; v <= 360; v += 3) {
          var val = mottSchottky(v);
          if (fl && v >= SIC.VPT) val = 0.72 + 0.06 * Math.sin(v / 14) * 0.2;
          if (fl && v < SIC.VPT) val = mottSchottky(v) * 0.86;
          pts.push([v, val]);
        }

        chart.draw({
          x: { min: 0, max: 360, label: 'bias V (V)' },
          y: { min: 0, max: 1.12, label: '1/C² (norm.)' },
          bands: [{ from: 0, to: SIC.VPT, color: 'rgba(56,189,248,0.05)' }],
          series: [{ points: pts, color: 'signal', fill: true, width: 2.1 }],
          annotations: [
            { x: SIC.VPT, y: 0.05, line: 'v', color: 'verdigris', text: 'V_pt = 75.5 V', align: 'left', dx: 6 },
            { x: V, y: mottSchottky(V), text: '◀ V', color: 'amber', align: 'left', dx: 6, dy: -11 }
          ],
          legend: [{ label: fl ? 'irradiated 1e14' : 'unirradiated', color: 'signal' }]
        });
      } else {
        if (titleEl2) titleEl2.textContent = 'Internal field profile — 50 µm epi';
        if (subEl) subEl.textContent = V + ' V · ' + (fl ? '1e14 n_eq/cm²' : 'unirradiated');

        var prof = fieldProfile(V, fl);
        var pts2 = prof.map(function (p) { return [p[0], p[1] / 1e6]; });

        chart.draw({
          x: { min: 0, max: 50, label: 'depth x (µm)' },
          y: { min: 0, max: 2.0, label: 'E (MV/cm)' },
          bands: [{ from: 0, to: 0.8, color: 'rgba(251,191,36,0.07)' }],
          series: [{ points: pts2, color: fl ? 'amber' : 'signal', fill: true, width: 2.1 }],
          annotations: [
            { x: 0.4, y: 1.9, text: 'gain layer', color: 'amber', align: 'left', dy: 0 },
            { x: 25, y: 0.14, text: 'E_peak = ' + (e / 1e6).toFixed(2) + ' MV/cm', color: 'muted', align: 'center' }
          ],
          legend: [{ label: fl ? 'after 1e14 proton-equivalent' : 'as-grown', color: fl ? 'amber' : 'signal' }]
        });
      }
    }

    function drawBurgers() {
      if (!ensureChart()) return;
      var nu = Math.pow(10, state.nuExp);
      var U = 1;
      var delta = (4 * nu) / U;

      if (state.burgersView === 'profile') {
        var pts = burgersProfile(nu, U, 420);
        var maxY = 1.15;
        var data = pts.map(function (p) { return [p[0], p[1]]; });

        chart.draw({
          x: { min: 0, max: 2 * Math.PI, label: 'x (rad)' },
          y: { min: -maxY, max: maxY, label: 'u(x)' },
          series: [{ points: data, color: 'signal', width: 2.1 }],
          annotations: [
            { x: Math.PI, y: -1.02, line: 'v', color: 'muted', text: 'x = π', align: 'center', dy: 12 },
            { x: Math.PI + 0.12, y: 0.78, text: 'δ = ' + delta.toFixed(3) + ' (4ν/U)', color: 'verdigris', align: 'left' }
          ],
          legend: [{ label: 'u = −U tanh(U(x−π)/2ν)', color: 'signal' }]
        });

        if ($('#labChartTitle')) $('#labChartTitle').textContent = 'Exact travelling shock';
        if ($('#labChartSub')) $('#labChartSub').textContent = 'ν = ' + nu.toExponential(1);

        setMetrics([
          { label: 'Shock thickness δ', cls: 'signal', value: delta.toFixed(4) },
          { label: 'Fit exponent', cls: 'verdigris', value: '0.985 (measured)' },
          { label: 'Spectral slope', cls: 'amber', value: '−2.03' },
          { label: 'Grid points', cls: 'violet', value: '1024 FFT' }
        ], '#labMetricsBurgers');
      } else {
        var spec = burgersSpectrum(nu, U, 1024);
        /* log–log least squares over the resolved inertial window */
        var xs = [], ys = [];
        var kMin = 2, kMax = Math.max(12, Math.round(0.35 / nu));
        spec.forEach(function (p) {
          if (p[0] >= kMin && p[0] <= kMax) { xs.push(Math.log10(p[0])); ys.push(Math.log10(p[1])); }
        });
        var slope = -2;
        if (xs.length > 4) {
          var n = xs.length;
          var sx = 0, sy = 0, sxy = 0, sxx = 0;
          for (var i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxy += xs[i] * ys[i]; sxx += xs[i] * xs[i]; }
          slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
        }

        var ymax = spec.length ? spec[0][1] * 2 : 1;
        var ymin = ymax * 1e-12;
        var data2 = spec
          .filter(function (p) { return p[1] > ymin && p[0] <= 512; })
          .map(function (p) { return [p[0], p[1]]; });

        chart.draw({
          x: { min: 1, max: 300, type: 'log', label: 'wavenumber k' },
          y: { min: ymin, max: ymax, type: 'log', label: 'E(k)' },
          series: [{ points: data2, color: 'signal', width: 1.8 }],
          annotations: [
            { x: 30, y: Math.pow(30, slope) * 0.55, text: 'slope = ' + slope.toFixed(2), color: 'amber', align: 'left' }
          ],
          legend: [{ label: 'live 1024-pt FFT of the tanh profile', color: 'signal' }]
        });

        if ($('#labChartTitle')) $('#labChartTitle').textContent = 'Energy spectrum — computed here';
        if ($('#labChartSub')) $('#labChartSub').textContent = 'ν = ' + nu.toExponential(1);

        setMetrics([
          { label: 'Shock thickness δ', cls: 'signal', value: delta.toFixed(4) },
          { label: 'Spectral slope', cls: 'amber', value: slope.toFixed(2) },
          { label: 'Fit exponent', cls: 'verdigris', value: '0.985 (measured)' },
          { label: 'Bins', cls: 'violet', value: '1024 → 512' }
        ], '#labMetricsBurgers');
      }
    }

    function drawFigureModule(figs, index) {
      var wrap = $('#labFigure');
      var fig = figs[index];
      if (wrap && fig) {
        wrap.innerHTML = '<img src="' + fig.src + '" alt="' + fig.caption.replace(/"/g, '&quot;') +
          '" loading="lazy" decoding="async"><span class="lab-figure__cap">' + fig.caption + '</span>';
      }
    }

    function render() {
      var meta = MODULES[module];
      if (badgeEl) badgeEl.textContent = meta.badge;
      if (titleEl) titleEl.textContent = meta.title;
      if (descEl) descEl.textContent = meta.desc;

      $$('[data-lab-module]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-lab-module') === module));
      });

      Object.keys(panels).forEach(function (k) {
        panels[k].hidden = k !== module;
      });

      var canvasWrap = $('#labCanvasWrap');
      var figWrap = $('#labFigure');

      if (module === 'lgad' || module === 'burgers') {
        if (canvasWrap) canvasWrap.hidden = false;
        if (figWrap) figWrap.hidden = true;
        var footReset = $('#labFootnote');
        if (footReset) {
          footReset.textContent = module === 'lgad'
            ? 'Analytic instrument calibrated to measured anchors of the SICAR study.'
            : 'Computed here: radix-2 FFT over the exact tanh shock — no server involved.';
        }
        ensureChart();
        if (module === 'lgad') drawLgad(); else drawBurgers();
      } else {
        if (canvasWrap) canvasWrap.hidden = true;
        if (figWrap) figWrap.hidden = false;
        var figureTitle = $('#labChartTitle');
        var figureSub = $('#labChartSub');
        if (figureTitle) {
          figureTitle.textContent = module === 'galaxy'
            ? 'Committed output — galaxy CNN'
            : 'Committed output — inverse PINN';
        }
        if (figureSub) {
          figureSub.textContent = module === 'galaxy' ? '23,433 test galaxies' : '4,000 pseudo-experiments';
        }
        var foot = $('#labFootnote');
        if (foot) {
          foot.textContent = module === 'galaxy'
            ? 'Figures reproduced from the Galaxy-Morphology-Classification repository.'
            : 'Figures reproduced from the Heat-Diffusion-PINNs repository.';
        }
        if (module === 'galaxy') drawFigureModule(GALAXY_FIGS, state.galaxyFig);
        else drawFigureModule(PINN_FIGS, state.pinnFig);
      }
    }

    function wire() {
      /* module tabs */
      $$('[data-lab-module]').forEach(function (b) {
        b.addEventListener('click', function () {
          module = b.getAttribute('data-lab-module');
          render();
        });
      });

      /* bias slider */
      var bias = $('#labBias');
      if (bias) {
        var syncBias = function () {
          state.bias = Number(bias.value);
          bias.style.setProperty('--fill', ((state.bias - 30) / (360 - 30)) * 100 + '%');
          var out = $('#labBiasOut');
          if (out) out.textContent = state.bias + ' V' + (state.bias > SIC.VPT ? ' · above V_pt' : ' · below V_pt');
          drawLgad();
        };
        bias.addEventListener('input', syncBias);
        syncBias();
      }

      /* fluence segment */
      $$('[data-fluence]').forEach(function (b) {
        b.addEventListener('click', function () {
          state.fluence = Number(b.getAttribute('data-fluence'));
          $$('[data-fluence]').forEach(function (o) {
            o.setAttribute('aria-pressed', String(o === b));
          });
          drawLgad();
        });
      });

      /* lgad view segment */
      $$('[data-lgad-view]').forEach(function (b) {
        b.addEventListener('click', function () {
          state.lgadView = b.getAttribute('data-lgad-view');
          $$('[data-lgad-view]').forEach(function (o) {
            o.setAttribute('aria-pressed', String(o === b));
          });
          drawLgad();
        });
      });

      /* viscosity slider */
      var nu = $('#labNu');
      if (nu) {
        var syncNu = function () {
          state.nuExp = Number(nu.value);
          nu.style.setProperty('--fill', ((state.nuExp + 3.5) / 2) * 100 + '%');
          var out = $('#labNuOut');
          if (out) out.textContent = 'ν = ' + Math.pow(10, state.nuExp).toExponential(1);
          drawBurgers();
        };
        nu.addEventListener('input', syncNu);
        syncNu();
      }

      /* burgers view segment */
      $$('[data-burgers-view]').forEach(function (b) {
        b.addEventListener('click', function () {
          state.burgersView = b.getAttribute('data-burgers-view');
          $$('[data-burgers-view]').forEach(function (o) {
            o.setAttribute('aria-pressed', String(o === b));
          });
          drawBurgers();
        });
      });

      /* figure tabs */
      $$('[data-galaxy-fig]').forEach(function (b) {
        b.addEventListener('click', function () {
          state.galaxyFig = Number(b.getAttribute('data-galaxy-fig'));
          $$('[data-galaxy-fig]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
          drawFigureModule(GALAXY_FIGS, state.galaxyFig);
        });
      });
      $$('[data-pinn-fig]').forEach(function (b) {
        b.addEventListener('click', function () {
          state.pinnFig = Number(b.getAttribute('data-pinn-fig'));
          $$('[data-pinn-fig]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
          drawFigureModule(PINN_FIGS, state.pinnFig);
        });
      });

      window.addEventListener('resize', throttle(function () {
        if (module === 'lgad') drawLgad();
        else if (module === 'burgers') drawBurgers();
      }, 140));

      document.addEventListener('themechange', function () {
        if (module === 'lgad') drawLgad();
        else if (module === 'burgers') drawBurgers();
      });
    }

    function init() {
      if (!$('#lab')) return;
      titleEl = $('#labModuleTitle');
      badgeEl = $('#labModuleBadge');
      descEl = $('#labModuleDesc');
      panels = {
        lgad: $('#labControlsLgad'),
        burgers: $('#labControlsBurgers'),
        galaxy: $('#labControlsGalaxy'),
        pinn: $('#labControlsPinn')
      };
      /* Deep-link: buttons across the page can pre-select a module */
      $$('[data-jump-lab]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          var target = b.getAttribute('data-jump-lab');
          if (MODULES[target]) {
            module = target;
            render();
            var lab = $('#lab');
            if (lab) {
              e.preventDefault();
              lab.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
            }
          }
        });
      });

      wire();
      render();
    }

    return { init: init };
  })();

  /* ======================================================================
     7b. COURSEWORK TABLE
     ====================================================================== */
  var Courses = (function () {
    var DATA = [
      { type: 'theory', name: 'Quantum Mechanics I &amp; II', tag: 'done' },
      { type: 'theory', name: 'Electromagnetism I &amp; II', tag: 'done' },
      { type: 'theory', name: 'Statistical Mechanics', tag: 'done' },
      { type: 'theory', name: 'Classical Mechanics I', tag: 'done' },
      { type: 'theory', name: 'Mathematical Methods I &amp; II', tag: 'done' },
      { type: 'theory', name: 'Linear Algebra', tag: 'done' },
      { type: 'lab', name: 'Modern Physics Lab', tag: 'lab' },
      { type: 'lab', name: 'Optics Lab', tag: 'lab' },
      { type: 'lab', name: 'General Physics Lab', tag: 'lab' },
      { type: 'lab', name: 'Electronics Lab', tag: 'lab' },
      { type: 'lab', name: 'Computational Physics Lab', tag: 'lab' },
      { type: 'next', name: 'Condensed Matter Physics', tag: 'next' },
      { type: 'next', name: 'Classical Mechanics II', tag: 'next' },
      { type: 'next', name: 'Atomic, Molecular &amp; Optical Physics', tag: 'next' },
      { type: 'next', name: 'Solid State Physics Lab', tag: 'next' },
      { type: 'next', name: 'Nuclear Physics Lab', tag: 'next' }
    ];

    var LABELS = { done: 'Completed', lab: 'Completed lab', next: 'Semester VI' };
    var grid;

    function render(filter) {
      if (!grid) return;
      var items = DATA.filter(function (c) { return filter === 'all' || c.type === filter; });
      grid.innerHTML = items.map(function (c) {
        return '<div class="course"><span class="course__name">' + c.name + '</span>' +
          '<span class="pill pill--' + c.tag + '">' + LABELS[c.tag] + '</span></div>';
      }).join('');
    }

    function init() {
      grid = $('#courseGrid');
      if (!grid) return;
      render('all');
      $$('[data-course-tab]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          $$('[data-course-tab]').forEach(function (o) {
            o.setAttribute('aria-selected', String(o === btn));
          });
          render(btn.getAttribute('data-course-tab'));
        });
      });
    }

    return { init: init };
  })();

  /* ======================================================================
     8. RESEARCH FILTERING & SEARCH
     ====================================================================== */
  var Research = (function () {
    var active = 'all';
    var query = '';
    var cards = [];
    var emptyEl;

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var cat = card.getAttribute('data-category');
        var hay = (card.getAttribute('data-search') || '').toLowerCase();
        var okCat = active === 'all' || cat === active;
        var okQ = !query || hay.indexOf(query) !== -1;
        var show = okCat && okQ;
        card.hidden = !show;
        if (show) shown++;
      });
      if (emptyEl) emptyEl.hidden = shown !== 0;
      var live = $('#researchCount');
      if (live) live.textContent = shown + ' of ' + cards.length + ' projects';
    }

    function init() {
      cards = $$('[data-project]');
      emptyEl = $('#researchEmpty');
      if (!cards.length) return;

      $$('[data-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          active = btn.getAttribute('data-filter');
          $$('[data-filter]').forEach(function (o) {
            o.setAttribute('aria-pressed', String(o === btn));
          });
          apply();
        });
      });

      var input = $('#researchSearch');
      if (input) {
        input.addEventListener('input', function () {
          query = input.value.trim().toLowerCase();
          apply();
        });
      }

      document.addEventListener('keydown', function (e) {
        if (e.key === '/' && document.activeElement !== input) {
          if (input && document.activeElement.tagName !== 'INPUT' && !Overlays.anyOpen()) {
            e.preventDefault();
            input.focus();
            input.select();
          }
        }
      });

      apply();
    }

    return { init: init };
  })();

  /* ======================================================================
     9. OVERLAYS
     ====================================================================== */
  var Overlays = (function () {
    var lastFocus = null;
    var openCount = 0;

    function open(el) {
      if (!el) return;
      lastFocus = document.activeElement;
      el.classList.add('is-open');
      el.setAttribute('aria-hidden', 'false');
      openCount++;
      document.body.style.overflow = 'hidden';
      var focusable = el.querySelector('input, button, a, [tabindex]');
      if (focusable) setTimeout(function () { focusable.focus({ preventScroll: true }); }, 60);
    }

    function close(el) {
      if (!el) return;
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }

    function closeAll() {
      $$('.overlay.is-open, .lightbox.is-open').forEach(function (el) {
        el.classList.remove('is-open');
        el.setAttribute('aria-hidden', 'true');
      });
      openCount = 0;
      document.body.style.overflow = '';
    }

    function anyOpen() {
      return $$('.overlay.is-open, .lightbox.is-open').length > 0;
    }

    /* ---- Toast ---- */
    var toastTimer = null;
    function toast(message) {
      var el = $('#toast');
      if (!el) return;
      var text = el.querySelector('[data-toast-text]');
      if (text) text.textContent = message;
      el.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
    }

    /* ---- clipboard ---- */
    function copy(text, message) {
      var done = function () { toast(message || 'Copied to clipboard'); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(function () { legacy(); });
      } else {
        legacy();
      }
      function legacy() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed — select manually'); }
        document.body.removeChild(ta);
      }
    }

    /* ---- Project sheet ---- */
    function openProject(id) {
      var spec = PROJECT_SPECS[id];
      if (!spec) return;
      var sheet = $('#projectSheet');
      if (!sheet) return;

      $('#projSheetEyebrow').textContent = spec.eyebrow;
      $('#projSheetTitle').textContent = spec.title;
      $('#projSheetSub').textContent = spec.sub;

      var metrics = spec.metrics.map(function (m) {
        return '<div class="spec__metric"><dt>' + m.k + '</dt><dd>' + m.v + '</dd></div>';
      }).join('');

      var method = spec.method.map(function (m) { return '<li>' + m + '</li>'; }).join('');
      var stack = spec.stack.map(function (s) { return '<span class="tag">' + s + '</span>'; }).join('');

      $('#projSheetBody').innerHTML =
        '<div class="spec">' +
          '<div class="spec__metrics">' + metrics + '</div>' +
          '<div class="spec__block"><h4>Method &amp; results</h4><ul class="spec__list">' + method + '</ul></div>' +
          '<div class="spec__block"><h4>Stack</h4><div class="tag-row">' + stack + '</div></div>' +
          '<div class="spec__block"><h4>Citation</h4>' +
            '<div class="code-block"><pre id="projCite">' + escapeHtml(spec.cite) + '</pre>' +
            '<button class="code-block__copy" type="button" data-copy-cite="' + id + '">' +
            icon('copy') + ' Copy</button></div>' +
          '</div>' +
        '</div>';

      open(sheet);
    }

    function escapeHtml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function icon(name) {
      var icons = {
        copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 12 5 5L20 6"/></svg>'
      };
      return icons[name] || '';
    }

    /* ---- Command palette ---- */
    var cmdItems = [];
    var cmdCursor = 0;

    function buildCommands() {
      var list = [
        { group: 'Navigate', label: 'Overview', hint: 'Home', action: function () { go('#top'); } },
        { group: 'Navigate', label: 'Research', hint: '5 projects', action: function () { go('#research'); } },
        { group: 'Navigate', label: 'Live lab', hint: 'Explore models', action: function () { go('#lab'); } },
        { group: 'Navigate', label: 'Experimental physics', hint: 'Lab bench', action: function () { go('#experimental'); } },
        { group: 'Navigate', label: 'Education & skills', hint: 'Coursework', action: function () { go('#academics'); } },
        { group: 'Navigate', label: 'Honors & fellowships', hint: 'Awards', action: function () { go('#honors'); } },
        { group: 'Navigate', label: 'Contact', hint: 'Email', action: function () { go('#contact'); } },
        { group: 'Lab modules', label: 'Open 4H-SiC LGAD instrument', hint: 'Detector', action: function () { moduleJump('lgad'); } },
        { group: 'Lab modules', label: 'Open Burgers spectral solver', hint: 'CFD', action: function () { moduleJump('burgers'); } },
        { group: 'Lab modules', label: 'Open galaxy CNN output', hint: 'SciML', action: function () { moduleJump('galaxy'); } },
        { group: 'Lab modules', label: 'Open inverse PINN diagnostics', hint: 'SciML', action: function () { moduleJump('pinn'); } },
        { group: 'Actions', label: 'Copy institutional email', hint: SITE.email, action: function () { copy(SITE.email, 'Email copied'); } },
        { group: 'Actions', label: 'Open full CV', hint: 'PDF', action: function () { openCv(); } },
        { group: 'Actions', label: 'Download CV (PDF)', hint: '12 pages', action: function () { window.open('CV_Aryan_Bandyopadhyay.pdf', '_blank', 'noopener'); } },
        { group: 'Actions', label: 'Toggle journal-paper theme', hint: 'Light / dark', action: function () { Theme.toggle(); } },
        { group: 'Actions', label: 'Print this page', hint: 'Clean layout', action: function () { window.print(); } },
        { group: 'Links', label: 'GitHub — @Aryans-lab', hint: 'github.com', action: function () { window.open('https://github.com/Aryans-lab', '_blank', 'noopener'); } },
        { group: 'Links', label: 'Burgers turbulence repository', hint: 'GitHub', action: function () { window.open('https://github.com/Aryans-lab/Computational_Physics_Lab/tree/main/project_burgulence', '_blank', 'noopener'); } },
        { group: 'Links', label: 'Galaxy morphology repository', hint: 'GitHub', action: function () { window.open('https://github.com/Aryans-lab/Galaxy-Morphology-Classification-using-CNNs', '_blank', 'noopener'); } },
        { group: 'Links', label: 'Heat diffusion PINN repository', hint: 'GitHub', action: function () { window.open('https://github.com/Aryans-lab/Heat-Diffusion-PINNs', '_blank', 'noopener'); } },
        { group: 'Links', label: 'Computational physics lab', hint: 'GitHub', action: function () { window.open('https://github.com/Aryans-lab/Computational_Physics_Lab', '_blank', 'noopener'); } }
      ];
      PROJECT_SPECS && Object.keys(PROJECT_SPECS).forEach(function (id) {
        list.splice(8, 0, {
          group: 'Projects',
          label: PROJECT_SPECS[id].title,
          hint: PROJECT_SPECS[id].eyebrow.split('·')[0].trim(),
          action: function () { openProject(id); }
        });
      });
      return list;
    }

    function go(hash) {
      var el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    }

    function moduleJump(id) {
      var tab = document.querySelector('[data-lab-module="' + id + '"]');
      if (tab) { tab.click(); go('#lab'); }
    }

    function renderCommands(filter) {
      var listEl = $('#cmdList');
      if (!listEl) return;
      var q = (filter || '').toLowerCase().trim();
      var filtered = cmdItems.filter(function (item) {
        return !q || (item.label + ' ' + item.hint + ' ' + item.group).toLowerCase().indexOf(q) !== -1;
      });
      cmdCursor = 0;
      if (!filtered.length) {
        listEl.innerHTML = '<div class="cmd__empty">No command matches “' + escapeHtml(filter) + '”.</div>';
        return;
      }
      var html = '';
      var lastGroup = '';
      filtered.forEach(function (item, i) {
        if (item.group !== lastGroup) {
          html += '<div class="cmd__group">' + item.group + '</div>';
          lastGroup = item.group;
        }
        html += '<button type="button" class="cmd__item' + (i === 0 ? ' is-cursor' : '') +
          '" data-cmd-index="' + i + '"><span class="cmd__item-text">' + item.label +
          '</span><span class="cmd__item-hint">' + item.hint + '</span></button>';
      });
      listEl.innerHTML = html;
      listEl._filtered = filtered;
    }

    function moveCursor(dir) {
      var items = $$('.cmd__item', $('#cmdList'));
      if (!items.length) return;
      cmdCursor = (cmdCursor + dir + items.length) % items.length;
      items.forEach(function (el, i) { el.classList.toggle('is-cursor', i === cmdCursor); });
      items[cmdCursor].scrollIntoView({ block: 'nearest' });
    }

    function runCursor() {
      var listEl = $('#cmdList');
      if (!listEl || !listEl._filtered) return;
      var item = listEl._filtered[cmdCursor];
      if (item) { close($('#cmdPalette')); setTimeout(item.action, 60); }
    }

    function openCmd() {
      renderCommands('');
      open($('#cmdPalette'));
      var input = $('#cmdInput');
      if (input) { input.value = ''; input.focus(); }
    }

    /* ---- CV ----
       Inline PDF rendering depends on the platform's PDF plugin (Chrome and
       Firefox desktop have one; many mobile browsers and embedded webviews do
       not). Detect it and swap in an honest download card when it is missing. */
    var pdfRenderable = (function () {
      var nav = navigator;
      if (nav.pdfViewerEnabled === false) return false;
      if (nav.pdfViewerEnabled === true) return true;
      var ua = nav.userAgent || '';
      var mobile = /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(ua);
      return !mobile;
    })();

    function openCv() {
      var sheet = $('#cvSheet');
      if (!sheet) return;
      var frame = $('#cvFrame');
      var fallback = $('#cvFallback');
      var body = sheet.querySelector('.sheet__body');

      if (frame && pdfRenderable && !frame.getAttribute('src')) {
        frame.setAttribute('src', 'CV_Aryan_Bandyopadhyay.pdf');
      }
      if (frame) frame.hidden = !pdfRenderable;
      if (fallback) fallback.hidden = !!pdfRenderable;
      if (body) body.classList.toggle('sheet__body--fallback', !pdfRenderable);

      open(sheet);
    }

    /* ---- lightbox ---- */
    function openLightbox(src, caption) {
      var lb = $('#lightbox');
      if (!lb) return;
      var img = $('#lightboxImg');
      var cap = $('#lightboxCap');
      if (img) img.src = src;
      if (cap) cap.textContent = caption || '';
      lb.classList.add('is-open');
      openCount++;
      document.body.style.overflow = 'hidden';
      lastFocus = document.activeElement;
    }

    function init() {
      /* generic data-overlay-open / close */
      document.addEventListener('click', function (e) {
        var opener = e.target.closest('[data-open-project]');
        if (opener) {
          e.preventDefault();
          openProject(opener.getAttribute('data-open-project'));
          return;
        }
        var cvBtn = e.target.closest('[data-open-cv]');
        if (cvBtn) { e.preventDefault(); openCv(); return; }

        var cmdBtn = e.target.closest('[data-open-cmd]');
        if (cmdBtn) { e.preventDefault(); openCmd(); return; }

        var closer = e.target.closest('[data-close]');
        if (closer) {
          e.preventDefault();
          var id = closer.getAttribute('data-close');
          var el = document.getElementById(id);
          if (el && el.classList.contains('lightbox')) {
            el.classList.remove('is-open');
            openCount = Math.max(0, openCount - 1);
            if (openCount === 0) document.body.style.overflow = '';
          } else {
            close(el);
          }
          return;
        }

        /* click the scrim to dismiss */
        if (e.target.classList && e.target.classList.contains('overlay')) {
          close(e.target);
        }
        if (e.target.classList && e.target.classList.contains('lightbox')) {
          e.target.classList.remove('is-open');
          openCount = Math.max(0, openCount - 1);
          if (openCount === 0) document.body.style.overflow = '';
        }

        var copyBtn = e.target.closest('[data-copy]');
        if (copyBtn) {
          e.preventDefault();
          copy(copyBtn.getAttribute('data-copy'), copyBtn.getAttribute('data-copy-msg') || 'Copied');
          return;
        }

        var citeBtn = e.target.closest('[data-copy-cite]');
        if (citeBtn) {
          var id2 = citeBtn.getAttribute('data-copy-cite');
          if (PROJECT_SPECS[id2]) copy(PROJECT_SPECS[id2].cite, 'BibTeX copied');
          return;
        }

        var figBtn = e.target.closest('[data-figure]');
        if (figBtn) {
          e.preventDefault();
          openLightbox(figBtn.getAttribute('data-figure'), figBtn.getAttribute('data-caption') || '');
        }
      });

      /* command palette wiring */
      var cmdInput = $('#cmdInput');
      if (cmdInput) {
        cmdInput.addEventListener('input', function () { renderCommands(cmdInput.value); });
        cmdInput.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowDown') { e.preventDefault(); moveCursor(1); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); moveCursor(-1); }
          else if (e.key === 'Enter') { e.preventDefault(); runCursor(); }
          else if (e.key === 'Escape') { close($('#cmdPalette')); }
        });
      }

      var cmdList = $('#cmdList');
      if (cmdList) {
        cmdList.addEventListener('click', function (e) {
          var item = e.target.closest('[data-cmd-index]');
          if (!item) return;
          var idx = Number(item.getAttribute('data-cmd-index'));
          var filtered = cmdList._filtered || [];
          if (filtered[idx]) { close($('#cmdPalette')); setTimeout(filtered[idx].action, 60); }
        });
      }

      document.addEventListener('keydown', function (e) {
        var mod = e.metaKey || e.ctrlKey;
        if (mod && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if ($('#cmdPalette').classList.contains('is-open')) close($('#cmdPalette'));
          else openCmd();
        }
        if (e.key === 'Escape') {
          if (anyOpen()) closeAll();
        }
      });

      /* print CV button */
      $$('[data-print-cv]').forEach(function (b) {
        b.addEventListener('click', function () {
          var frame = $('#cvFrame');
          try { frame.contentWindow.focus(); frame.contentWindow.print(); }
          catch (err) { window.open('CV_Aryan_Bandyopadhyay.pdf', '_blank', 'noopener'); }
        });
      });

      var cvFrameEl = $('#cvFrame');
      if (cvFrameEl) {
        cvFrameEl.addEventListener('load', function () {
          var fb = $('#cvFallback');
          var bodyEl = $('#cvSheet .sheet__body');
          /* A plugin-less browser paints the PDF as a download prompt, which
             never fires 'load' with usable content. If it does fire but the
             file 404s, surface the fallback as well. */
          if (fb && bodyEl && cvFrameEl.getAttribute('src')) {
            try {
              if (!cvFrameEl.contentDocument || cvFrameEl.contentDocument.body === null) {
                cvFrameEl.hidden = true;
                fb.hidden = false;
                bodyEl.classList.add('sheet__body--fallback');
              }
            } catch (e) { /* cross-origin PDF viewer — rendering is fine */ }
          }
        });
      }

      cmdItems = buildCommands();
    }

    return { init: init, openProject: openProject, openCv: openCv, openCmd: openCmd, toast: toast, copy: copy, anyOpen: anyOpen, openLightbox: openLightbox };
  })();

  /* ======================================================================
     10. SMALL AFFORDANCES
     ====================================================================== */
  var Bits = (function () {
    function clock() {
      var el = $('#clock');
      if (!el) return;
      var tick = function () {
        var now = new Date();
        var utc = now.toISOString().slice(11, 19);
        el.textContent = utc + ' UTC';
      };
      tick();
      setInterval(tick, 1000);
    }

    function year() {
      $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    }

    /* gracefully degrade a failed font or image */
    function imageFallbacks() {
      $$('img[data-fallback]').forEach(function (img) {
        img.addEventListener('error', function () {
          var parent = img.closest('figure, div');
          if (parent) parent.classList.add('is-missing');
        });
      });
    }

    function init() {
      clock();
      year();
      imageFallbacks();
    }
    return { init: init };
  })();

  /* ======================================================================
     BOOT
     ====================================================================== */
  function boot() {
    document.documentElement.classList.remove('no-js');
    Theme.init();
    Nav.init();
    Reveal.init();
    Hero.init();
    Lab.init();
    Courses.init();
    Research.init();
    Overlays.init();
    Bits.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
