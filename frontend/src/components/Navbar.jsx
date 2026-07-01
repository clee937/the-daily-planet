import LogoutButton from "../components/LogoutButton";
import logo from "../assets/the_daily_planet_logo.png";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
    const activeClass = ({ isActive }) => `navbar-link ${isActive ? "active" : ""}`;

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src={logo} alt="logo" className="navbar-logo" />
            </div>
            {isLoggedIn ? (
                <>
                    <div className="navbar-centre">
                        <NavLink to="/" className={activeClass}>Home</NavLink>
                        <NavLink to="/iss" className={activeClass}>ISS</NavLink>
                        <NavLink to="/astronomy" className={activeClass}>Visible Objects</NavLink>
                        <NavLink to="/favourites" className={activeClass}>Favourites</NavLink>
                        <NavLink to="/profile" className={activeClass}>Profile</NavLink>
                    </div>
                    <div className="navbar-right">
                        <LogoutButton setIsLoggedIn={setIsLoggedIn} />
                    </div>
                </>
            ) : (
                <>
                    <div className="navbar-centre">
                        <NavLink to="/" className={activeClass}>Home</NavLink>
                        <NavLink to="/iss" className={activeClass}>ISS</NavLink>
                        <NavLink to="/astronomy" className={activeClass}>Visible Objects</NavLink>
                    </div>
                    <div className="navbar-right">
                        <NavLink to="/login" className={activeClass}>Log In</NavLink>
                        <NavLink to="/signup" className={activeClass}>Sign Up</NavLink>
                    </div>
                </>
            )}
        </nav>
    );
}

export default Navbar;