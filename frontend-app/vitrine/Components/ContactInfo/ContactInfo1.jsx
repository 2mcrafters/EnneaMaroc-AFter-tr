const ContactInfo1 = () => {
  return (
    <section className="contact-section space bg-white">
      {/* Styles globaux pour placeholder */}
      <style>
        {`
          ::placeholder {
            color: black !important;
            opacity: 1; /* Assure que ce soit bien visible */
          }
          :-ms-input-placeholder { /* Internet Explorer 10-11 */
            color: black !important;
          }
          ::-ms-input-placeholder { /* Microsoft Edge */
            color: black !important;
          }
        `}
      </style>

      <div className="p-top-left wow slideInLeft">
        <img src="/assets/images/contact/shape01.png" alt="Forme décorative" />
      </div>
      <div className="container">
        <div className="row">
          {/* Formulaire */}
          <div className="col-lg-6">
            <div className="appointment-form">
              <div className="header">
                <h2 className="title">Prendre un rendez-vous</h2>
                <span
                  className="availability"
                  style={{ color: "var(--theme-color1)" }}
                >
                  (Disponible 24h/24 et 7j/7)
                </span>
              </div>

              <form
                id="appointment_form"
                className="appointment-form"
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
                      style={{ color: "black" }}
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
                      autoComplete="off"
                      style={{ color: "black" }}
                    />
                  </div>
                </div>

                {/* Sélecteur service */}
                <div className="form-group home-form-select">
                  <select
                    className="custom-select"
                    id="service"
                    name="service"
                    autoComplete="off"
                    style={{ color: "black" }}
                  >
                    <option>Choisissez un service</option>
                    <option value="coaching-individuel">
                      Coaching individuel
                    </option>
                    <option value="formation-enneagramme">
                      Formation Ennéagramme
                    </option>
                    <option value="coaching-equipe">Coaching d’équipe</option>
                    <option value="atelier-developpement">
                      Atelier de développement personnel
                    </option>
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <span className="icon">
                      <i className="bi bi-calendar-fill"></i>
                    </span>
                    <input
                      type="text"
                      id="datepicker"
                      name="date"
                      className="datepicker"
                      placeholder="jj/mm/aaaa"
                      required
                      autoComplete="off"
                      style={{ color: "black" }}
                    />
                  </div>
                  <div className="form-group">
                    <span className="icon">
                      <i className="bi bi-clock-fill"></i>
                    </span>
                    <input
                      type="time"
                      id="timepicker"
                      name="time"
                      required
                      autoComplete="off"
                      style={{ color: "black" }}
                    />
                  </div>
                </div>

                <div className="form-group mb-15">
                  <textarea
                    id="msg"
                    name="message"
                    placeholder="Votre message"
                    required
                    style={{ color: "black" }}
                  ></textarea>
                </div>

                <div className="form-group terms">
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms" style={{ color: "black" }}>
                    J’accepte les conditions générales d’utilisation.
                  </label>
                </div>

                <button
                  type="submit"
                  className="theme-btn bg-dark"
                  data-loading-text="Veuillez patienter..."
                >
                  <span className="link-effect">
                    <span className="btn-title">Envoyer la demande</span>
                  </span>
                  <i className="bi bi-arrow-right"></i>
                </button>
              </form>

              {/* Formulaire Horizon RH Button */}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <a
                  href="https://www.horizonrh.ma/contact/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "14px 32px",
                    background: "#fff",
                    color: "#0a83ca",
                    border: "2px solid #0a83ca",
                    borderRadius: "50px",
                    fontSize: "16px",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(10, 131, 202, 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#0a83ca";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(10, 131, 202, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = "#0a83ca";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(10, 131, 202, 0.15)";
                  }}
                >
                  <span>Formulaire Horizon RH</span>
                  <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Bloc contact */}
          <div className="col-lg-1 lg-d-none"></div>
          <div className="col-lg-5">
            <div className="contact-content-wrap">
              <div className="title-area">
                <div
                  className="sub-title"
                  style={{ color: "var(--theme-color1)" }}
                >
                  <span>
                    <i className="asterisk"></i>
                  </span>{" "}
                  Consultation gratuite
                </div>
                <h2
                  className="sec-title"
                  style={{ color: "var(--theme-color2)" }}
                >
                  Besoin d’échanger ? <br />
                  Profitez d’une{" "}
                  <span className="bold">première consultation offerte</span>
                </h2>
              </div>
              <div className="contact-img br-10 overlay-anim1">
                <img
                  className="hover-reveal-item"
                  src="/assets/images/contact/01.jpg"
                  alt="Contact"
                />
                <a href="tel:+212661246647" className="contact-info">
                  <div className="icon">
                    <i className="icon-phone-circle"></i>
                  </div>
                  <div className="number">+212 661 24 66 47</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo1;
