// screens.jsx — screens + App for Constellation Wall
const { useState, useRef, useEffect, useCallback } = React;
const { C, StarLogo, Wordmark, AmbientNodes, Button, QRCode, NodeFlash } = window.CW;

const PAD = 90;

/* ----------------------------------------------------------------- frame */
function Frame({ children, footer = true, accent = C.cyan }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <img src="assets/fondo.png" alt="" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover' }} />
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
        <div style={{ animation: 'none' }}>
          <StarLogo height={240} float />
        </div>
        <h1 style={{ color: C.white, fontWeight: 700, fontSize: 104, lineHeight: 1.0,
          letterSpacing: '-.02em', marginTop: 46, textWrap: 'balance',
          animation: 'none' }}>
          {tweak.title}
        </h1>
        <p style={{ color: C.steel, fontWeight: 300, fontSize: 35, lineHeight: 1.5,
          maxWidth: 760, marginTop: 34, textWrap: 'pretty',
          animation: 'none' }}>
          {tweak.description}
        </p>

        {sent && (
          <div style={{ marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 16,
            padding: '18px 34px', borderRadius: 999, background: `${accent}1f`,
            border: `1.5px solid ${accent}80`, color: C.white, fontSize: 30, fontWeight: 400,
            animation: 'none' }}>
            <span style={{ fontSize: 30 }}>✦</span>
            Your node now shines in the constellation
          </div>
        )}

        <div style={{ marginTop: 64, width: 560, animation: 'none' }}>
          {sent
            ? <Button accent={accent} big onClick={onReset}>Home</Button>
            : <Button accent={accent} big onClick={onStart}>Start</Button>}
        </div>
      </div>
    </Frame>
  );
}

/* ---------------------------------------------------------- camera screen */
function CameraScreen({ accent, duration, onCaptured, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [phase, setPhase] = useState('init'); // init | ready | counting | error
  const [count, setCount] = useState(duration);

  const stop = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setPhase('ready');
      } catch (e) {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => { cancelled = true; stop(); };
  }, [stop]);

  // begin countdown once ready
  useEffect(() => {
    if (phase !== 'ready') return;
    setCount(duration);
    setPhase('counting');
  }, [phase, duration]);

  useEffect(() => {
    if (phase !== 'counting') return;
    if (count <= 0) { capture(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count]);

  function capture() {
    const v = videoRef.current;
    const W = 900, H = 1200;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (v && v.videoWidth) {
      const vw = v.videoWidth, vh = v.videoHeight;
      const scale = Math.max(W / vw, H / vh);
      const dw = vw * scale, dh = vh * scale;
      ctx.save();
      ctx.translate(W, 0); ctx.scale(-1, 1); // mirror to match the on-screen selfie
      ctx.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh);
      ctx.restore();
    } else {
      ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
    }
    const data = canvas.toDataURL('image/jpeg', 0.9);
    stop();
    onCaptured(data);
  }

  return (
    <Frame footer={false} accent={accent}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* live video */}
        <video ref={videoRef} playsInline muted style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', transform: 'scaleX(-1)',
          background: '#001028',
          opacity: phase === 'error' ? 0 : 1 }} />
        {/* darken edges for kiosk look */}
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,16,46,.55), rgba(0,16,46,.05) 22%, rgba(0,16,46,.05) 72%, rgba(0,16,46,.85))',
          pointerEvents: 'none' }} />
        {/* framing brackets */}
        <CornerBrackets accent={accent} />

        {/* top label */}
        <div style={{ position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center',
          color: C.white, fontSize: 30, fontWeight: 300, letterSpacing: '.18em',
          textTransform: 'uppercase', textShadow: '0 2px 18px rgba(0,0,0,.5)' }}>
          {phase === 'error' ? '' : 'Look at the camera'}
        </div>

        {/* countdown */}
        {phase === 'counting' && count > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%',
              background: `radial-gradient(circle, ${accent}40, transparent 65%)`,
              animation: 'cwGlow 1s ease-in-out infinite' }} />
            <div key={count} style={{ color: C.white, fontWeight: 700, fontSize: 320,
              lineHeight: 1, textShadow: `0 0 60px ${accent}, 0 6px 40px rgba(0,0,0,.5)`,
              animation: 'cwCount 1s ease-in-out' }}>
              {count}
            </div>
          </div>
        )}

        {phase === 'counting' && count <= 0 && (
          <div style={{ position: 'absolute', inset: 0, background: '#fff',
            animation: 'cwFlash .5s ease' }} />
        )}

        {/* error / no camera */}
        {phase === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: `0 ${PAD}px`, textAlign: 'center' }}>
            <StarLogo height={150} />
            <h2 style={{ color: C.white, fontSize: 52, fontWeight: 700, marginTop: 30 }}>Camera unavailable</h2>
            <p style={{ color: C.steel, fontSize: 32, fontWeight: 300, marginTop: 18, maxWidth: 660, lineHeight: 1.5 }}>
              Allow camera access to take your photo. Check your browser permissions and try again.
            </p>
            <div style={{ marginTop: 50, width: 520, display: 'flex', flexDirection: 'column', gap: 22 }}>
              <Button accent={accent} onClick={() => setPhase('init')}>Retry</Button>
              <Button variant="secondary" onClick={onCancel}>Back</Button>
            </div>
          </div>
        )}

        {/* cancel */}
        {phase !== 'error' && (
          <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex',
            justifyContent: 'center' }}>
            <div style={{ width: 320 }}>
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </Frame>
  );
}

