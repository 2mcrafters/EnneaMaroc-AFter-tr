
const Nwesletter = ({ addclass }) => {
  return (
    <section className={addclass}>
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="newsletter">
              <div className="p-top-left wow slideInLeft">
                <img
                  src="/assets/images/newslatter/shape01.png"
                  alt="Forme décorative"
                />
              </div>
              <div className="p-top-right wow slideInRight">
                <img
                  src="/assets/images/newslatter/shape02.png"
                  alt="Forme décorative"
                />
              </div>

              {/* Texte principal */}
              <div className="text">
                <h3>Besoin d’une première consultation gratuite&nbsp;?</h3>
                <p>
                  le coaching et l’Ennéagramme peuvent vous aider à développer
                  votre potentiel et à renforcer vos relations.
                </p>
              </div>

              {/* Contact email */}
              <div className="contact-info">
                <div className="email-icon">
                  <i className="bi bi-envelope"></i>
                </div>
                <div className="email-details">
                  <p>Écrivez-nous à</p>
                  <a href="mailto:contact@enneamaroc.ma">
                    contact@enneamaroc.ma
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Nwesletter;
