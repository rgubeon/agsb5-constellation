// app.jsx — Constellation Wall fotomatón
const { useState, useRef, useEffect, useCallback } = React;

/* ---------------------------------------------------------------- tweaks */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "title": "Constellation Wall",
  "description": "Take a photo and add it to Airbus' international constellation of connections. When you're done, you'll be able to download this keepsake to your phone.",
  "accent": "#00AEC7",
  "nodeIntensity": "medium",
  "countdown": 3
}/*EDITMODE-END*/;

/* ---------------------------------------------------------------- styles */
const C = { navy: '#00205B', white: '#FFFFFF', cyan: '#00AEC7', steel: '#B7C9D3' };

// inject keyframes + base once
(function injectCSS() {
  if (document.getElementById('cw-anim')) return;
  const s = document.createElement('style');
  s.id = 'cw-anim';
  s.textContent = `
  @keyframes cwFadeUp { from { opacity:0; transform: translateY(22px); } to { opacity:1; transform:none; } }
  @keyframes cwFade { from { opacity:0; } to { opacity:1; } }
  @keyframes cwCount { 0%{ transform:scale(.55); opacity:0; } 22%{ transform:scale(1); opacity:1; } 78%{ transform:scale(1); opacity:1; } 100%{ transform:scale(1.5); opacity:0; } }
  @keyframes cwHalo { 0%{ transform:scale(.7); opacity:.0; } 30%{ opacity:.55; } 100%{ transform:scale(2.4); opacity:0; } }
  @keyframes cwStarFloat { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-12px); } }
  @keyframes cwGlow { 0%,100%{ opacity:.45; } 50%{ opacity:.9; } }
  @keyframes cwTwinkle { 0%,100%{ opacity:.06; transform:scale(.6); } 50%{ opacity:1; transform:scale(1); } }
  @keyframes cwFlash { 0%{ opacity:0; } 12%{ opacity:.85; } 100%{ opacity:0; } }
  @keyframes cwOrbRise {
    0%   { transform: translate(-50%,-50%) scale(.2); opacity:0; }
    14%  { transform: translate(-50%,-50%) scale(1.15); opacity:1; }
    32%  { transform: translate(-50%,-50%) scale(.9); opacity:1; }
    100% { transform: translate(-50%,-1240px) scale(.18); opacity:0; }
  }
  @keyframes cwTrail {
    0%   { transform: translate(-50%,-50%) scaleY(0); opacity:0; }
    30%  { opacity:.9; }
    100% { transform: translate(-50%,-50%) scaleY(1) translateY(-560px); opacity:0; }
  }
  @keyframes cwSpark {
    0%   { transform: translate(-50%,-50%); opacity:0; }
    15%  { opacity:1; }
    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))); opacity:0; }
  }
  @keyframes cwSpin { to { transform: rotate(360deg); } }
  @keyframes cwScreenIn { from { opacity:0; transform: scale(1.012); } to { opacity:1; transform:none; } }
  @keyframes cwScreenOut { from { opacity:1; } to { opacity:0; } }
  @media (prefers-reduced-motion: reduce){ *{ animation-duration:.001ms !important; } }
  `;
  document.head.appendChild(s);
})();

/* ------------------------------------------------------------- brand bits */
function StarLogo({ height = 110, float = false }) {
  return (
    <img src="assets/star-logo.png" alt="Best in Us"
      style={{ height, width: 'auto', display: 'block',
        filter: 'drop-shadow(0 0 24px rgba(0,174,199,.45))',
        animation: float ? 'cwStarFloat 6s ease-in-out infinite' : 'none' }} />
  );
}

function Wordmark({ height = 28, opacity = 0.92 }) {
  return (
    <img src="assets/airbus-wordmark.svg" alt="Airbus"
      style={{ height, width: 'auto', display: 'block', opacity }} />
  );
}

/* --------------------------------------------------- ambient light nodes */
// Faint nodes of light glowing softly around the screen across every screen
// of the activation, evoking the wider constellation behind the kiosk.
function AmbientNodes({ accent = C.cyan, count = 30 }) {
  const nodes = React.useMemo(() => Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    sz: 2 + Math.random() * 5,
    dur: 3.5 + Math.random() * 5.5,
    delay: Math.random() * 6,
  })), [count]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {nodes.map((n, i) => (
        <div key={i} style={{
          position: 'absolute', left: n.x + '%', top: n.y + '%',
          width: n.sz, height: n.sz, borderRadius: '50%',
          background: i % 5 === 0 ? '#fff' : accent,
          boxShadow: `0 0 ${n.sz * 3.2}px ${n.sz * 0.9}px ${accent}`,
          animation: `cwTwinkle ${n.dur}s ease-in-out ${n.delay}s infinite` }} />
      ))}
    </div>
  );
}

