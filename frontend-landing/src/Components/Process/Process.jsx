import SectionTitle from "../Common/SectionTitle";
import data from "../../Data/process1.json";
import parse from "html-react-parser";

const Process = () => {
  const items = data.slice(0, 2);

  return (
    <section
      className="process-section space bg-white overflow-hidden"
      id="process-section"
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
                <span className="process-badge">{item.number}</span>
              </div>
              <h4 className="process-title">{parse(item.title)}</h4>
              <p className="process-description">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
