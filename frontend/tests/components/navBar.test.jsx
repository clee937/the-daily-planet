import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import Navbar from "../../src/components/Navbar";

describe("Navbar Component", () => {
    it("renders the logo with correct alt text", () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        const logo = screen.getByAltText("logo");
        expect(logo).toBeTruthy();
    });

    it("contains and triggers the log out button, clearing the localStorage on click", async () => {
        localStorage.setItem("token", "fake-token");

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        const user = userEvent.setup();
        const logoutButton = screen.getByRole("button", { name: /log out/i });
        expect(logoutButton).toBeDefined();
        await user.click(logoutButton);

        expect(localStorage.getItem("token")).toBeNull();
    });
});