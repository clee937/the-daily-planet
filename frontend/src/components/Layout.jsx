import { Outlet } from "react-router-dom";
import Navbar from "./NavBar";
import { useState } from "react";

function Layout() {
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("token") !== null);
    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Outlet context={{ isLoggedIn, setIsLoggedIn }} />
            <footer className="hud-footer">
                <span>THE DAILY PLANET</span>
                <span>// BUILT BY TEAM 2026: A Coding Odyssey </span>
            </footer>
        </>
    );
}

export default Layout;