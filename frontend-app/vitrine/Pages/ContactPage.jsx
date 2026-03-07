import Seo from "../Components/Seo/Seo";
import BreadCumb from "../Components/Common/BreadCumb";
import ContactInfo3 from "../Components/ContactInfo/ContactInfo3";

const ContactPage = () => {
  return (
    <main role="main">
      <Seo page="contact" path="/contact" />
      <BreadCumb
        bg="/assets/imgss001/coaching (23).jpg"
        Title="Contactez-nous"
        Content="Parlons de votre parcours avec l’Ennéagramme
Que vous débutiez ou souhaitiez approfondir, notre équipe répond à vos questions,<br> vous aide à choisir le bon module et vous informe sur les dates, tarifs et prérequis.  "
      ></BreadCumb>
      <ContactInfo3></ContactInfo3>
    </main>
  );
};

export default ContactPage;
