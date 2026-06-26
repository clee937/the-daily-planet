import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FavouriteButton from "../../src/components/FavouriteButton";

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
    renderButton({ picture: fakePicture, token: null });

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

    renderButton({ picture: fakePicture, token: "valid-token" });

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

    renderButton({ picture: fakePicture, token: "valid-token" });

    screen.getByTestId("favourite-button").click();

    await waitFor(() => {
        expect(screen.getByText(/saved/i)).toBeTruthy();
    });
    });
});