function CornerBrackets({ accent }) {
  const L = 90, T = 8, m = 60;
  const base = { position: 'absolute', width: L, height: L, borderColor: accent, borderStyle: 'solid' };
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ ...base, top: m, left: m, borderWidth: `${T}px 0 0 ${T}px`, borderTopLeftRadius: 14 }} />
      <div style={{ ...base, top: m, right: m, borderWidth: `${T}px ${T}px 0 0`, borderTopRightRadius: 14 }} />
      <div style={{ ...base, bottom: m + 60, left: m, borderWidth: `0 0 ${T}px ${T}px`, borderBottomLeftRadius: 14 }} />
      <div style={{ ...base, bottom: m + 60, right: m, borderWidth: `0 ${T}px ${T}px 0`, borderBottomRightRadius: 14 }} />
    </div>
  );
}

/* --------------------------------------------------------- preview screen */
function PreviewScreen({ photo, accent, sent, onSend, onDownload, onRetake }) {
  return (
    <Frame accent={accent}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: `90px ${PAD}px 0`, textAlign: 'center' }}>
        <div style={{ color: C.steel, fontSize: 28, fontWeight: 300, letterSpacing: '.2em',
          textTransform: 'uppercase', animation: 'none' }}>
          Your portrait
        </div>
        <div style={{ position: 'relative', marginTop: 30, animation: 'none' }}>
          <img src={photo} alt="Tu foto" style={{ width: 660, height: 'auto', maxHeight: 880,
            objectFit: 'cover', borderRadius: 40, display: 'block',
            border: `3px solid ${accent}`, boxShadow: `0 30px 80px rgba(0,0,0,.5), 0 0 60px ${accent}55` }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: 40,
            boxShadow: 'inset 0 0 60px rgba(0,16,46,.35)', pointerEvents: 'none' }} />
        </div>
        <div style={{ marginTop: 50, width: 660, display: 'flex', flexDirection: 'column', gap: 22,
          animation: 'none' }}>
          <Button accent={accent} big onClick={onSend} disabled={sent}>
            {sent ? (
              <span>You've already sent your node</span>
            ) : (
              <React.Fragment>
                <span>Send to the map</span>
                <span style={{ fontSize: 30 }}>✦</span>
              </React.Fragment>
            )}
          </Button>
          <div style={{ display: 'flex', gap: 22 }}>
            <Button variant="white" onClick={onDownload}>Download</Button>
            <Button variant="outline" onClick={onRetake}>Retake</Button>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* -------------------------------------------------------- download screen */
function DownloadScreen({ accent, downloadUrl, sent, onBack, onHome }) {
  return (
    <Frame accent={accent}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: `0 ${PAD}px`, textAlign: 'center' }}>
        <div style={{ animation: 'none' }}>
          <StarLogo height={120} />
        </div>
        <h2 style={{ color: C.white, fontWeight: 700, fontSize: 72, marginTop: 28,
          letterSpacing: '-.02em', animation: 'none' }}>
          Download your photo
        </h2>
        <p style={{ color: C.steel, fontSize: 33, fontWeight: 300, marginTop: 20, maxWidth: 680,
          lineHeight: 1.5, animation: 'none' }}>
          Scan the QR code with your phone's camera to save your portrait.
        </p>
        <div style={{ marginTop: 48, padding: 48, background: C.white, borderRadius: 48,
          boxShadow: `0 30px 80px rgba(0,0,0,.45), 0 0 0 6px ${accent}33`,
          animation: 'none' }}>
          <QRCode text={downloadUrl} size={650} />
        </div>
        <div style={{ marginTop: 56, width: 660, display: 'flex', gap: 22,
          animation: 'none' }}>
          {!sent && <Button variant="secondary" onClick={onBack}>Back</Button>}
          <Button accent={accent} onClick={onHome}>Home</Button>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------- App */
