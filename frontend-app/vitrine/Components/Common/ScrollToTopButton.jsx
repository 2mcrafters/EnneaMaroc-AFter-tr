import React from "react";
import { FaArrowUp } from "react-icons/fa";

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = React.useState(false);
  const scrollTimeout = React.useRef(null);

  React.useEffect(() => {
    const onScroll = () => {
      if (scrollTimeout.current) {
        window.cancelAnimationFrame(scrollTimeout.current);
      }

      scrollTimeout.current = window.requestAnimationFrame(() => {
        setIsVisible(window.scrollY > 360);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      if (scrollTimeout.current) {
        window.cancelAnimationFrame(scrollTimeout.current);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToTop = React.useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Revenir en haut de la page"
      style={{
        position: "fixed",
  insetInlineEnd: 20,
  insetBlockEnd: 20,
  width: 56,
  height: 56,
  borderRadius: "50%",
        border: "none",
  background: "linear-gradient(135deg, #64508d 0%, #4e3a72 100%)",
        color: "#fff",
  fontSize: 18,
  boxShadow: "0 16px 36px rgba(225, 55, 52, 0.24)",
        cursor: "pointer",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(16px)",
        visibility: isVisible ? "visible" : "hidden",
        transition: "opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FaArrowUp size={20} aria-hidden="true" />
    </button>
  );
}

export default ScrollToTopButton;
