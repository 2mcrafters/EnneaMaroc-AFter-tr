import { useEffect, useRef, useState } from "react";

const HeroBanner1 = ({
  title = "Libérer votre potentiel avec EnnéaMaroc",
  mainimg = "/assets/imgss001/coaching (44).jpg",
  btnurl,
  inscriptionUrl = "/app/#/login",
  RegisterUrl = "/app/#/signup",
  subtitle = "Un chemin pour mieux vous connaître, vous libérer et vivre en autonomie",
  height = "100vh",
  heightSm = "80vh",
}) => {
  const bgUrl = typeof mainimg === "string" ? encodeURI(mainimg) : mainimg;
  const loginUrl = btnurl || inscriptionUrl || "/app/#/login";
  const signupUrl = RegisterUrl || "/app/#/signup";

  const plainTitle = typeof title === "string" ? title.replace(/<[^>]+>/g, "") : title;
  const [typedTitle, setTypedTitle] = useState("");
  const [typedSub, setTypedSub] = useState("");
  const [flash, setFlash] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const timerRef = useRef(null);
  const subTimerRef = useRef(null);

  useEffect(() => {
    // Flash/light-up effect first, then type
    const flashTimer = setTimeout(() => setFlash(true), 150);
    const contentTimer = setTimeout(() => setShowContent(true), 500);

    // Type title after flash
    const titleDelay = setTimeout(() => {
      let i = 0;
      setTypedTitle("");
      timerRef.current = setInterval(() => {
        if (i < plainTitle.length) {
          setTypedTitle(plainTitle.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timerRef.current);

          // Type subtitle after title is done
          const plain = subtitle || "";
          let j = 0;
          setTypedSub("");
          subTimerRef.current = setInterval(() => {
            if (j < plain.length) {
              setTypedSub(plain.slice(0, j + 1));
              j++;
            } else {
              clearInterval(subTimerRef.current);
            }
          }, 22);
        }
      }, 40);
    }, 700);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(contentTimer);
      clearTimeout(titleDelay);
      clearInterval(timerRef.current);
      clearInterval(subTimerRef.current);
    };
  }, [plainTitle, subtitle]);

  return (
    <section
      className="hb-wrap"
      style={{
        "--hero-h": height,
        "--hero-h-sm": heightSm,
        paddingTop: "clamp(100px, 14vh, 160px)",
      }}
    >
      <style>{`
        @keyframes heroFlash {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          30%  { opacity: 0.4; }
          50%  { opacity: 1; }
          70%  { opacity: 0.7; }
          100% { opacity: 1; }
        }

        @keyframes heroLightBeam {
          0%   { opacity: 0; transform: scaleX(0.4) scaleY(0); }
          40%  { opacity: 1; transform: scaleX(1) scaleY(1); }
          100% { opacity: 0; transform: scaleX(1.6) scaleY(1); }
        }

        @keyframes heroBgReveal {
          from { opacity: 0; transform: scale(1.06); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .hb-wrap{
          position:relative;
          min-height: var(--hero-h);
          display:flex; align-items:center; justify-content:center;
          overflow:hidden; color:#fff; background:#64508d; isolation:isolate;
          contain: layout paint;
        }
        @media (max-width: 768px){
          .hb-wrap{ min-height: var(--hero-h-sm); padding-top: 80px; }
        }

        .hb-bg{
          position:absolute; inset:0;
          background-image:url("${bgUrl}");
          background-size:cover; background-position:center; z-index:-2;
          animation: heroBgReveal 1.4s cubic-bezier(0.22,1,0.36,1) both;
        }

        .hb-flash-overlay {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse 80% 60% at 50% 30%,
            rgba(255,255,255,0.55) 0%,
            rgba(100,80,141,0.18) 45%,
            transparent 75%);
          animation: heroFlash 1.1s ease-out forwards;
        }

        .hb-light-beam {
          position: absolute;
          top: 0; left: 50%;
          width: 160%; height: 100%;
          transform: translateX(-50%);
          pointer-events: none; z-index: 1;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.18) 0%,
            rgba(255,255,255,0.04) 50%,
            transparent 100%);
          animation: heroLightBeam 1.4s ease-out forwards;
        }

        .hb-scrim{
          position:absolute; inset:0; z-index:-1; pointer-events:none;
          background:
            linear-gradient(180deg, rgba(0,0,0,.32), rgba(10,131,202,.25)),
            radial-gradient(900px 420px at 50% 0%, rgba(255,255,255,.12), rgba(255,255,255,0) 70%);
        }

        .hb-container{ width:100%; max-width:1100px; padding: clamp(80px, 8vw, 120px) 20px; position: relative; z-index: 2; }
        .hb-center{ display:flex; flex-direction:column; align-items:center; text-align:center; gap:16px; }

        .hb-title{
          margin:0; font-size: clamp(34px, 6vw, 64px); line-height:1.05;
          font-weight:900; letter-spacing:.2px; color:#fff;
          text-shadow: 0 10px 30px rgba(0,0,0,.35), 0 2px 6px rgba(0,0,0,.25);
          text-wrap: balance;
          min-height: 1.1em;
        }

        .hb-cursor {
          display: inline-block;
          width: 3px; height: 0.85em;
          background: #fff;
          margin-left: 3px;
          vertical-align: middle;
          animation: blink 0.7s step-start infinite;
          border-radius: 1px;
        }

        .hb-sub{
          margin:0; max-width:820px; font-size: clamp(16px, 1.7vw, 19px);
          color: rgba(255,255,255,.97); text-shadow: 0 2px 8px rgba(0,0,0,.25);
          min-height: 1.4em;
        }

        .hb-actions{
          display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-top:12px;
          animation: fadeSlideUp 0.7s 1.8s ease both;
        }

        .hb-btn{
          display:inline-flex; align-items:center; justify-content:center; gap:10px;
          padding:14px 18px; border-radius:12px; font-weight:800;
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease, color .2s ease, border-color .2s ease;
          border:1px solid transparent; text-decoration:none;
          will-change: transform;
        }
        .hb-btn.primary{
          background:#ff8f42; color:#fff; border-color:#ff8f42;
          box-shadow: 0 10px 26px rgba(0,0,0,.22);
        }
        .hb-btn.primary:hover,
        .hb-btn.primary:focus-visible{
          background:#fff; color:#ff8f42; border-color:#ff8f42;
          transform: translateY(-1px);
          box-shadow: 0 14px 32px rgba(0,0,0,.28);
          outline:none;
        }
        .hb-btn.secondary{
          background:#64508d; color:#fff; border-color:#64508d;
          box-shadow: 0 10px 26px rgba(0,0,0,.22);
        }
        .hb-btn.secondary:hover,
        .hb-btn.secondary:focus-visible{
          background:#fff; color:#64508d; border-color:#64508d;
          transform: translateY(-1px);
          box-shadow: 0 14px 32px rgba(0,0,0,.28);
          outline:none;
        }
        .hb-btn:active{ transform: translateY(0); box-shadow: 0 8px 18px rgba(0,0,0,.18); }
      `}</style>

      <div className="hb-bg" aria-hidden="true" />
      {flash && <div className="hb-flash-overlay" aria-hidden="true" />}
      {flash && <div className="hb-light-beam" aria-hidden="true" />}
      <div className="hb-scrim" aria-hidden="true" />

      <div className="hb-container">
        <div className="hb-center">
          <h1 className="hb-title">
            {typedTitle}
            {typedTitle.length < plainTitle.length && (
              <span className="hb-cursor" />
            )}
          </h1>
          {showContent && subtitle && (
            <p className="hb-sub">
              {typedSub}
              {typedSub.length < subtitle.length && (
                <span className="hb-cursor" />
              )}
            </p>
          )}
          <div className="hb-actions">
            <a href={loginUrl} className="hb-btn primary">
              Se connecter
            </a>
            <a href={signupUrl} className="hb-btn secondary">
              S'inscrire
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner1;
