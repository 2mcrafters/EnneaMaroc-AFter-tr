import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header1 from '../Components/Header/Header1';
import Footer from '../Components/Footer/Footer';
import ScrollToTopButton from "../Components/Common/ScrollToTopButton";

const Main = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    // Give DOM time to paint after route change
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('section:not(#about-section)');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('section-animate');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      sections.forEach((s) => {
        s.classList.remove('section-animate');
        observer.observe(s);
      });
      return () => observer.disconnect();
    }, 120);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="main-page-area">
      <Header1></Header1>
      <Outlet></Outlet>
      <Footer></Footer>
      <ScrollToTopButton />
    </div>
  );
};

export default Main;