import PictureOfTheDay from "../../src/components/PictureOfTheDay";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const fakeApod = {
    title: "The Houston Nebula",
    date: "2026-06-23",
    explanation: "Views of the Houston Nebula",
    url: "https://example.com/houston.jpg",
    mediaType: "image",
    copyright: "Astronomer Savage",
};

describe("PictureOfTheDay", () => {
    beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ apod: fakeApod }),
    });
    });

    afterEach(() => {
    vi.clearAllMocks();
    });

    it("shows a loading message first, then the picture", async () => {
    render(<PictureOfTheDay />);

    // Loading text shows before the fetch resolves
    expect(screen.getByText(/loading/i)).toBeTruthy();

    // Title appears after the data loads
    await waitFor(() => {
        expect(screen.getByText("The Houston Nebula")).toBeTruthy();
    });
    });

    it("renders the image with the correct src and alt", async () => {
    render(<PictureOfTheDay />);

    const image = await screen.findByAltText("The Houston Nebula");
    expect(image.getAttribute("src")).toEqual("https://example.com/houston.jpg");
    });

    it("displays the explanation text", async () => {
    render(<PictureOfTheDay />);

    await waitFor(() => {
        expect(screen.getByText("Views of the Houston Nebula")).toBeTruthy();
    });
    });
});