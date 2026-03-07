import { Outlet } from 'react-router-dom';
import Header1 from '../Components/Header/Header1';
import Footer from '../Components/Footer/Footer';
import ScrollToTopButton from "../Components/Common/ScrollToTopButton";

const Main = () => {
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