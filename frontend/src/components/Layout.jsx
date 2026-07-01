import { Outlet } from "react-router-dom";
import Navbar from "./NavBar";
import { useState } from "react";

function Layout() {
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("token") !== null);
    return (
        <div className="app-shell">
            <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <main className="app-content">
                <Outlet context={{ isLoggedIn, setIsLoggedIn }} />
            </main>
            <footer className="hud-footer">
                <span>THE DAILY PLANET</span>
                <span>// BUILT BY TEAM 2026; A Coding Odyssey </span>
            </footer>
        </div>
    );
}

export default Layout;