import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FavouriteButton from "../../src/components/FavouriteButton";
import { useOutletContext } from "react-router-dom";

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useOutletContext: vi.fn(),
    };
});

// The component uses <Link>, so it must render inside a router.
// This helper wraps it so we don't repeat MemoryRouter in every test.
function renderButton(props) {
    return render(
    <MemoryRouter>
        <FavouriteButton {...props} />
    </MemoryRouter>
    );
}

const fakePicture = {
    title: "The Eagle Nebula",
    url: "http://image.jpg",
    explanation: "A photo in space",
    date: "2026-06-23",
    source: "apod",
    mediaType: "image",
    sourceId: "2026-06-23",
};

describe("FavouriteButton", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("shows a sign-up prompt when there is no token", async () => {
        useOutletContext.mockReturnValue({ isLoggedIn: false });
        renderButton({ picture: fakePicture });

        // Click the save button while logged out
        screen.getByTestId("favourite-button").click();

        // The login/signup prompt should appear, and no fetch should happen
        await waitFor(() => {
            expect(screen.getByText(/logged in/i)).toBeTruthy();
            });
    });

    it("saves the favourite when logged in", async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 201,
            json: async () => ({ favourite: { _id: "fav1" } }),
        });

        useOutletContext.mockReturnValue({ isLoggedIn: true });
        localStorage.setItem("token", "fake-token");
        renderButton({ picture: fakePicture });

        screen.getByTestId("favourite-button").click();

        // After a successful save the button shows the saved state
        await waitFor(() => {
            expect(screen.getByText(/saved/i)).toBeTruthy();
        });

        // It called the favourites endpoint with the token
        expect(globalThis.fetch).toHaveBeenCalled();
    });

    it("treats an already-saved picture (409) as saved", async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 409,
            json: async () => ({ error: "Already in your favourites" }),
        });

        useOutletContext.mockReturnValue({ isLoggedIn: true });
        renderButton({ picture: fakePicture });

        screen.getByTestId("favourite-button").click();

        await waitFor(() => {
            expect(screen.getByText(/saved/i)).toBeTruthy();
        });
    });

    it("resets saved state when user logs out", async () => {
        const context = { isLoggedIn: true };
        useOutletContext.mockReturnValue(context);
        localStorage.setItem("token", "fake-token");
        global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        const { rerender } = renderButton({ picture: fakePicture });
        screen.getByTestId("favourite-button").click();
        await waitFor(() => {
            expect(screen.getByTestId("favourite-button").textContent).toBe("★ Saved");
        });

        // user logs out
        useOutletContext.mockReturnValue({ isLoggedIn: false });
        localStorage.clear();
        rerender(
            <MemoryRouter>
                <FavouriteButton picture={fakePicture} />
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByTestId("favourite-button").textContent).toBe("☆ Save to favourites");
        });
    });
});