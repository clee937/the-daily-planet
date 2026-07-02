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
          <p className="astronomy-note">🛸 Rover's knowledge has a cutoff date and may not reflect current space news. Always verify with NASA for the latest information.</p>
        </div>
      </div>
    </div>
  );
}
