import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Chatbot } from "../../src/components/Chatbot";


vi.mock("../../src/services/gemini", () => ({
    sendMessage: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

import { sendMessage } from "../../src/services/gemini";

const renderChatbot = () =>
    render(
        <MemoryRouter>
            <Chatbot />
        </MemoryRouter>
    );

describe("Chatbot", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("renders the input and send button", () => {
        renderChatbot();
        expect(screen.getByPlaceholderText("Ask Rover about space...")).toBeTruthy();
        expect(screen.getByRole("button", { name: /send/i })).toBeTruthy();
    });

    it("redirects to login if no token", async () => {
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover about space...");
        fireEvent.change(input, { target: { value: "What is a black hole?" } });
        fireEvent.submit(screen.getByRole("button", { name: /send/i }).closest("form"));
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    it("shows the user message after submitting", async () => {
        localStorage.setItem("token", "fake-token");
        sendMessage.mockResolvedValue("A black hole is...");
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover about space...");
        fireEvent.change(input, { target: { value: "What is a black hole?" } });
        fireEvent.submit(input.closest("form"));
        expect(screen.getByText("What is a black hole?")).toBeTruthy();
    });

    it("shows Rover's reply after a successful response", async () => {
        localStorage.setItem("token", "fake-token");
        sendMessage.mockResolvedValue("A black hole is a region of spacetime!");
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover about space...");
        fireEvent.change(input, { target: { value: "What is a black hole?" } });
        fireEvent.submit(input.closest("form"));
        await waitFor(() => {
            expect(screen.getByText("A black hole is a region of spacetime!")).toBeTruthy();
        });
    });

    it("shows loading message while waiting for a response", async () => {
        localStorage.setItem("token", "fake-token");
        // never resolves so loading stays true
        sendMessage.mockReturnValue(new Promise(() => {}));
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover about space...");
        fireEvent.change(input, { target: { value: "What is Mars?" } });
        fireEvent.submit(input.closest("form"));
        expect(screen.getByText("Rover is thinking... 🚀")).toBeTruthy();
    });

    it("clears the input after submitting", async () => {
        localStorage.setItem("token", "fake-token");
        sendMessage.mockResolvedValue("Some answer");
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover about space...");
        fireEvent.change(input, { target: { value: "What is Mars?" } });
        fireEvent.submit(input.closest("form"));
        expect(input.value).toBe("");
    });

    it("does not submit if the prompt is empty", async () => {
        localStorage.setItem("token", "fake-token");
        renderChatbot();
        fireEvent.submit(screen.getByRole("button", { name: /send/i }).closest("form"));
        expect(sendMessage).not.toHaveBeenCalled();
    });

    it("disables the send button while loading", async () => {
        localStorage.setItem("token", "fake-token");
        sendMessage.mockReturnValue(new Promise(() => {}));
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover about space...");
        fireEvent.change(input, { target: { value: "What is Mars?" } });
        fireEvent.submit(input.closest("form"));
        await waitFor(() => {
            const button = screen.getByRole("button", { name: /send/i });
            expect(button.disabled).toBe(true); // ✅ plain JS property, no jest-dom needed
        });
    });
});