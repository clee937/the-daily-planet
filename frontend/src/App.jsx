import { createBrowserRouter, RouterProvider, } from "react-router-dom";

import "./App.css";
import Layout from "./components/Layout";
import { HomePage } from "./pages/Home/HomePage";
import { LoginPage } from "./pages/Login/LoginPage";
import { SignupPage } from "./pages/Signup/SignupPage";
import AstronomyPage from "./pages/Astronomy/AstronomyPage";
import { FavouritesPage } from "./pages/Profile/FavouritesPage";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import { ISSPage } from "./pages/ISS/ISSPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// docs: https://reactrouter.com/en/main/start/overview
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignupPage />,
      },
      {
        path: "/astronomy",
        element: <AstronomyPage />,
      },
      {
        path: "/favourites",
        element: <FavouritesPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/iss",
        element: <ISSPage />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App;
