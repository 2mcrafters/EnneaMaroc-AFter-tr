import { Link } from "react-router-dom";
import blogData from "../../Data/blogData.json";
import { useState, useEffect } from "react";

// Normalize links like "blog-details" -> "/blog/blog-details"
const toPath = (s) => {
  if (!s) return "/blog/blog-details";
  if (s.startsWith("http")) return s; // (optional) external
  if (s.startsWith("/")) return s;
  if (s.startsWith("")) return `/${s}`;
  return `/blog/${s}`;
};

// Hook to detect screen size
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

const cardShadow = "0 6px 24px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.06)";

const BlogCard = ({ blog }) => {
  const isMobile = useMediaQuery("(max-width: 576px)");

  const btnBase = {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    width: "100%",
    padding: isMobile ? "8px 12px" : "10px 14px",
    textAlign: "center",
    marginTop: "16px",
    backgroundColor: "#0a83ca",
    color: "#fff",
    borderRadius: "15px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: isMobile ? "13px" : "14px",
    transition: "background-color .2s ease",
  };

  return (
    <article
      className="blog-single-box equal-height-card"
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: cardShadow,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="inner-box"
        style={{
          position: "relative",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Full-card clickable overlay */}
        <Link
          to={toPath(blog.link)}
          aria-label={`Voir l'article: ${blog.title}`}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        />

        {/* Image + category */}
        <h1
          style={{
            fontSize: isMobile ? "25px" : "25px",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {blog.category}
        </h1>
        <div className="blog-image" style={{ position: "relative" }}>
          <img
            src={blog.img}
            alt={blog.title || "Blog Image"}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>

        {/* Content */}
        <div
          className="blog-content"
          style={{
            position: "relative",
            zIndex: 2,
            padding: isMobile ? "16px" : "20px",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          {/* Title */}
          <h4
            className="title"
            style={{
              margin: 0,
              whiteSpace: "pre-line",
              fontSize: isMobile ? "16px" : "18px",
              lineHeight: 1.4,
              wordBreak: "break-word",
            }}
          >
            {blog.title}
          </h4>

          {/* Divider */}
          <div className="pt-2 pb-2" style={{ margin: 0 }}>
            <div
              className="border dark"
              style={{ height: 1, background: "rgba(0,0,0,.08)", margin: 0 }}
            />
          </div>

          {/* Description */}
          <p
            style={{
              color: "gray",
              margin: 0,
              fontSize: isMobile ? "13px" : "14px",
              lineHeight: 1.6,
              wordBreak: "break-word",
              flexGrow: 1,
            }}
            className="mb-10"
          >
            {blog.para}
          </p>

          {/* Button */}
          <Link
            to={toPath(blog.link)}
            style={{ ...btnBase, marginTop: "auto" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc3545")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#0a83ca")
            }
          >
            <span style={{ gridColumn: 2, justifySelf: "center" }}>
              Continuer la lecture
            </span>
            <span
              aria-hidden="true"
              style={{
                gridColumn: 3,
                justifySelf: "end",
                transform: "translateY(-1px)",
              }}
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};

// Horizontal card for solution section
const HorizontalCard = ({ blog }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isSmall = useMediaQuery("(max-width: 576px)");

  const btnBase = {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    width: "100%",
    padding: isSmall ? "6px 10px" : isMobile ? "8px 12px" : "10px 14px",
    textAlign: "center",
    marginTop: isMobile ? "8px" : "12px",
    backgroundColor: "#0a83ca",
    color: "#fff",
    borderRadius: "15px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: isSmall ? "11px" : isMobile ? "12px" : "14px",
    transition: "background-color .2s ease",
  };

  return (
    <article
      className="blog-single-box-horizontal"
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: cardShadow,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      <div
        className="inner-box"
        style={{
          position: "relative",
          cursor: "pointer",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
        }}
      >
        {/* Full-card clickable overlay */}
        <Link
          to={toPath(blog.link)}
          aria-label={`Voir: ${blog.title}`}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        />

        {/* Image on left (or top on mobile) */}
        <div
          className="blog-image-horizontal"
          style={{
            flex: isMobile ? "0 0 auto" : "0 0 40%",
            position: "relative",
            overflow: "hidden",
            minHeight: isMobile ? "200px" : "auto",
          }}
        >
          <img
            src={blog.img}
            alt={blog.title || "Card Image"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            className="category-tag"
            style={{
              position: "absolute",
              top: isSmall ? 8 : 12,
              left: isSmall ? 8 : 12,
              padding: isSmall ? "4px 8px" : "6px 14px",
              background: "#0a83ca",
              color: "#fff",
              borderRadius: 8,
              fontSize: isSmall ? "10px" : isMobile ? "11px" : "13px",
              fontWeight: 600,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "calc(100% - 24px)",
            }}
          >
            {blog.category}
          </div>
        </div>

        {/* Content on right (or bottom on mobile) */}
        <div
          className="blog-content-horizontal"
          style={{
            flex: "1",
            padding: isSmall ? "16px" : isMobile ? "20px" : "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div>
            {/* Title */}
            <h4
              className="title"
              style={{
                margin: 0,
                whiteSpace: "pre-line",
                fontSize: isSmall ? "15px" : isMobile ? "16px" : "18px",
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              {blog.title}
            </h4>

            {/* Divider */}
            <div style={{ margin: "16px 0" }}>
              <div
                className="border dark"
                style={{ height: 1, background: "rgba(0,0,0,.08)", margin: 0 }}
              />
            </div>

            {/* Description */}
            <p
              style={{
                color: "gray",
                margin: 0,
                fontSize: isSmall ? "12px" : isMobile ? "13px" : "14px",
                lineHeight: 1.8,
                wordBreak: "break-word",
                textAlign: "justify",
              }}
              className="mb-10"
            >
              {blog.para}
            </p>
          </div>

          {/* Button */}
          <Link
            to={toPath(blog.link)}
            style={btnBase}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc3545")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#0a83ca")
            }
          >
            <span style={{ gridColumn: 2, justifySelf: "center" }}>
              En savoir plus
            </span>
            <span
              aria-hidden="true"
              style={{
                gridColumn: 3,
                justifySelf: "end",
                transform: "translateY(-1px)",
              }}
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};

const BlogGrid = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isSmall = useMediaQuery("(max-width: 576px)");

  // Show only 3 cards
  const items = blogData.slice(0, 3);
  const solutionCards = [
    {
      category: "Managers",
      title: "Programme Ennéagramme –\nManagers en évolution",
      para: "Aligner leadership, tête, cœur et corps au service d'un management conscient et inspirant.",
      link: "/solution#entreprises",
      img: "/assets/imgss001/coaching (10).jpg",
    },
    {
      category: "Équipes",
      title: "Programme Ennéagramme –\nÉquipes opérationnelles",
      para: "Transformer les dynamiques collectives et faire grandir la coopération au quotidien.",
      link: "/solution#equipes",
      img: "/assets/imgss001/coaching (14).jpg",
    },
    {
      category: "Jeunes talents",
      title: "Programme Ennéagramme –\nJeunes talents & Hauts potentiels",
      para: "Révéler ses talents, se projeter avec confiance et prendre sa place de jeune leader.",
      link: "/solution#jeunes",
      img: "/assets/imgss001/freid (1).jpg",
    },
    {
      category: "Espace Dialogue",
      title: "Espace Dialogue :\nPanels & Ateliers d'échange",
      para: "Un laboratoire vivant d'échanges humains pour approfondir l'Ennéagramme en collectif.",
      link: "/solution#dialogue",
      img: "/assets/imgss001/coaching (17).jpg",
    },
  ];

  return (
    <section
      id="blog-section"
      className="blog-section space"
      style={{
        background: "#0a83ca",
        padding: isSmall ? "40px 0" : isMobile ? "50px 0" : "60px 0",
      }}
    >
      <div className="container" style={{ padding: isSmall ? "0 15px" : "0" }}>
        {/* Title + description for the section */}
        <div
          className="title-area three text-center"
          style={{ marginBottom: isMobile ? 20 : 24 }}
        >
          <div
            className="sub-title"
            style={{
              display: "inline-block",
              padding: isSmall ? "4px 10px" : "6px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,.15)",
              color: "#fff",
              fontWeight: 700,
              letterSpacing: ".06em",
              fontSize: isSmall ? "12px" : "14px",
            }}
          >
            Nos Parcours
          </div>
          <h2
            className="sec-title"
            style={{
              color: "#fff",
              marginTop: 12,
              fontWeight: 800,
              fontSize: isSmall ? "20px" : isMobile ? "24px" : "32px",
              lineHeight: 1.3,
              padding: isSmall ? "0 10px" : "0",
            }}
          >
            AU CŒUR DE{" "}
            <span
              style={{
                fontWeight: 900,
              }}
            >
              {" "}
              L'ENNÉAGRAMME{" "}
            </span>{" "}
            ET DE SES PRATIQUES
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,.9)",
              maxWidth: 720,
              margin: "10px auto 0",
              fontSize: isSmall ? "11px" : isMobile ? "12px" : "14px",
              lineHeight: 1.5,
              padding: isSmall ? "0 10px" : "0 20px",
              letterSpacing: isSmall ? "0.03em" : "0.05em",
            }}
          >
            VALIDATION SCIENTIFIQUE - INNOVATION PÉDAGOGIQUE - PROFESSIONNALISME
            ÉTHIQUE
          </p>
        </div>

        <div className="row gx-25 gy-25">
          {items.map((blog, index) => (
            <div className="col-lg-4 col-md-6 col-sm-6 d-flex" key={index}>
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: isMobile ? 32 : 56,
            padding: isSmall
              ? "24px 16px"
              : isMobile
              ? "32px 24px"
              : "40px 32px",
            borderRadius: isMobile ? 20 : 28,
            background: "rgba(6, 32, 73, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 24px 60px rgba(4, 20, 45, 0.45)",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: isSmall ? "16px" : isMobile ? "20px" : "26px",
              fontWeight: 800,
              letterSpacing: isSmall
                ? "0.06em"
                : isMobile
                ? "0.08em"
                : "0.12em",
              textTransform: "uppercase",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            SOLUTION (DÉRIVER/ EXTENSION):
            <span
              style={{
                display: "block",
                fontSize: isSmall ? "11px" : isMobile ? "13px" : "16px",
                fontWeight: 600,
                letterSpacing: isSmall
                  ? "0.12em"
                  : isMobile
                  ? "0.18em"
                  : "0.24em",
                marginTop: isSmall ? 6 : 10,
              }}
            >
              Autres programmes : Panels – leadership – …..
            </span>
          </h3>

          <div
            className="row gx-25 gy-25"
            style={{
              marginTop: isSmall ? 20 : isMobile ? 28 : 36,
            }}
          >
            {solutionCards.map((card, index) => (
              <div className="col-lg-6 col-md-6 col-sm-12 d-flex" key={index}>
                <HorizontalCard blog={card} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <p
        style={{
          textAlign: "center",
          color: "rgba(255,255,255,.9)",
          maxWidth: 720,
          margin: isSmall
            ? "30px auto 0"
            : isMobile
            ? "40px auto 0"
            : "50px auto 0",
          fontSize: isSmall ? "11px" : isMobile ? "12px" : "14px",
          padding: isSmall ? "0 20px" : "0",
          letterSpacing: isSmall ? "0.03em" : "0.05em",
        }}
      >
        PARCOURS (Cycle – Certificat ) – ATELIERS – FORMATIONS PROFESSIONNELLES
      </p> */}
    </section>
  );
};

export default BlogGrid;
