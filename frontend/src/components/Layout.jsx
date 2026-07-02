import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./NavBar";
import { toast } from "react-toastify";

function Layout() {
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("token") !== null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) return;
        let inactivityTimer;
        const logout = () => {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            toast.info(<>Your session has expired due to inactivity.<br/>Please log in again.</>);
            navigate("/login");
        };
        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(logout, 10 * 60 * 1000);
        };
        const events = [
            "mousemove",
            "mousedown",
            "keydown",
            "scroll",
            "touchstart",
        ];
        events.forEach((event) => window.addEventListener(event, resetTimer));
        resetTimer();
        return () => {
            clearTimeout(inactivityTimer);
            events.forEach((event) => window.removeEventListener(event, resetTimer));
        };
    }, [isLoggedIn, navigate]);

    return (
        <div className="app-shell">
            <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <main className="app-content">
                <Outlet context={{ isLoggedIn, setIsLoggedIn }} />
            </main>
            <footer className="hud-footer">
                <span>THE DAILY PLANET</span>
                <span>BUILT BY TEAM // 2026: A CODING ODYSSEY</span>
            </footer>
        </div>
    );
}

export default Layout;