// import { Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import logo from "../assets/the_daily_planet_logo.png";
import "./Navbar.css";

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src={logo} alt="logo" className="navbar-logo" />
            </div>
            <div className="navbar-centre">
                <a href="#" className="nav-link">Home</a>
                <a href="#" className="nav-link">Profile</a>
            </div>
            <div className="navbar-right">
                <LogoutButton />
            </div>
        </nav>
    );
}

export default Navbar;