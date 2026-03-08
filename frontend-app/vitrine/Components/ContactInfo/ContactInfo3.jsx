const ContactInfo3 = () => {
  return (
    <div>
      <section className="contact-section style-2 space bg-theme3">
        <div className="container">
          <div className="row gy-30">
            {/* Bloc infos */}
            <div className="col-lg-5">
              <div className="contact-content-wrap">
                <div className="title-area twoT">
                  <div className="sub-title">
                    CONTACT
                  </div>
                  <h2 className="sec-title">
                    Contactez l’équipe <br />{" "}
                    <span className="bold">EnnéaMaroc</span>
                  </h2>
                  <p className="sec-text " style={{ color: "#000" }}>
                    Une question sur nos formations, le coaching ou
                    l’ennéagramme ? Écrivez-nous, on vous répond rapidement.
                  </p>
                </div>

                <div className="contact-info">
                  <div className="contact-item">
                    <div className="icon">
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div className="info">
                      <h4 className="title">Adresse</h4>
                      <p style={{ color: "#000" }}>
                        Av. My Youssef, résidence Hamza (au-dessus du café
                        Picasso), 4ème étage n°1,
                        <br />
                        CP 90000 Tanger
                      </p>
                    </div>
                  </div>

                  <div className="contact-item">
                    <div className="icon">
                      <i className="bi bi-telephone-fill"></i>
                    </div>
                    <div className="info">
                      <h4 className="title">Appelez-nous</h4>
                      <div className="content" style={{ color: "#000" }}>
                        <strong>Tel 1 :</strong>{" "}
                        <a href="tel:0661246647" style={{ color: "#000" }}>
                          06 61 24 66 47
                        </a>
                        <br />
                        <strong>Tel 2 :</strong>{" "}
                        <a href="tel:0662062032" style={{ color: "#000" }}>
                          06 62 06 20 32
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="contact-item">
                    <div className="icon">
                      <i className="bi bi-envelope-fill"></i>
                    </div>
                    <div className="info">
                      <h4 className="title">E-mail</h4>
                      <div className="content">
                        <a
                          href="mailto:contact@enneamaroc.com"
                          style={{ color: "#000" }}
                        >
                          contact@enneamaroc.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="contact-item">
                    <div className="icon">
                      <i className="bi bi-clock-fill"></i>
                    </div>
                    <div className="info">
                      <h4 className="title">Heures de travail</h4>
                      <p style={{ color: "#000" }}>
                        Découvrez les horaires et informations.
                      </p>
                      <div className="content" style={{ color: "#000" }}>
                        <span>Lun – Vend: 09:00 – 17:00</span>
                        <br />
                        <span>Sam – Dim: Fermé</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="social-links">
                  <a
                    href="https://www.facebook.com/HorizonRessourcesHumaines"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="link-effect">
                      <span className="effect-1">Facebook</span>
                      <span className="effect-1">Facebook</span>
                    </span>
                  </a>
                  <a
                    href="https://www.instagram.com/accounts/login/?next=%2Fhorizon_rh%2F&source=omni_redirect"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="link-effect">
                      <span className="effect-1">Instagram</span>
                      <span className="effect-1">Instagram</span>
                    </span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/horizon-rh-maroc/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="link-effect">
                      <span className="effect-1">LinkedIn</span>
                      <span className="effect-1">LinkedIn</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="col-lg-7">
              <div className="contact-form">
                <h2 className="title mt--5 mb-35">Envoyez-nous un message</h2>

                {/* Style inline pour placeholder */}
                <style>
                  {`
        .contact-form input::placeholder,
        .contact-form textarea::placeholder,
        .contact-form select option:first-child {
          color: rgba(0, 0, 0, 0.5); /* noir avec opacité */
        }
      `}
                </style>

                <form
                  id="contact_form"
                  className="contact_form"
                  action="https://formspree.io/f/mzbnjrnb"
                  method="post"
                >
                  <div className="form-grid">
                    <div className="form-group">
                      <span className="icon">
                        <i className="bi bi-person-fill"></i>
                      </span>
                      <input
                        type="text"
                        id="fullName"
                        name="name"
                        placeholder="Votre nom complet"
                        required
                        autoComplete="on"
                      />
                    </div>
                    <div className="form-group">
                      <span className="icon">
                        <i className="bi bi-envelope-fill"></i>
                      </span>
                      <input
                        type="email"
                        id="userEmail"
                        name="email"
                        placeholder="Adresse e-mail"
                        required
                        autoComplete="on"
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <span className="icon">
                        <i className="bi bi-telephone-fill"></i>
                      </span>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        placeholder="Téléphone"
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div className="form-group">
                      <input type="text" id="service" name="service" placeholder="Quel service vous intéresse ?" autoComplete="off" />
                    </div>
                  </div>

                  <div className="form-group">
                    <textarea
                      id="msg"
                      name="msg"
                      placeholder="Votre message"
                      required
                    ></textarea>
                  </div>

                  <div className="form-group terms">
                    <input type="checkbox" id="terms" required />
                    <label htmlFor="terms" style={{ color: "#000" }}>
                      J’accepte les conditions générales.
                    </label>
                  </div>

                  <div className="d-flex flex-wrap align-items-center gap-3 mt-35">
                    <button
                      type="submit"
                      className="theme-btn bg-dark"
                      data-loading-text="Veuillez patienter..."
                    >
                      <span className="link-effect">
                        <span className="btn-title">Envoyer</span>
                      </span>
                      <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carte */}
      <div className="contact-map">
        <div className="container-fluid p-0">
          <div className="row">
            <div className="map-box">
              <iframe
                className="map-canvas"
                // Carte intégrée du nouveau siège à Tanger
                src="https://maps.google.com/maps?q=35.771008,-5.811756&z=15&output=embed"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo3;
