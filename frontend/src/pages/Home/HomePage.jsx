import { Link } from "react-router-dom";
import "./HomePage.css";
import PictureOfTheDay from "../../components/PictureOfTheDay";
import { Chatbot } from "../../components/Chatbot";

export function HomePage() {
  const token = localStorage.getItem("token");
  return (
    <div className="home">
      <h1>Welcome to The Daily Planet!</h1>
      <PictureOfTheDay token={token} />
      <Chatbot />
    </div>
  );
}
