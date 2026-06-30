import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { toast } from "react-toastify";
import { FavouritesPage } from "../../src/pages/Profile/FavouritesPage";

// Mocking react-toastify
vi.mock("react-toastify", () => ({
    toast: { success: vi.fn() },
}));

const fakeFavourites = [
    {
        _id: "fav1",
        title: "The Eagle Nebula",
        imageUrl: "http://image.jpg",
    },
];

describe("FavouritesPage", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.setItem("token", "fake-token");
    });

    test("shows loading state initially", () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ favourites: [] }),
        });
        render(<FavouritesPage />);
        expect(screen.getByText("Loading your favourites…")).toBeTruthy();
    });

    test("shows message when there are no favourites", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ favourites: [] }),
        });
        render(<FavouritesPage />);
        await waitFor(() => {
            expect(screen.getByText(/no saved pictures yet/i)).toBeTruthy();
        });
    });

    test("displays favourites when loaded", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ favourites: fakeFavourites }),
        });
        render(<FavouritesPage />);
        await waitFor(() => {
            expect(screen.getByText("The Eagle Nebula")).toBeTruthy();
        });
    });

    test("removes a favourite and shows a toast", async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ favourites: fakeFavourites }),
        })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        });

        const user = userEvent.setup();
        render(<FavouritesPage />);

        await waitFor(() => {
            expect(screen.getByText("The Eagle Nebula")).toBeTruthy();
        });

        await user.click(screen.getByTestId("remove-favourite"));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("Removed from favourites");
        });
    });

    test("shows an error message if fetch fails", async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false });
        render(<FavouritesPage />);
        await waitFor(() => {
            expect(screen.getByText("Could not load your favourites...🚀")).toBeTruthy();
        });
    });
});