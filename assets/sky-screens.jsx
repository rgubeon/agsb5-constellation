// sky-screens.jsx — Sky Network Constellation (form-based activation)
const { useState, useRef, useEffect, useCallback } = React;
const { C, StarLogo, Wordmark, AmbientNodes, Button, QRCode, NodeFlash } = window.CW;

const PAD = 90;
// Homogeneous button widths across the whole app
const BTN_W = 520;   // primary CTAs
const BTN_W2 = 300;  // secondary actions (smaller, sit below primary)

/* ----------------------------------------------------------- sky tweaks */
const SKY_DEFAULTS = /*EDITMODE-BEGIN*/{
  "title": "Sky Network Constellation",
  "description": "Add yourself to Airbus' international constellation. Share who you are and your best memory at AGBS — your node will join the wall above you.",
  "accent": "#00AEC7",
  "nodeIntensity": "medium"
}/*EDITMODE-END*/;

/* ---------------------------------------------------------- country list */
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Bahrain','Bangladesh',
  'Belgium','Bolivia','Bosnia and Herzegovina','Brazil','Bulgaria','Cambodia','Cameroon','Canada',
  'Chile','China','Colombia','Costa Rica','Croatia','Cuba','Cyprus','Czechia','Denmark','Ecuador',
  'Egypt','El Salvador','Estonia','Ethiopia','Finland','France','Georgia','Germany','Ghana','Greece',
  'Guatemala','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel',
  'Italy','Ivory Coast','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Latvia','Lebanon','Lithuania',
  'Luxembourg','Malaysia','Malta','Mexico','Moldova','Morocco','Nepal','Netherlands','New Zealand',
  'Nigeria','North Macedonia','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines',
  'Poland','Portugal','Qatar','Romania','Russia','Saudi Arabia','Senegal','Serbia','Singapore',
  'Slovakia','Slovenia','South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland',
  'Syria','Taiwan','Thailand','Tunisia','Turkey','Ukraine','United Arab Emirates','United Kingdom',
  'United States','Uruguay','Venezuela','Vietnam',
];

/* ---------------------------------------------------- form field styling */
(function injectFormCSS() {
  if (document.getElementById('sky-form-css')) return;
  const s = document.createElement('style');
  s.id = 'sky-form-css';
  s.textContent = `
    .sky-field{
      width:100%; padding:0 28px; height:92px; font-size:32px; font-weight:400;
      font-family:'Inter Tight',sans-serif; color:#fff;
      background:rgba(255,255,255,.06);
      border:2px solid rgba(183,201,211,.26); border-radius:24px;
      outline:none; transition:border .2s ease, box-shadow .2s ease, background .2s ease;
    }
    .sky-field::placeholder{ color:rgba(183,201,211,.5); }
    .sky-field:focus{ background:rgba(255,255,255,.09); }
    select.sky-field{
      appearance:none; -webkit-appearance:none; cursor:pointer; color:#fff;
      background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='14' viewBox='0 0 22 14'><path fill='%2300AEC7' d='M0 0h22L11 14z'/></svg>");
      background-repeat:no-repeat; background-position:right 28px center;
      padding:0 60px 0 28px;
    }
    select.sky-field option{ background:#011233; color:#fff; }
    select.sky-field.placeholder{ color:rgba(183,201,211,.5); }
    textarea.sky-field{
      height:auto; min-height:210px; padding:24px 32px; line-height:1.45;
      resize:none; font-weight:300;
    }
    .sky-field::-webkit-scrollbar{ width:8px; }
    .sky-field::-webkit-scrollbar-thumb{ background:rgba(183,201,211,.3); border-radius:4px; }
  `;
  document.head.appendChild(s);
})();