function Button({ children, onClick, variant = 'primary', accent, big = false, style, disabled = false }) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const on = hover && !disabled;
  const base = {
    fontFamily: 'Inter Tight, sans-serif',
    fontWeight: 700,
    fontSize: big ? 40 : 34,
    letterSpacing: '.01em',
    padding: big ? '34px 80px' : '26px 58px',
    borderRadius: 999,
    cursor: disabled ? 'default' : 'pointer',
    border: '2px solid transparent',
    transition: 'transform .12s ease, box-shadow .2s ease, background .2s ease, color .2s ease',
    transform: disabled ? 'none' : (press ? 'scale(.97)' : on ? 'scale(1.025)' : 'scale(1)'),
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 16,
    width: '100%',
    userSelect: 'none', WebkitTapHighlightColor: 'transparent',
    ...style,
  };
  const variants = {
    primary: {
      background: accent, color: C.navy,
      boxShadow: hover ? `0 18px 50px ${accent}66` : `0 10px 34px ${accent}44`,
    },
    secondary: {
      background: hover ? 'rgba(255,255,255,.08)' : 'transparent',
      color: C.white, borderColor: 'rgba(255,255,255,.55)',
    },
    ghost: {
      background: 'transparent', color: C.steel,
      borderColor: 'rgba(183,201,211,.35)', fontSize: big ? 36 : 30,
    },
    white: {
      background: C.white, color: C.navy,
      boxShadow: hover ? '0 18px 50px rgba(255,255,255,.22)' : '0 10px 30px rgba(0,0,0,.28)',
    },
    outline: {
      background: hover ? 'rgba(255,255,255,.10)' : 'transparent',
      color: C.white, borderColor: C.white,
    },
    disabled: {
      background: 'transparent', color: C.cyan,
      borderColor: C.cyan, boxShadow: 'none',
    },
  };
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      onMouseEnter={() => !disabled && setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => !disabled && setPress(true)} onMouseUp={() => setPress(false)}
      style={{ ...base, ...(disabled ? variants.disabled : variants[variant]) }}>
      {children}
    </button>
  );
}

/* ----------------------------------------------------------- QR rendering */
function QRCode({ text, size = 460 }) {
  const modules = React.useMemo(() => {
    try {
      const qr = qrcode(0, 'M');
      qr.addData(text);
      qr.make();
      const n = qr.getModuleCount();
      const arr = [];
      for (let r = 0; r < n; r++) for (let c2 = 0; c2 < n; c2++) if (qr.isDark(r, c2)) arr.push([c2, r]);
      return { n, dots: arr };
    } catch (e) { return null; }
  }, [text]);
  if (!modules) return null;
  const { n, dots } = modules;
  const cell = size / n;
  const r = cell * 0.42;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {dots.map(([x, y], i) => (
        <rect key={i} x={x * cell + (cell / 2 - r)} y={y * cell + (cell / 2 - r)}
          width={r * 2} height={r * 2} rx={r * 0.55} fill={C.navy} />
      ))}
    </svg>
  );
}

