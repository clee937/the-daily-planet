import "./HomePage.css";
import PictureOfTheDay from "../../components/PictureOfTheDay";
import { Chatbot } from "../../components/Chatbot";
import "../../Hud.css";

export function HomePage() {
  const token = localStorage.getItem("token");
  return (
    <div className="home">
      <h1>Welcome to The Daily Planet!</h1>

      <div className="hud-main">
        <PictureOfTheDay token={token} />
        <div className="hud-sidebar">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}