/* ----------------------------------------------------------------- frame */
function Frame({ children, footer = true, accent = C.cyan }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <img src="assets/fondo.png" alt="" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(130% 80% at 50% 18%, rgba(0,32,91,.10), rgba(0,16,46,.78))' }} />
      <AmbientNodes accent={accent} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      {footer && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 64,
          display: 'flex', justifyContent: 'center' }}>
          <Wordmark height={44} />
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- start screen */
function StartScreen({ tweak, accent, sent, onStart, onReset }) {
  return (
    <Frame accent={accent}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: `0 ${PAD}px`, textAlign: 'center' }}>
        <StarLogo height={240} float />
        <h1 style={{ color: C.white, fontWeight: 700, fontSize: 100, lineHeight: 1.0,
          letterSpacing: '-.02em', marginTop: 36, textWrap: 'balance' }}>
          {tweak.title}
        </h1>
        <p style={{ color: C.steel, fontWeight: 300, fontSize: 35, lineHeight: 1.5,
          maxWidth: 780, marginTop: 22, textWrap: 'pretty' }}>
          {tweak.description}
        </p>

        {sent && (
          <div style={{ marginTop: 52, display: 'inline-flex', alignItems: 'center', gap: 16,
            padding: '18px 34px', borderRadius: 999, background: `${accent}1f`,
            border: `1.5px solid ${accent}80`, color: C.white, fontSize: 30, fontWeight: 400 }}>
            <span style={{ fontSize: 30 }}>✦</span>
            Your node now shines in the constellation
          </div>
        )}

        <div style={{ marginTop: 52, width: BTN_W }}>
          {sent
            ? <Button accent={accent} big onClick={onReset}>Home</Button>
            : <Button accent={accent} big onClick={onStart}>Start</Button>}
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------ form screen */
function CountrySelect({ value, onChange, accent, placeholder }) {
  const [focus, setFocus] = useState(false);
  return (
    <select
      className={'sky-field' + (value ? '' : ' placeholder')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={focus ? { borderColor: accent, boxShadow: `0 0 0 4px ${accent}22, 0 0 36px ${accent}22` } : null}>
      <option value="">{placeholder}</option>
      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}

function TextField({ value, onChange, accent, placeholder, maxLength, multiline }) {
  const [focus, setFocus] = useState(false);
  const fstyle = focus ? { borderColor: accent, boxShadow: `0 0 0 4px ${accent}22, 0 0 36px ${accent}22` } : null;
  const common = {
    value, maxLength, placeholder,
    onChange: (e) => onChange(e.target.value),
    onFocus: () => setFocus(true), onBlur: () => setFocus(false),
    className: 'sky-field', style: fstyle,
  };
  return multiline ? <textarea rows={3} {...common} /> : <input type="text" {...common} />;
}

function FieldGroup({ label, children, hint }) {
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 14 }}>
        <span style={{ color: C.steel, fontSize: 23, fontWeight: 400, letterSpacing: '.14em',
          textTransform: 'uppercase' }}>{label}</span>
        {hint}
      </div>
      {children}
    </div>
  );
}

const MEMORY_MAX = 200;