function makeToken() {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

// A neutral portrait stand-in so the Foto / Envío / QR steps can be previewed
// from the Tweaks panel without taking a real photo.
function makePlaceholderPhoto() {
  const W = 900, H = 1200;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0a3d72'); g.addColorStop(1, '#001028');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,.10)';
  ctx.beginPath(); ctx.arc(W / 2, 470, 165, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W / 2, 1180, 290, 430, 0, Math.PI, Math.PI * 2); ctx.fill();
  return cv.toDataURL('image/jpeg', 0.9);
}

// Crossfade screen manager: keeps the outgoing screen mounted briefly so screens
// dissolve into each other instead of snapping.
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
  const [t, setTweak] = useTweaks(window.CW.TWEAK_DEFAULTS);
  const [screen, prevScreen, go] = useScreenTransition('start'); // start | camera | preview | download
  const [photo, setPhoto] = useState(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [token] = useState(makeToken);

  const accent = t.accent;
  const downloadUrl = `https://constellation.airbus.events/d/${token}`;

  const goHome = useCallback(() => { setPhoto(null); setSent(false); setSending(false); go('start'); }, [go]);
  const startFlow = useCallback(() => { setSent(false); go('camera'); }, [go]);

  const handleSend = useCallback(() => { if (!sent) setSending(true); }, [sent]);
  // After the success message, hand off to the QR screen so the guest can
  // download the photo on their phone.
  const onSendDone = useCallback(() => {
    setSending(false); setSent(true); go('download');
  }, [go]);

  // Jump straight to any step from the Tweaks panel (for review / staging).
  const goStep = useCallback((step) => {
    setSending(false);
    if (step === 'start') { goHome(); return; }
    if (step === 'camera') { setSent(false); go('camera'); return; }
    setPhoto((p) => p || makePlaceholderPhoto());
    if (step === 'send') { go('preview'); setSending(true); return; }
    go(step); // 'preview' | 'download'
  }, [goHome, go]);

  // Render any screen by name. `isPrev` swaps the live camera for a static dark
  // layer on the outgoing side so we don't re-open the webcam mid-transition.
  const renderScreen = (name, isPrev) => {
    switch (name) {
      case 'start':
        return <StartScreen tweak={t} accent={accent} sent={sent} onStart={startFlow} onReset={goHome} />;
      case 'camera':
        return isPrev
          ? <div style={{ position: 'absolute', inset: 0, background: '#001028' }} />
          : <CameraScreen accent={accent} duration={Math.round(t.countdown)}
              onCaptured={(d) => { setPhoto(d); go('preview'); }}
              onCancel={() => go('start')} />;
      case 'preview':
        return photo ? <PreviewScreen photo={photo} accent={accent} sent={sent}
          onSend={handleSend} onDownload={() => go('download')} onRetake={() => go('camera')} /> : null;
      case 'download':
        return <DownloadScreen accent={accent} downloadUrl={downloadUrl} sent={sent}
          onBack={() => go('preview')} onHome={goHome} />;
      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* Incoming screen stays fully opaque (robust even if the animation
            timeline is throttled); the outgoing screen dissolves out on top. */}
        <div key={'c-' + screen} style={{ position: 'absolute', inset: 0 }}>
          {renderScreen(screen, false)}
        </div>
        {prevScreen && (
          <div key={'p-' + prevScreen} style={{ position: 'absolute', inset: 0,
            animation: `cwScreenOut ${SCREEN_FADE_MS}ms ease forwards`, pointerEvents: 'none' }}>
            {renderScreen(prevScreen, true)}
          </div>
        )}
      </div>

      {sending && (
        <NodeFlash photo={photo} intensity={t.nodeIntensity} accent={accent} onDone={onSendDone} />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Steps (preview)" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <TweakButton label="1 · Home" secondary onClick={() => goStep('start')} />
          <TweakButton label="2 · Camera" secondary onClick={() => goStep('camera')} />
          <TweakButton label="3 · Photo" secondary onClick={() => goStep('preview')} />
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
        <TweakSlider label="Countdown" value={t.countdown} min={3} max={10} step={1} unit="s"
          onChange={(v) => setTweak('countdown', v)} />
        <TweakRadio label="Node animation" value={t.nodeIntensity}
          options={['subtle', 'medium', 'intense']}
          onChange={(v) => setTweak('nodeIntensity', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('kiosk')).render(<App />);
