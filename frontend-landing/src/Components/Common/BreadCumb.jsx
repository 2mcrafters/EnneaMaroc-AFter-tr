import { Link } from "react-router-dom";
import parse from "html-react-parser";

const buildBackgroundStyle = (imagePath, overlayColor) => {
  const style = {};

  if (overlayColor) {
    style["--breadcrumb-overlay-color"] = overlayColor;
  }

  if (imagePath) {
    style.backgroundImage = `url("${imagePath}")`;
    style.backgroundPosition = "center";
    style.backgroundSize = "cover";
    style.backgroundRepeat = "no-repeat";
  }

  return Object.keys(style).length ? style : undefined;
};

const BreadCumb = ({
  bg,
  Title,
  Content,
  overlayColor = "rgba(10, 131, 202, 0.7)",
}) => {
  const backgroundStyle = buildBackgroundStyle(bg, overlayColor);

  return (
    <section className="breadcrumb-section">
      <div className="bg bg-image" style={backgroundStyle}></div>
      <div className="container">
        <div className="title-outer">
          <div className="page-title">
            <h2 className="title">{Title}</h2>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Acc</Link>
              </li>
              <li>{Title}</li>
            </ul>
          </div>
          <div className="text">
            <div className="icon">
              <i className="icon-arrow-up-right"></i>
            </div>
            <p style={{ color: "#fff" }}>{parse(Content)}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BreadCumb;
