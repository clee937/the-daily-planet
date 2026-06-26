import { Link } from "react-router-dom";

import "./HomePage.css";
import PictureOfTheDay from "../../components/PictureOfTheDay";
import { Chatbot } from "../../components/Chatbot";

export function HomePage() {
  return (
    <div className="home">
      <h1>Welcome to The Daily Planet!</h1>
      <Link to="/signup">Sign Up</Link>
      <Link to="/login">Log In</Link>
      <PictureOfTheDay />
      <Chatbot />
    </div>
  );
}
