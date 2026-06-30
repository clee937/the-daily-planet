import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import Navbar from "../../src/components/Navbar";
import { useState } from "react";

function NavbarWithState({ initialLoggedIn = false }) {
    const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);
    return <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />;
}

function renderNavbar(isLoggedIn = false) {
    return render(
        <MemoryRouter>
            <NavbarWithState initialLoggedIn={isLoggedIn} />
        </MemoryRouter>
    );
}

describe("Navbar Component", () => {
    it("renders the logo with correct alt text", () => {
        renderNavbar(false)

        const logo = screen.getByAltText("logo");
        expect(logo).toBeTruthy();
    });

    describe("when logged out", () => {
        it("shows the Log In link", () => {
            renderNavbar();
            expect(screen.getByRole("link", { name: /log in/i })).toBeTruthy();
        });
        it("shows the Sign Up link", () => {
            renderNavbar();
            expect(screen.getByRole("link", { name: /sign up/i })).toBeTruthy();
        });
        it("does not show the logout button", () => {
            renderNavbar();
            expect(screen.queryByRole("button", { name: /log out/i })).toBeNull();
        });
        it("does not show Profile button", () => {
            renderNavbar();
            expect(screen.queryByRole("button", { name: /profile/i })).toBeNull();
        });
        it("shows the Home link", () => {
            renderNavbar();
            expect(screen.getByRole("link", { name: /home/i })).toBeTruthy();
        });
        it("shows the ISS link", () => {
            renderNavbar();
            expect(screen.getByRole("link", { name: /iss/i })).toBeTruthy();
        });
    });

    describe("when logged in", () => {
        it("shows the logout button", () => {
            renderNavbar(true);
            expect(screen.getByRole("button", { name: /log out/i })).toBeTruthy();
        });
        it("shows the Profile button", () => {
            renderNavbar(true);
            expect(screen.getByRole("button", { name: /profile/i })).toBeTruthy();
        });
        it("does not show the Log In link", () => {
            renderNavbar(true);
            expect(screen.queryByRole("link", { name: /log in/i })).toBeNull();
        });
        it("does not show the Sign Up link", () => {
            renderNavbar(true);
            expect(screen.queryByRole("link", { name: /sign up/i })).toBeNull();
        });
        it("shows the Home link", () => {
            renderNavbar(true);
            expect(screen.getByRole("link", { name: /home/i })).toBeTruthy();
        });
        it("shows the ISS link", () => {
            renderNavbar(true);
            expect(screen.getByRole("link", { name: /iss/i })).toBeTruthy();
        });
    });

    describe("when logging out", () => {
        it("switches to the logged out state after clicking log out", async () => {
            //start with logged in navbar
            renderNavbar(true);
            expect(screen.getByRole("button", { name: /log out/i })).toBeTruthy();
            
            // click logout
            await userEvent.click(screen.getByRole("button", { name: /log out/i }));

            // logged out nav
            await screen.findByRole("link", { name: /log in/i });
            expect(screen.getByRole("link", { name: /sign up/i })).toBeTruthy();
        });
    });
});