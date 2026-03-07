import Header1 from "../Components/Header/Header1";
import HeroBanner1 from "../Components/HeroBanner/HeroBanner1";
import About1 from "../Components/About/About1";
import Choose1 from "../Components/Choose/Choose1";
import Process from "../Components/Process/Process";
import Testimonial from "../Components/Testimonial/Testimonial";
import Footer from "../Components/Footer/Footer";

export default function Home() {
  return (
    <>
      <Header1 />
      <main>
        <HeroBanner1 />
        <Choose1 />
        <About1
          subtitle="À propos"
          title="EnnéaMaroc, une école pour se comprendre et grandir"
          rotatetext="EnnéaMaroc • Coaching • Ennéagramme • Formation • "
          subtitle2="Depuis"
          content="Une approche structurée et humaine pour développer la conscience de soi, améliorer les relations et accompagner le changement."
          btnname="Nous contacter"
          expyear="18"
          exptitle="ans d'expérience"
          avatar="/assets/imgss001/avatar.png"
          name="EnnéaMaroc"
          designation="Équipe"
        />
        <Process />
        <Testimonial />
      </main>
      <Footer />
    </>
  );
}
