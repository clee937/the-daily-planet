import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import LogoutButton from "../../src/components/LogoutButton";

// mocking React Routers use Navigate function
vi.mock("react-router-dom", () => {
    const navigateMock = vi.fn();
    const useNavigateMock = () => navigateMock;
    return { useNavigate: useNavigateMock };
});

// Mocking toast
vi.mock("react-toastify", () => ({
    toast: { success: vi.fn() },
}));

describe("LogoutButton", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.setItem("token", "fake-token");
    });

    test("renders a log out button", () => {
        render(<LogoutButton setIsLoggedIn={vi.fn()} />);
        expect(screen.getByRole("button", { name: /log out/i })).toBeTruthy();
    });

    test("clears the token from localStorage on click", async () => {
    const user = userEvent.setup();
    render(<LogoutButton setIsLoggedIn={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /log out/i }));

    expect(localStorage.getItem("token")).toBeNull();
    });

    test("calls setIsLoggedIn with false on click", async () => {
        const user = userEvent.setup();
        const setIsLoggedInMock = vi.fn();
        render(<LogoutButton setIsLoggedIn={setIsLoggedInMock} />);

        await user.click(screen.getByRole("button", { name: /log out/i }));

        expect(setIsLoggedInMock).toHaveBeenCalledWith(false);
    });

    test("shows a success toast on logout", async () => {
        const user = userEvent.setup();
        render(<LogoutButton setIsLoggedIn={vi.fn()} />);

        await user.click(screen.getByRole("button", { name: /log out/i }));

        expect(toast.success).toHaveBeenCalled();
    });

    test("navigates to / on logout", async () => {
        const user = userEvent.setup();
        render(<LogoutButton setIsLoggedIn={vi.fn()} />);
        const navigateMock = useNavigate();

        await user.click(screen.getByRole("button", { name: /log out/i }));

        expect(navigateMock).toHaveBeenCalledWith("/");
    });
});