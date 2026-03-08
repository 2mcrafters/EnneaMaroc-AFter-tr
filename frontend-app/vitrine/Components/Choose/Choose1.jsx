import { Link } from "react-router-dom";

const highlightItems = [
  {
    icon: "bi-layers",
    title: "Des repères clairs",
    text: "L'Ennéagramme rend les comportements lisibles pour avancer sereinement.",
  },
  {
    icon: "bi-people",
    title: "Un cadre humain",
    text: "Chaque atelier favorise l'écoute, la confiance et la coopération durable.",
  },
  {
    icon: "bi-graph-up-arrow",
    title: "Des résultats concrets",
    text: "Plans d'action simples, suivis efficaces et progrès visibles dans vos équipes.",
  },
];

const Choose1 = () => {
  return (
    <section
      id="pourquoi-ennea-maroc"
      className="choose-section space bg-theme3 overflow-hidden"
    >
      <div className="p-top-right wow slideInRight">
        <img
          src="/assets/images/choose/shape01.png"
          alt="Forme décorative EnnéaMaroc"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="container">
        <div className="row">
          {/* Image + boîte "Depuis" */}
          <div className="col-lg-6 position-relative">
            <div className="choose-thumb">
              <img
                style={{ width: "240%" }}
                src="/assets/images/choose/choose01.jpg"
                alt="Participants en atelier coaching Ennéagramme"
                loading="lazy"
                decoding="async"
                sizes="(min-width: 992px) 480px, 100vw"
              />
            </div>
            {/* <div className="since-box">
              <div className="inner-box">
                <div className="icon-box">
                  <span className="icon">
                    <i className="bi bi-compass"></i>
                  </span>
                </div>
                <h5 className="since" style={{ color: "var(--theme-color1)" }}>
                  DEPUIS 2007
                </h5>
                <div className="text" style={{ color: "var(--dark-color2)" }}>
                  Plus de 15 ans d’accompagnement en coaching et développement
                  humain
                </div>
              </div>
            </div> */}
          </div>

          {/* Contenu texte */}
          <div className="col-lg-6">
            <div className="choose-content-wrapper choose-content-modern">
              <span className="choose-eyebrow">Pourquoi EnnéaMaroc</span>
              <h2 className="choose-headline">
                Nous créons des solutions
                <span> humaines et innovantes</span>
              </h2>
              <p
                className="choose-description"
                style={{ textAlign: "justify" }}
              >
                Grâce à l’Ennéagramme , nous aidons individus et organisations à
                libérer leur potentiel, renforcer leurs relations et évoluer de
                manière durable.
              </p>

              <div className="choose-highlights">
                {highlightItems.map((item) => (
                  <div className="choose-highlight-row" key={item.title}>
                    <span className="choose-highlight-icon">
                      <i className={`bi ${item.icon}`}></i>
                    </span>
                    <div>
                      <h5>{item.title}</h5>
                      <p style={{ textAlign: "justify", color: "#3a3a3a" }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="choose-cta">
                <div className="choose-badge">
                  <strong>+18 ans</strong>
                  <span>d'accompagnement humain</span>
                </div>
                <Link
                  to="/ecole"
                  className="theme-btn bg-dark"
                  onClick={() => {
                    sessionStorage.setItem("scrollTo", "equipe-formateurs");
                  }}
                >
                  <span className="link-effect">
                    <span className="effect-1">Rencontrez notre équipe</span>
                    <span className="effect-1">Rencontrez notre équipe</span>
                  </span>
                  <i className="bi bi-arrow-up-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Choose1;
