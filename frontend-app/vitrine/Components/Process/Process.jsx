import SectionTitle from "../Common/SectionTitle";
import data from "../../Data/process1.json";
// Render potential HTML in item.title without external dependency

const Process = () => {
  const items = data.slice(0, 2);

  return (
    <section
      className="process-section bg-white"
      id="enneagramme-section"
      style={{ padding: "80px 0" }}
    >
      <div className="container">
        <div className="title-area three text-left">
          <SectionTitle
            SubTitle="AU CŒUR DE L'ENNÉAGRAMME"
            Title="L'ennéagramme est un outil puissant qui vous aide à mieux comprendre votre personnalité"
          />
        </div>
        <div className="process-grid">
          {items.map((item, index) => (
            <div
              className={`process-card wow ${
                index % 2 ? "fadeInRight" : "fadeInLeft"
              }`}
              key={index}
            >
              <div className="process-card-header">
                <div className="process-icon-wrap">
                  <i className={item.icon}></i>
                </div>
              </div>
              <h4
                className="process-title"
                dangerouslySetInnerHTML={{ __html: item.title }}
              />
              <p
                className="process-description"
                style={{ textAlign: "justify" }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        {/* Quote block below cards */}
        <div style={{
          marginTop: "32px",
          padding: "20px 36px",
          borderRadius: "16px",
          background: "#64508d",
          border: "none",
          textAlign: "center",
        }}>
          <p style={{
            margin: 0,
            fontSize: "clamp(15px, 1.4vw, 18px)",
            fontWeight: 500,
            color: "#ffffff",
            lineHeight: 1.7,
            fontStyle: "italic",
          }}>
            « L'Ennéagramme est une invitation à vivre pleinement, à se rencontrer soi-même
            et à rencontrer l'autre, dans toute la richesse de l'humanité. »
          </p>
        </div>
      </div>
    </section>
  );
};

export default Process;
