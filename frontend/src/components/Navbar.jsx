import LogoutButton from "../components/LogoutButton";
import logo from "../assets/the_daily_planet_logo.png";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./Navbar.css";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
    const activeClass = ({ isActive }) => `navbar-link ${isActive ? "active" : ""}`;
    const location = useLocation();
    const isProfileActive = location.pathname === "/profile" || location.pathname === "/favourites";

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


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
                            <NavLink to="/profile" className={activeClass}>My Profile</NavLink>
                        </div>
                    <div className="navbar-right">
                        <div className="profile-dropdown" ref={dropdownRef}>
                            <button
                                className={`profile-button navbar-link ${isProfileActive ? "active" : ""}`}
                                onClick={() => setDropdownOpen((prev) => !prev)}
                            >
                                Profile ▾
                            </button>
                            {dropdownOpen && (
                                <div className="dropdown-menu">
                                    <NavLink
                                        to="/favourites"
                                        className={activeClass}
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Favourites
                                    </NavLink>
                                    <NavLink
                                        to="/profile"
                                        className={activeClass}
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Settings
                                    </NavLink>
                                </div>
                            )}
                            <LogoutButton setIsLoggedIn={setIsLoggedIn} />
                        </div>
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
