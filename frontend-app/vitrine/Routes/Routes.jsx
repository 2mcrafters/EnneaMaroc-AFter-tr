import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import ContactPage from "../Pages/ContactPage";
import Découvrir from "../Pages/Decouvrir";
import Approfondir from "../Pages/Approfondir";
import Transmettre from "../Pages/Transmettre";
import Ecole from "../Pages/Ecole";
import Solution from "../Pages/Solution";
import Agenda from "../Pages/Agenda";
import PageInfo from "../Pages/PageInfo";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      { index: true, element: <Home /> },
      { path: "contact", element: <ContactPage /> },
      { path: "ecole", element: <Ecole /> },
      { path: "découvrir", element: <Découvrir /> },
      { path: "approfondir", element: <Approfondir /> },
      { path: "transmettre", element: <Transmettre /> },
      { path: "solution", element: <Solution /> },
      { path: "agenda", element: <Agenda /> },
      { path: "page", element: <PageInfo /> },
    ],
  },
]);