/* --------------------------------------------------------- node animation */
function NodeFlash({ photo, intensity, accent, onDone,
  sendingLabel = 'Sending your node to the map…',
  successTitle = 'Image sent successfully!',
  successSubtitle = 'Look up at the constellation to find your node',
  doneLabel = 'Download keepsake' }) {
  const [phase, setPhase] = useState('fly'); // fly | sent
  const counts = { subtle: 8, medium: 16, intense: 30 };
  const glow = { subtle: 30, medium: 52, intense: 80 };
  const n = counts[intensity] || 16;
  const sparks = React.useMemo(() => Array.from({ length: n }, (_, i) => {
    const ang = (Math.PI * 2 * i) / n + (Math.random() - 0.5);
    const dist = 120 + Math.random() * 320;
    return {
      dx: Math.cos(ang) * dist,
      dy: Math.sin(ang) * dist - 260,
      delay: Math.random() * 0.35,
      dur: 1.1 + Math.random() * 0.9,
      sz: 5 + Math.random() * 9,
    };
  }), [n]);

  // After the node flies up to the wall, reveal the success message.
  useEffect(() => {
    const t = setTimeout(() => setPhase('sent'), 2350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, overflow: 'hidden',
      background: 'radial-gradient(120% 90% at 50% 50%, rgba(0,28,80,.82), rgba(0,11,34,.985))',
      backdropFilter: 'blur(16px) saturate(120%)', WebkitBackdropFilter: 'blur(16px) saturate(120%)',
      animation: 'cwFade .35s ease' }}>

      {phase === 'fly' && (
        <React.Fragment>
          {/* fading shrinking photo memory */}
          {photo && (
            <img src={photo} alt="" style={{
              position: 'absolute', left: '50%', top: '46%', width: 560, height: 746,
              objectFit: 'cover', borderRadius: 36, transform: 'translate(-50%,-50%)',
              opacity: 0, animation: 'cwFlash 1s ease forwards',
              boxShadow: `0 0 90px ${accent}` }} />
          )}
          {/* central flash halo */}
          <div style={{ position: 'absolute', left: '50%', top: '46%', width: 520, height: 520,
            marginLeft: -260, marginTop: -260, borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}cc, transparent 62%)`,
            animation: 'cwHalo 1.4s ease-out forwards' }} />
          {/* light trail */}
          <div style={{ position: 'absolute', left: '50%', top: '46%', width: 10, height: 620,
            marginLeft: -5, transformOrigin: 'center bottom', borderRadius: 10,
            background: `linear-gradient(to top, ${accent}, transparent)`,
            filter: 'blur(2px)', animation: 'cwTrail 1.9s cubic-bezier(.5,0,.2,1) .35s forwards' }} />
          {/* the rising orb */}
          <div style={{ position: 'absolute', left: '50%', top: '46%', width: 70, height: 70,
            borderRadius: '50%', background: `radial-gradient(circle, #fff, ${accent} 60%)`,
            boxShadow: `0 0 ${glow[intensity] || 52}px ${glow[intensity] || 52}px ${accent}99`,
            animation: 'cwOrbRise 2s cubic-bezier(.45,0,.15,1) .3s forwards' }} />
          {/* sparks */}
          {sparks.map((s, i) => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '46%', width: s.sz, height: s.sz,
              borderRadius: '50%', background: i % 3 === 0 ? '#fff' : accent,
              boxShadow: `0 0 14px ${accent}`,
              '--dx': s.dx + 'px', '--dy': s.dy + 'px',
              animation: `cwSpark ${s.dur}s ease-out ${s.delay}s forwards`,
            }} />
          ))}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center',
            color: C.white, fontSize: 34, fontWeight: 300, letterSpacing: '.04em',
            opacity: 0, animation: 'cwFade .6s ease 1s forwards' }}>
            {sendingLabel}
          </div>
        </React.Fragment>
      )}

      {phase === 'sent' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '0 110px', textAlign: 'center',
          animation: 'cwFadeUp .7s cubic-bezier(.2,.7,.2,1)' }}>
          {/* soft glow + floating star */}
          <div style={{ position: 'absolute', top: '34%', width: 560, height: 560,
            borderRadius: '50%', pointerEvents: 'none',
            background: `radial-gradient(circle, ${accent}33, transparent 64%)`,
            animation: 'cwGlow 3.4s ease-in-out infinite' }} />
          <StarLogo height={150} float />
          <h2 style={{ color: C.white, fontWeight: 700, fontSize: 78, lineHeight: 1.05,
            letterSpacing: '-.02em', marginTop: 48, textWrap: 'balance' }}>
            {successTitle}
          </h2>
          <p style={{ color: C.steel, fontWeight: 300, fontSize: 40, lineHeight: 1.45,
            maxWidth: 780, marginTop: 28, textWrap: 'pretty' }}>
            {successSubtitle}
          </p>
          <div style={{ marginTop: 70, width: 600 }}>
            <Button variant="white" big onClick={onDone}>{doneLabel}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

window.CW = { useState, useRef, useEffect, useCallback, TWEAK_DEFAULTS, C, StarLogo, Wordmark, AmbientNodes, Button, QRCode, NodeFlash };
