import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, useOutletContext } from "react-router-dom";
import { Chatbot } from "../../src/components/Chatbot";
import { sendMessage } from "../../src/services/gemini";
import { toast } from "react-toastify";

const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => {store = {}; }
    };
})();

vi.mock("react-toastify", () => ({
    toast: { info: vi.fn() },
}));

vi.mock("../../src/services/gemini", () => ({
    sendMessage: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useOutletContext: vi.fn(),
    };
});

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function mockStatusFetch(overrides = {}) {
    mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ messagesRemaining: 10, minutesUntilReset: 60, ...overrides }),
    });
}

function makeToken(expOffsetSeconds) {
    const payload = btoa(JSON.stringify({ 
        sub: "123", 
        exp: Math.floor(Date.now() / 1000) + expOffsetSeconds 
    }));
    return `header.${payload}.signature`;
}

const renderChatbot = () =>
    render(
        <MemoryRouter>
            <Chatbot />
        </MemoryRouter>
    );

describe("Chatbot", () => {
    beforeEach(() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        vi.clearAllMocks();
        localStorage.clear();
        useOutletContext.mockReturnValue({ isLoggedIn: false, setIsLoggedIn: vi.fn() });
        mockStatusFetch();
    });

    it("renders the input and send button", () => {
        renderChatbot();
        expect(screen.getByPlaceholderText("Ask Rover, Mission Control's AI space pup...")).toBeTruthy();
        expect(screen.getByRole("button", { name: /send/i })).toBeTruthy();
    });

    it("shows no auth error if no token", async () => {
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover, Mission Control's AI space pup...");
        fireEvent.change(input, { target: { value: "What is a black hole?" } });
        fireEvent.submit(screen.getByRole("button", { name: /send/i }).closest("form"));
        await waitFor(() => {
            expect(screen.getByText((content) =>
                content.includes("You must be logged in to use this feature.")
            )).toBeTruthy();
        })
    });

    it("shows the user message after submitting", async () => {
        localStorage.setItem("token", FAKE_TOKEN);
        sendMessage.mockResolvedValue("A black hole is...");
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover, Mission Control's AI space pup...");
        fireEvent.change(input, { target: { value: "What is a black hole?" } });
        fireEvent.submit(input.closest("form"));
        expect(screen.getByText("What is a black hole?")).toBeTruthy();
    });

    it("shows Rover's reply after a successful response", async () => {
        localStorage.setItem("token", FAKE_TOKEN);
        sendMessage.mockResolvedValue({
            answer: "A black hole is a region of spacetime!",
            messagesRemaining: 9
        });
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover, Mission Control's AI space pup...");
        fireEvent.change(input, { target: { value: "What is a black hole?" } });
        fireEvent.submit(input.closest("form"));
        await waitFor(() => {
            expect(screen.getByText("A black hole is a region of spacetime!")).toBeTruthy();
        });
    });

    it("shows loading message while waiting for a response", async () => {
        localStorage.setItem("token", FAKE_TOKEN);
        // never resolves so loading stays true
        sendMessage.mockReturnValue(new Promise(() => {}));
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover, Mission Control's AI space pup...");
        fireEvent.change(input, { target: { value: "What is Mars?" } });
        fireEvent.submit(input.closest("form"));
        expect(screen.getByText("Rover is thinking... 🚀")).toBeTruthy();
    });

    it("clears the input after submitting", async () => {
        localStorage.setItem("token", FAKE_TOKEN);
        sendMessage.mockResolvedValue("Some answer");
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover, Mission Control's AI space pup...");
        fireEvent.change(input, { target: { value: "What is Mars?" } });
        fireEvent.submit(input.closest("form"));
        expect(input.value).toBe("");
    });

    it("does not submit if the prompt is empty", async () => {
        localStorage.setItem("token", FAKE_TOKEN);
        renderChatbot();
        fireEvent.submit(screen.getByRole("button", { name: /send/i }).closest("form"));
        expect(sendMessage).not.toHaveBeenCalled();
    });

    it("disables the send button while loading", async () => {
        localStorage.setItem("token", FAKE_TOKEN);
        sendMessage.mockReturnValue(new Promise(() => {}));
        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover, Mission Control's AI space pup...");
        fireEvent.change(input, { target: { value: "What is Mars?" } });
        fireEvent.submit(input.closest("form"));
        await waitFor(() => {
            const button = screen.getByRole("button", { name: /send/i });
            expect(button.disabled).toBe(true); // ✅ plain JS property, no jest-dom needed
        });
    });

    it("displays the limit reached message after 10 messages", async () => {
        localStorage.setItem("token", FAKE_TOKEN);
        sendMessage.mockResolvedValue("Some response"); // first 9 succeed
        sendMessage.mockRejectedValueOnce(
            new Error("You've reached your hourly limit of 10 messages. Please try again in 60 minutes.")
        );

        renderChatbot();
        const input = screen.getByPlaceholderText("Ask Rover, Mission Control's AI space pup...");

        for (let i = 0; i < 10; i++) {
            fireEvent.change(input, { target: { value: "What is Mars?" } });
            fireEvent.submit(input.closest("form"));
        }

        await waitFor(() => {
            const content = screen.getByText
            expect(screen.getByText((content) => 
            content.includes("You've reached your hourly limit")
            )).toBeTruthy();
        });
    });

    it("shows messages remaining count when logged in", async () => {
        localStorage.setItem("token", FAKE_TOKEN);
        useOutletContext.mockReturnValue({ isLoggedIn: true, setIsLoggedIn: vi.fn() });
        mockStatusFetch({ messagesRemaining: 7, minutesUntilReset: 15 });

        renderChatbot();

        await waitFor(() => {
            expect(screen.getByText((content) =>
                content.includes("7 of 10 messages remaining this hour.")
            )).toBeTruthy();
        });
    });
    
    it("shows hourly limit warning with correct minutes when limit is reached", async () => {
        localStorage.setItem("token", FAKE_TOKEN);
        useOutletContext.mockReturnValue({ isLoggedIn: true, setIsLoggedIn: vi.fn() });
        mockStatusFetch({ messagesRemaining: 0, minutesUntilReset: 1 });

        renderChatbot();

        await waitFor(() => {
            expect(screen.getByText((content) =>
                content.includes("Please try again in 1 minute.")
            )).toBeTruthy();
        });
    });

    describe("session expiry", () => {
    let setIsLoggedInMock;

    beforeEach(() => {
        setIsLoggedInMock = vi.fn();
        useOutletContext.mockReturnValue({ isLoggedIn: true, setIsLoggedIn: setIsLoggedInMock });
    });

        it("removes token and calls setIsLoggedIn(false) when chat-status returns 401", async () => {
            localStorage.setItem("token", FAKE_TOKEN);
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({}),
            });

            renderChatbot();

            await waitFor(() => {
                expect(localStorage.getItem("token")).toBeNull();
                expect(setIsLoggedInMock).toHaveBeenCalledWith(false);
                expect(toast.info).toHaveBeenCalled();
            });
        });

        it("logs error when token is invalid and cannot be parsed", async () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            localStorage.setItem("token", "not.a.valid.token");
            mockStatusFetch();

            renderChatbot();

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith("Invalid token:", expect.any(Error));
            });

            consoleSpy.mockRestore();
        });


        it("removes token and logs out when sendMessage returns session expired error", async () => {
            localStorage.setItem("token", FAKE_TOKEN);
            mockStatusFetch();
            sendMessage.mockRejectedValueOnce(new Error("You must be logged in to use this feature."));

            renderChatbot();

            const input = screen.getByPlaceholderText(/ask rover/i);
            fireEvent.change(input, { target: { value: "What is Mars?" } });
            fireEvent.submit(input.closest("form"));

            await waitFor(() => {
                expect(localStorage.getItem("token")).toBeNull();
                expect(setIsLoggedInMock).toHaveBeenCalledWith(false);
                expect(toast.info).toHaveBeenCalled();
            });
        });
    });
});

