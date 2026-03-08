import React, { useEffect, useRef, useState } from 'react';
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
  buttonLink = "/ecole",
  teamMembers = [],
}) => {
  const members = teamMembers.length
    ? teamMembers
    : avatar
      ? [{
          image: avatar,
          name,
          role: designation,
        }]
      : [];

  const showcaseMembers = members.slice(0, 2);

  const handleImageError = (event) => {
    event.currentTarget.src = '/assets/imgss001/coaching (44).jpg';
  };

  const [isVisible, setIsVisible] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const sectionRef = useRef(null);
  const typingRef = useRef(null);

  // Strip HTML tags to get plain text for typing, then re-parse at display
  const plainTitle = typeof title === 'string' ? title.replace(/<[^>]+>/g, '') : '';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let i = 0;
    setTypedTitle('');
    typingRef.current = setInterval(() => {
      if (i < plainTitle.length) {
        setTypedTitle(plainTitle.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingRef.current);
      }
    }, 38);
    return () => clearInterval(typingRef.current);
  }, [isVisible, plainTitle]);

  return (
    <section className="about-section bg-white" id="about-section" style={{ padding: '40px 0' }} ref={sectionRef}>
      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }

          .typing-cursor {
            display: inline-block;
            width: 2px;
            height: 1em;
            background: #0a83ca;
            margin-left: 3px;
            vertical-align: middle;
            animation: blink 0.8s step-start infinite;
          }

          .about-showcase-section {
            background: transparent;
          }

          .about-showcase-layout {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.05fr);
            gap: 52px;
            align-items: stretch;
          }

          .about-showcase-copy {
            padding-right: 12px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
          }

          .about-showcase-copy .sub-title {
            color: #0a83ca;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.08em;
            margin-bottom: 18px;
          }

          .about-showcase-title {
            color: #0a83ca;
            font-size: max(22px, 2.3vw); /* fallback for 0.8vw typo */
            line-height: 1.1;
            font-weight: 600;
            letter-spacing: -0.01em;
            margin-bottom: 0;
            max-width: 680px;
          }

          .about-showcase-title b {
            font-weight: 800;
          }

          .about-showcase-since {
            color: #0a83ca;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.04em;
            margin-bottom: 8px; /* Reduced spacing here */
          }

          .about-showcase-text {
            color: #334155;
            font-size: 17px;
            line-height: 1.8;
            max-width: 640px;
            margin-bottom: 18px; /* Reduced spacing here */
            text-align: justify;
          }

          .about-showcase-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            min-width: 0;
            padding: 12px 28px;
            border: 1.8px solid #0a83ca;
            border-radius: 999px;
            color: #0a83ca;
            font-size: 16px;
            font-weight: 600;
            background: transparent;
            transition: all 0.25s ease;
            margin-top: 10px; /* Instead of auto, effectively brings it closer to text */
          }

          .about-showcase-btn:hover {
            background: #0a83ca;
            color: #ffffff;
          }

          .about-showcase-visuals {
            display: flex;
            flex-direction: column;
            gap: 28px;
            align-items: stretch;
            height: 100%;
            justify-content: space-between;
          }

          .about-showcase-badges {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 18px;
            flex-wrap: wrap;
          }

          .about-showcase-circle {
            width: 154px;
            height: 154px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0a83ca;
            flex: 0 0 auto;
          }

          .about-showcase-circle .logo-box {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .about-showcase-circle .logo-box img {
            max-width: 100%;
            opacity: 0.9;
          }

          .about-showcase-circle .text-inner {
            position: absolute;
            inset: 0;
          }

          .about-showcase-circle .text-inner svg {
            width: 100%;
            height: 100%;
            fill: #0a83ca;
          }

          .about-showcase-circle .text-inner text {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .about-showcase-plus {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #0a83ca;
            color: #ffffff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 700;
            line-height: 1;
            flex: 0 0 auto;
          }

          .about-showcase-experience {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #0a83ca;
            flex-wrap: wrap;
          }

          .about-showcase-experience .number {
            font-size: clamp(48px, 6vw, 76px);
            line-height: 0.9;
            font-weight: 800;
            -webkit-text-stroke: 3px #0a83ca;
            color: transparent;
          }

          .about-showcase-experience .label {
            padding-top: 0;
            font-size: 18px;
            line-height: 1.25;
            font-weight: 500;
          }

          .about-showcase-experience .label span {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 10px;
            background: #0a83ca;
            color: #ffffff;
            font-weight: 700;
            margin-bottom: 6px;
          }

          .about-showcase-team {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .about-showcase-card {
            position: relative;
            min-height: 280px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            background: #fff;
          }

          .about-showcase-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            border-radius: 16px;
          }

          .about-showcase-card::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(10, 131, 202, 0.95) 0%, rgba(10, 131, 202, 0.6) 20%, transparent 45%);
            border-radius: 16px;
            pointer-events: none;
          }

          .about-showcase-card-content {
            position: absolute;
            inset: auto 0 0 0;
            z-index: 2;
            padding: 28px 24px 24px;
            text-align: center;
            color: #ffffff;
          }

          .about-showcase-card-content h5 {
            color: #ffffff;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 6px;
          }

          .about-showcase-card-content p {
            color: rgba(255, 255, 255, 0.88);
            font-size: 15px;
            margin-bottom: 0;
          }

          @media (max-width: 1199px) {
            .about-showcase-layout {
              grid-template-columns: 1fr;
              gap: 38px;
            }

            .about-showcase-copy {
              padding-right: 0;
            }
          }

          @media (max-width: 767px) {
            .about-showcase-title {
              font-size: 40px;
              margin-bottom: 28px;
            }

            .about-showcase-text {
              font-size: 16px;
              line-height: 1.8;
            }

            .about-showcase-btn {
              width: 100%;
              min-width: 0;
              font-size: 18px;
            }

            .about-showcase-badges {
              gap: 14px;
            }

            .about-showcase-circle {
              width: 126px;
              height: 126px;
            }

            .about-showcase-plus {
              width: 44px;
              height: 44px;
              font-size: 24px;
            }

            .about-showcase-experience .number {
              font-size: 76px;
            }

            .about-showcase-experience .label {
              font-size: 18px;
            }

            .about-showcase-team {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
            }

            .about-showcase-card {
              min-height: 220px;
            }

            .about-showcase-card-content h5 {
              font-size: 15px;
            }

            .about-showcase-card-content p {
              font-size: 12px;
            }
          }
        `}
      </style>
      <div className="container" style={{ padding: '24px 15px' }}>
        <div className="about-showcase-section" style={{ 
          animation: isVisible ? 'fadeUp 1s ease-out forwards' : 'none', 
          opacity: 0, 
          padding: 0 
        }}>
          <div className="about-showcase-layout">
            <div className="about-showcase-copy">
              <div className="title-area">
                <div className="sub-title">{subtitle}</div>
                <h2 className="about-showcase-title" style={{ fontSize: '2.1vw', fontWeight: 600 }}>
                  {isVisible ? typedTitle : ''}
                  {isVisible && typedTitle.length < plainTitle.length && (
                    <span className="typing-cursor" />
                  )}
                </h2>
              </div>
              <h5 className="about-showcase-since">{subtitle2 ? subtitle2.charAt(0).toUpperCase() + subtitle2.slice(1).toLowerCase() : ''}</h5>
              <p className="about-showcase-text">{parse(content)}</p>
              <Link to={buttonLink} className="about-showcase-btn" onClick={() => sessionStorage.setItem("scrollTo", "equipe-formateurs")}>
                  {btnname}
                  <i className="bi bi-arrow-right"></i>
                </Link>
            </div>

            <div className="about-showcase-visuals">
              <div className="about-showcase-team">
                {showcaseMembers.map((member, index) => (
                  <article className="about-showcase-card" key={`${member.name}-${index}`}>
                    <img
                      className="image"
                      src={member.image}
                      alt={member.name}
                      onError={handleImageError}
                    />
                    <div className="about-showcase-card-content">
                      <h5>{member.name}</h5>
                      <p>{member.role}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="about-showcase-badges">
                <div className="about-showcase-plus">+</div>
                <div className="about-showcase-experience">
                  <div className="number">{expyear}</div>
                  <div className="label">{exptitle ? parse(exptitle) : "années d'expérience"}</div>
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