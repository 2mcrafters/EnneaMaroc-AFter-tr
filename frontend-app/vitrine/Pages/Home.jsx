import Seo from "../Components/Seo/Seo";
import About1 from "../Components/About/About1";
import BlogGrid from "../Components/Blog/BlogGrid";
import Choose1 from "../Components/Choose/Choose1";
import ContactInfo1 from "../Components/ContactInfo/ContactInfo1";
import HeroBanner1 from "../Components/HeroBanner/HeroBanner1";
import Process from "../Components/Process/Process";
import Process3 from "../Components/Process/Process3";
import Testimonial from "../Components/Testimonial/Testimonial";
// import chafik from "../../../assets/imgss001/chafik.jpg";

const Home = () => {
  return (
    <main role="main">
      <Seo page="home" path="/" />
      <div>
        <HeroBanner1
          videotext="<strong>Regarder</strong><br>l’histoire de Bentol"
          title="Libérer votre potentiel avec EnnéaMaroc"
          btnname="Parlons-en avec l’Ennéagramme "
          inscriptionUrl="/app/#/login"
          RegisterUrl="/app/#/signup"
          //   mainimg="/assets/imgss001/coaching (25).jpg"
          Clientnumber="5k"
          Client="Nous conseillons des clients "
          customers="Clients satisfaits"
          rating="4.8"
          review="(120K avis)"
        ></HeroBanner1>
        {/* <Marquee></Marquee> */}
        <About1
          subtitle=""
          title=" <b> Votre école </b>   de connaissance de soi, de transformation intérieure et d’autonomie."
          rotatetext="Se découvrir – Se libérer – Être autonome."
          subtitle2="DEPUIS 2006"
          content="Nous accompagnons les particuliers et les entreprises sur le chemin de la connaissance de soi. Grâce à l'Ennéagramme et au coaching, nous facilitons la communication et renforçons la cohésion d'équipe pour une transformation durable et autonome."
          btnname="Découvrir l'équipe"
          buttonLink="/ecole"
          expyear="20"
          exptitle="<span>années</span><br />d’expérience"
          avatar="/assets/imgss001/chafik.jpg"
          name="Chafik Harti"
          designation="Co-fondateur"
          teamMembers={[
            {
              image: "/assets/imgss001/chafik.jpg",
              name: "Chafik Harti",
              role: "Co-fondateur",
            },
            {
              image: "/assets/imgss001/freid (1).jpg",
              name: "Yousra Andalib",
              role: "Co-fondatrice",
            },
          ]}
        ></About1>
        {/* <Partner1></Partner1> */}
        {/* <Services1></Services1> */}

        <Testimonial></Testimonial>
        <Process></Process>
        <Process3></Process3>
        <Choose1></Choose1>
        <BlogGrid></BlogGrid>

        {/* <Pricing1></Pricing1> */}

        {/* <Marquee></Marquee> */}

        {/* Image Banner before Contact Section */}
        <section
          style={{
            position: "relative",
            width: "100%",
            height: "200px",
            overflow: "hidden",
            margin: 0,
            padding: 0,
          }}
        >
          <img
            src="/assets/imgss001/coaching (10).jpg"
            alt="Banner"
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Blue overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(10, 131, 202, 0.6)",
              pointerEvents: "none",
            }}
          />
        </section>

        <ContactInfo1></ContactInfo1>

        {/* <ContactList></ContactList> */}
        {/* <Nwesletter addclass="newsletter-section"></Nwesletter> */}
      </div>
    </main>
  );
};

export default Home;
