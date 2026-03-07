import parse from 'html-react-parser';
import { Link } from 'react-router-dom';

const About1 = ({
  subtitle,
  title,
  rotatetext,
  subtitle2,
  content,
  btnname,
  ctaTagline,
  expyear,
  exptitle,
  avatar,
  name,
  designation,
}) => {
  return (
    <section className="about-section space bg-white" id="about-section">
      <div className="container">
        <div className="row gy-30 align-items-start">
          <div className="col-lg-5">
            <div
              className="about-content-wrap"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <div className="title-area">
                <div className="sub-title">{subtitle}</div>
                <h2 className="sec-title">{parse(title)}</h2>
              </div>
              <div className="about-img">
                <img
                  className="br-10"
                  data-tilt
                  src="/assets/imgss001/coaching%20(23).jpg"
                  alt="about"
                />
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-sm-6">
            <div className="about-middle-wrap">
              <div className="circle-box spin2">
                <div className="logo-box">
                  <img
                    src="/assets/images/shapes/star2.png"
                    alt="Étoile décorative EnnéaMaroc"
                  />
                </div>
                <div className="text-inner text-inner-circle">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="250.5"
                    height="250.5"
                    viewBox="0 0 250.5 250.5"
                  >
                    <path
                      d="M.25,125.25a125,125,0,1,1,125,125,125,125,0,0,1-125-125"
                      id="e-path-35ee1b2"
                    ></path>
                    {/* Stretch text to complete the circle with balanced spacing. */}
                    <text
                      fontSize="16"
                      style={{ fontFamily: "Inter, Arial, sans-serif" }}
                      letterSpacing="0.3px"
                      wordSpacing="8px"
                    >
                      <textPath
                        id="e-text-path-35ee1b2"
                        href="#e-path-35ee1b2"
                        startOffset="0%"
                        textLength="760"
                        lengthAdjust="spacingAndGlyphs"
                      >
                        {rotatetext}
                      </textPath>
                    </text>
                  </svg>
                </div>
              </div>
              <div className="about-info">
                <h5 className="since">{subtitle2}</h5>
                <p
                  className="text-justify"
                  style={{
                    color: "var(--gray-color2)",
                    lineHeight: "1.7",
                    marginBottom: "24px",
                    textAlign: "justify",
                  }}
                >
                  {parse(content)}
                </p>
                <Link to="/contact" className="theme-btn bg-white mt-30">
                  {btnname}
                  <i className="bi bi-arrow-right"></i>
                </Link>
                {ctaTagline && (
                  <p
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      color: "var(--gray-color2)",
                      maxWidth: 320,
                    }}
                  >
                    {ctaTagline}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-sm-6 d-flex align-items-end">
            <div className="about-right-wrap">
              <div className="experience-card">
                <div className="years">
                  <span className="count-number odometer" data-count="18">
                    {expyear}
                  </span>
                </div>
                <div className="text">{parse(exptitle)}</div>
              </div>
              <div className="profile-card overlay-anim1">
                <img className="image" src={avatar} alt={name} />
                <div className="profile-details text-center">
                  <h5 className="name">{name}</h5>
                  <p className="title">{designation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About1;