function FormScreen({ accent, data, onChange, onContinue, onCancel }) {
  const set = (k) => (v) => onChange({ ...data, [k]: v });
  const memLeft = MEMORY_MAX - data.memory.length;
  const valid = data.name.trim() && data.birth && data.base && data.memory.trim().length >= 3;

  return (
    <Frame accent={accent}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: `0 ${PAD}px` }}>
        <StarLogo height={108} />
        <h1 style={{ color: C.white, fontWeight: 700, fontSize: 60, lineHeight: 1.04,
          letterSpacing: '-.02em', marginTop: 36, textAlign: 'center', textWrap: 'balance' }}>
          Add yourself to the map
        </h1>
        <p style={{ color: C.steel, fontWeight: 300, fontSize: 30, marginTop: 22,
          textAlign: 'center' }}>
          Tell us who you are — it takes a moment.
        </p>

        <div style={{ width: 660, marginTop: 52, display: 'flex', flexDirection: 'column', gap: 30 }}>
          <FieldGroup label="Name">
            <TextField value={data.name} onChange={set('name')} accent={accent}
              placeholder="Your name" maxLength={40} />
          </FieldGroup>

          <FieldGroup label="Country of birth">
            <CountrySelect value={data.birth} onChange={set('birth')} accent={accent}
              placeholder="Select a country" />
          </FieldGroup>

          <FieldGroup label="Work base">
            <CountrySelect value={data.base} onChange={set('base')} accent={accent}
              placeholder="Select a country" />
          </FieldGroup>

          <FieldGroup label="What's your best memory at AGBS?"
            hint={<span style={{ color: memLeft <= 20 ? accent : 'rgba(183,201,211,.55)',
              fontSize: 24, fontWeight: 400, fontVariantNumeric: 'tabular-nums' }}>
              {data.memory.length}/{MEMORY_MAX}</span>}>
            <TextField value={data.memory} onChange={set('memory')} accent={accent}
              placeholder="Share the moment you'll always remember…" maxLength={MEMORY_MAX} multiline />
          </FieldGroup>
        </div>

        <div style={{ width: 660, marginTop: 52, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 22 }}>
          <div style={{ width: BTN_W }}>
            <Button accent={accent} big onClick={onContinue} disabled={!valid}>
              <span>Continue</span>
              <span style={{ fontSize: 30 }}>→</span>
            </Button>
          </div>
          <div style={{ width: BTN_W2 }}>
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ---------------------------------------------------------- review screen */
function ReviewScreen({ accent, data, sent, onSend, onRewrite }) {
  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ color: 'rgba(183,201,211,.6)', fontSize: 23, fontWeight: 400,
        letterSpacing: '.16em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ color: C.white, fontSize: 40, fontWeight: 400 }}>{value}</span>
    </div>
  );

  return (
    <Frame accent={accent}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: `90px ${PAD}px 0` }}>
        <div style={{ color: C.steel, fontSize: 28, fontWeight: 300, letterSpacing: '.2em',
          textTransform: 'uppercase' }}>
          Review your node
        </div>

        {/* node card */}
        <div style={{ width: 820, marginTop: 52, padding: '60px 60px 64px',
          borderRadius: 44, position: 'relative',
          background: 'linear-gradient(160deg, rgba(0,52,120,.55), rgba(0,16,46,.72))',
          border: `2px solid ${accent}66`,
          boxShadow: `0 30px 80px rgba(0,0,0,.5), 0 0 60px ${accent}33, inset 0 1px 0 rgba(255,255,255,.08)` }}>
          {/* node mark */}
          <div style={{ position: 'absolute', top: 44, right: 56, width: 26, height: 26,
            borderRadius: '50%', background: `radial-gradient(circle, #fff, ${accent} 60%)`,
            boxShadow: `0 0 26px 6px ${accent}aa` }} />

          <div style={{ color: 'rgba(183,201,211,.6)', fontSize: 23, fontWeight: 400,
            letterSpacing: '.16em', textTransform: 'uppercase' }}>Name</div>
          <div style={{ color: C.white, fontSize: 70, fontWeight: 700, lineHeight: 1.05,
            letterSpacing: '-.02em', marginTop: 8, textWrap: 'balance' }}>{data.name}</div>

          <div style={{ display: 'flex', gap: 64, marginTop: 40 }}>
            <Row label="Born in" value={data.birth} />
            <Row label="Based in" value={data.base} />
          </div>

          <div style={{ height: 2, background: `linear-gradient(to right, ${accent}66, transparent)`,
            margin: '44px 0 36px' }} />

          <div style={{ color: 'rgba(183,201,211,.6)', fontSize: 23, fontWeight: 400,
            letterSpacing: '.16em', textTransform: 'uppercase' }}>Best memory at AGBS</div>
          <div style={{ color: C.white, fontSize: 40, fontWeight: 300, fontStyle: 'italic',
            lineHeight: 1.42, marginTop: 14, textWrap: 'pretty' }}>“{data.memory}”</div>
        </div>

        <div style={{ width: 820, marginTop: 52, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 22 }}>
          <div style={{ width: BTN_W }}>
            <Button accent={accent} big onClick={onSend} disabled={sent}>
              {sent ? <span>You've already sent your node</span> : (
                <React.Fragment>
                  <span>Send to the map</span>
                  <span style={{ fontSize: 30 }}>✦</span>
                </React.Fragment>
              )}
            </Button>
          </div>
          {!sent && (
            <div style={{ width: BTN_W2 }}>
              <Button variant="outline" onClick={onRewrite}>Rewrite</Button>
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
}

/* -------------------------------------------------------- download screen */
function DownloadScreen({ accent, keepsake, name, onHome }) {
  const handleDownload = useCallback(() => {
    if (!keepsake) return;
    const a = document.createElement('a');
    a.href = keepsake;
    const safe = (name || 'constellation').trim().replace(/\s+/g, '-').toLowerCase() || 'constellation';
    a.download = `airbus-${safe}-constellation-card.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [keepsake, name]);

  return (
    <Frame accent={accent}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: `0 ${PAD}px`, textAlign: 'center' }}>
        <h2 style={{ color: C.white, fontWeight: 700, fontSize: 70, marginTop: 0,
          letterSpacing: '-.02em', textWrap: 'balance' }}>
          Take your keepsake
        </h2>
        <p style={{ color: C.steel, fontSize: 33, fontWeight: 300, marginTop: 22, maxWidth: 720,
          lineHeight: 1.5 }}>
          Here's your constellation card — download it to keep it on your device.
        </p>
        {keepsake && (
          <img src={keepsake} alt="Your constellation card"
            style={{ width: 640, marginTop: 52, borderRadius: 28, display: 'block',
              boxShadow: `0 30px 80px rgba(0,0,0,.5), 0 0 0 6px ${accent}33` }} />
        )}
        <div style={{ marginTop: 52, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 22 }}>
          <div style={{ width: BTN_W }}>
            <Button accent={accent} big onClick={handleDownload}>
              <span>Download</span>
              <span style={{ fontSize: 30 }}>↓</span>
            </Button>
          </div>
          <div style={{ width: BTN_W2 }}>
            <Button variant="secondary" onClick={onHome}>Home</Button>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ----------------------------------------------------- keepsake card gen */
function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function makeKeepsakeCard(data, accent, logo, brand) {
  const W = 900, H = 1200;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  // background
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#063a78'); g.addColorStop(0.55, '#01225c'); g.addColorStop(1, '#00102e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // faint nodes
  for (let i = 0; i < 42; i++) {
    const x = Math.random() * W, y = Math.random() * H, r = 1 + Math.random() * 3;
    ctx.globalAlpha = 0.15 + Math.random() * 0.4;
    ctx.fillStyle = i % 5 === 0 ? '#ffffff' : accent;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // border
  ctx.strokeStyle = accent; ctx.globalAlpha = 0.5; ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, W - 56, H - 56); ctx.globalAlpha = 1;

  ctx.textAlign = 'center';

  // --- fixed zones: star logo at top, Airbus wordmark at bottom ---
  const logoTop = 120, logoH = 150;
  if (logo && logo.complete && logo.naturalWidth) {
    const lw = logo.naturalWidth * (logoH / logo.naturalHeight);
    ctx.drawImage(logo, W / 2 - lw / 2, logoTop, lw, logoH);
  } else {
    ctx.fillStyle = accent; ctx.beginPath();
    ctx.arc(W / 2, logoTop + logoH / 2, 60, 0, Math.PI * 2); ctx.fill();
  }
  const logoBottom = logoTop + logoH;

  // Airbus wordmark (real logo), centered above the bottom edge
  const brandH = 40, brandRatio = 131.88 / 25.11;
  const brandW = brandH * brandRatio;
  const brandTop = H - 110;
  if (brand && brand.complete) {
    ctx.globalAlpha = 0.92;
    ctx.drawImage(brand, W / 2 - brandW / 2, brandTop, brandW, brandH);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = 'rgba(183,201,211,.7)'; ctx.font = '400 28px "Inter Tight", sans-serif';
    ctx.fillText('AIRBUS', W / 2, brandTop + brandH - 4);
  }

  // --- measure the text block so it can be centered between logo and wordmark ---
  ctx.font = '700 76px "Inter Tight", sans-serif';
  const nameLines = wrapText(ctx, data.name, W - 160).slice(0, 2);
  ctx.font = 'italic 300 40px "Inter Tight", sans-serif';
  const memLines = wrapText(ctx, `“${data.memory}”`, W - 200).slice(0, 6);

  const LABEL_H = 30, GAP_LABEL = 50, NAME_LH = 86, GAP_NAME = 26,
        LOC_H = 40, GAP_LOC = 42, DIV_H = 2, GAP_DIV = 44, MEM_LH = 56;
  const blockH = LABEL_H + GAP_LABEL
    + nameLines.length * NAME_LH + GAP_NAME
    + LOC_H + GAP_LOC + DIV_H + GAP_DIV
    + memLines.length * MEM_LH;

  const regionTop = logoBottom + 30, regionBottom = brandTop - 30;
  let y = (regionTop + regionBottom) / 2 - blockH / 2;
  ctx.textBaseline = 'top';

  // label
  ctx.fillStyle = accent; ctx.font = '500 26px "Inter Tight", sans-serif';
  ctx.fillText('S K Y   N E T W O R K   C O N S T E L L A T I O N', W / 2, y);
  y += LABEL_H + GAP_LABEL;

  // name
  ctx.fillStyle = '#ffffff'; ctx.font = '700 76px "Inter Tight", sans-serif';
  nameLines.forEach((l) => { ctx.fillText(l, W / 2, y); y += NAME_LH; });
  y += GAP_NAME;

  // location
  ctx.fillStyle = '#B7C9D3'; ctx.font = '300 34px "Inter Tight", sans-serif';
  ctx.fillText(`Born in ${data.birth}  ·  Based in ${data.base}`, W / 2, y);
  y += LOC_H + GAP_LOC;

  // divider
  ctx.strokeStyle = accent; ctx.globalAlpha = 0.45; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2 - 150, y); ctx.lineTo(W / 2 + 150, y); ctx.stroke();
  ctx.globalAlpha = 1;
  y += DIV_H + GAP_DIV;

  // memory
  ctx.fillStyle = '#ffffff'; ctx.font = 'italic 300 40px "Inter Tight", sans-serif';
  memLines.forEach((l) => { ctx.fillText(l, W / 2, y); y += MEM_LH; });

  ctx.textBaseline = 'alphabetic';
  return cv.toDataURL('image/jpeg', 0.92);
}

/* ------------------------------------------------------------------- App */
function makeToken() {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

const EMPTY_FORM = { name: '', birth: '', base: '', memory: '' };
const SAMPLE_FORM = {
  name: 'Alex Rivera', birth: 'Spain', base: 'Germany',
  memory: 'The night the whole cohort stayed late to finish the prototype — and it actually flew.',
};

const SCREEN_FADE_MS = 560;
function useScreenTransition(initial) {
  const [state, setState] = useState({ cur: initial, prev: null });
  const go = useCallback((next) => {
    setState((s) => (s.cur === next ? s : { cur: next, prev: s.cur }));
  }, []);
  useEffect(() => {
    if (state.prev == null) return;
    const id = setTimeout(() => setState((s) => ({ cur: s.cur, prev: null })), SCREEN_FADE_MS);
    return () => clearTimeout(id);
  }, [state.prev, state.cur]);
  return [state.cur, state.prev, go];
}

function App() {
  const [t, setTweak] = useTweaks(SKY_DEFAULTS);
  const [screen, prevScreen, go] = useScreenTransition('start'); // start | form | review | download
  const [form, setForm] = useState(EMPTY_FORM);
  const [keepsake, setKeepsake] = useState(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [token] = useState(makeToken);
  const logoRef = useRef(null);
  const brandRef = useRef(null);

  // preload the logos so keepsake generation stays synchronous
  useEffect(() => {
    const img = new Image();
    img.src = 'assets/star-logo.png';
    logoRef.current = img;
    const brand = new Image();
    brand.src = 'assets/airbus-wordmark.svg';
    brandRef.current = brand;
  }, []);

  const accent = t.accent;
  const downloadUrl = `https://constellation.airbus.events/d/${token}`;

  const goHome = useCallback(() => {
    setForm(EMPTY_FORM); setKeepsake(null); setSent(false); setSending(false); go('start');
  }, [go]);
  const startFlow = useCallback(() => { setSent(false); go('form'); }, [go]);

  const handleSend = useCallback(() => {
    if (sent) return;
    setKeepsake(makeKeepsakeCard(form, accent, logoRef.current, brandRef.current));
    setSending(true);
  }, [sent, form, accent]);

  const onSendDone = useCallback(() => {
    setSending(false); setSent(true); go('download');
  }, [go]);

  // Jump to any step from the Tweaks panel (for review / staging).
  const goStep = useCallback((step) => {
    setSending(false);
    if (step === 'start') { goHome(); return; }
    if (step === 'form') { setSent(false); setForm(EMPTY_FORM); go('form'); return; }
    // downstream steps need data — fill with a sample if the form is empty
    setForm((f) => (f.name && f.birth && f.base && f.memory ? f : SAMPLE_FORM));
    if (step === 'send') {
      const f = (form.name && form.birth && form.base && form.memory) ? form : SAMPLE_FORM;
      setKeepsake(makeKeepsakeCard(f, accent, logoRef.current, brandRef.current));
      go('review'); setSending(true); return;
    }
    if (step === 'download') {
      const f = (form.name && form.birth && form.base && form.memory) ? form : SAMPLE_FORM;
      setKeepsake((k) => k || makeKeepsakeCard(f, accent, logoRef.current, brandRef.current));
    }
    go(step); // 'review' | 'download'
  }, [goHome, go, form, accent]);

  const renderScreen = (name) => {
    switch (name) {
      case 'start':
        return <StartScreen tweak={t} accent={accent} sent={sent} onStart={startFlow} onReset={goHome} />;
      case 'form':
        return <FormScreen accent={accent} data={form} onChange={setForm}
          onContinue={() => go('review')} onCancel={() => go('start')} />;
      case 'review':
        return <ReviewScreen accent={accent} data={form} sent={sent}
          onSend={handleSend} onRewrite={() => go('form')} />;
      case 'download':
        return <DownloadScreen accent={accent} keepsake={keepsake} name={form.name}
          onHome={goHome} />;
      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      <div style={{ position: 'absolute', inset: 0 }}>
        <div key={'c-' + screen} style={{ position: 'absolute', inset: 0 }}>
          {renderScreen(screen)}
        </div>
        {prevScreen && (
          <div key={'p-' + prevScreen} style={{ position: 'absolute', inset: 0,
            animation: `cwScreenOut ${SCREEN_FADE_MS}ms ease forwards`, pointerEvents: 'none' }}>
            {renderScreen(prevScreen)}
          </div>
        )}
      </div>

      {sending && (
        <NodeFlash photo={keepsake} intensity={t.nodeIntensity} accent={accent} onDone={onSendDone}
          sendingLabel="Sending your node to the map…"
          successTitle="You're on the map!"
          successSubtitle="Look up at the constellation to find your node"
          doneLabel="Take your keepsake" />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Steps (preview)" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <TweakButton label="1 · Home" secondary onClick={() => goStep('start')} />
          <TweakButton label="2 · Form" secondary onClick={() => goStep('form')} />
          <TweakButton label="3 · Review" secondary onClick={() => goStep('review')} />
          <TweakButton label="4 · Send" secondary onClick={() => goStep('send')} />
          <TweakButton label="5 · QR" secondary onClick={() => goStep('download')} />
        </div>
        <TweakSection label="Content" />
        <TweakText label="Title" value={t.title} onChange={(v) => setTweak('title', v)} />
        <TweakRow label="Description">
          <textarea className="twk-field" rows={5} value={t.description}
            style={{ resize: 'vertical', lineHeight: 1.4, fontFamily: 'inherit' }}
            onChange={(e) => setTweak('description', e.target.value)} />
        </TweakRow>
        <TweakSection label="Brand" />
        <TweakColor label="Accent color" value={t.accent}
          options={['#00AEC7', '#FFFFFF', '#B7C9D3', '#3D8BFF']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="Experience" />
        <TweakRadio label="Node animation" value={t.nodeIntensity}
          options={['subtle', 'medium', 'intense']}
          onChange={(v) => setTweak('nodeIntensity', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('kiosk')).render(<App />);
