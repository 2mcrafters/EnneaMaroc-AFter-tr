import parse from "html-react-parser";

const HeroBanner1 = ({
  title = "Libérer votre potentiel avec EnnéaMaroc",
  mainimg = "/assets/imgss001/Layer 01.png",
  inscriptionUrl = "/app/#/login",
  RegisterUrl = "/app/#/signup",
  subtitle = "Un chemin pour mieux vous connaître, vous libérer et vivre en autonomie.",
  height = "100vh",
  heightSm = "80vh",
}) => {
  const bgUrl = typeof mainimg === "string" ? encodeURI(mainimg) : mainimg;

  return (
    <section
      className="hb-wrap"
      style={{
        "--hero-h": height,
        "--hero-h-sm": heightSm,
        paddingTop: "6rem",
      }}
    >
      <style>{`
        .hb-wrap{
          position:relative;
          min-height: var(--hero-h);
          display:flex; align-items:center; justify-content:center;
          overflow:hidden; color:#fff; background:#0a83ca; isolation:isolate;
        }
        @media (max-width: 768px){ .hb-wrap{ min-height: var(--hero-h-sm); } }
        .hb-bg{ position:absolute; inset:0; background-image:url("${bgUrl}"); background-size:cover; background-position:center; z-index:-2; }
        .hb-scrim{
          position:absolute; inset:0; z-index:-1; pointer-events:none;
          background:
            linear-gradient(180deg, rgba(0,0,0,.32), rgba(10,131,202,.25)),
            radial-gradient(900px 420px at 50% 0%, rgba(255,255,255,.12), rgba(255,255,255,0) 70%);
        }

        .hb-container{ width:100%; max-width:1100px; padding: clamp(56px, 6vw, 96px) 20px; }
        .hb-center{ display:flex; flex-direction:column; align-items:center; text-align:center; gap:16px; }
        .hb-title{
          margin:0; font-size: clamp(34px, 6vw, 64px); line-height:1.05;
          font-weight:900; letter-spacing:.2px; color:#fff;
          text-shadow: 0 10px 30px rgba(0,0,0,.35), 0 2px 6px rgba(0,0,0,.25);
          text-wrap: balance;
        }
        .hb-sub{
          margin:0; max-width:820px; font-size: clamp(16px, 1.7vw, 19px);
          color: rgba(255,255,255,.97); text-shadow: 0 2px 8px rgba(0,0,0,.25);
        }
        .hb-actions{ display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin-top:12px; }

        .hb-btn{
          display:inline-flex; align-items:center; justify-content:center; gap:10px;
          padding:14px 18px; border-radius:12px; font-weight:800;
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease, color .2s ease, border-color .2s ease;
          border:1px solid transparent; text-decoration:none;
          will-change: transform;
        }

        /* Primary default: 1c8bce bg / white text */
        .hb-btn.primary{
          background:#1c8bce; color:#fff; border-color:#1c8bce;
          box-shadow: 0 10px 26px rgba(0,0,0,.22);
        }
        /* Primary hover: reverse */
        .hb-btn.primary:hover,
        .hb-btn.primary:focus-visible{
          background:#fff; color:#1c8bce; border-color:#1c8bce;
          transform: translateY(-1px);
          box-shadow: 0 14px 32px rgba(0,0,0,.28);
          outline:none;
        }

        /* Secondary default: e13734 bg / white text */
        .hb-btn.secondary{
          background:#e13734; color:#fff; border-color:#e13734;
          box-shadow: 0 10px 26px rgba(0,0,0,.22);
        }
        /* Secondary hover: reverse */
        .hb-btn.secondary:hover,
        .hb-btn.secondary:focus-visible{
          background:#fff; color:#e13734; border-color:#e13734;
          transform: translateY(-1px);
          box-shadow: 0 14px 32px rgba(0,0,0,.28);
          outline:none;
        }

        .hb-btn:active{ transform: translateY(0); box-shadow: 0 8px 18px rgba(0,0,0,.18); }
      `}</style>

      <div className="hb-bg" aria-hidden="true" />
      <div className="hb-scrim" aria-hidden="true" />

      <div className="hb-container">
        <div className="hb-center">
          <h1 className="hb-title">{parse(title)}</h1>
          {subtitle && <p className="hb-sub">{subtitle}</p>}
          <div className="hb-actions">
            <a href={inscriptionUrl} className="hb-btn primary">
              Se connecter
            </a>
            <a href={RegisterUrl} className="hb-btn secondary">
              S'inscrire
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner1;
