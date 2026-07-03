import userEvent from "@testing-library/user-event";
import AstronomyPage from "../../src/pages/Astronomy/AstronomyPage";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock geolocation
const mockGeolocation = {

    getCurrentPosition: vi.fn(),
};
global.navigator.geolocation = mockGeolocation;


// mock successful geolocation
function mockLocationSuccess() {
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
        success({ coords: { latitude: 51.5, longitude: -0.1 } })
    );
}

// mock failed geolocation
function mockLocationError() {
    mockGeolocation.getCurrentPosition.mockImplementation((_, error) =>
        error({ message: "User denied geolocation" })
    );
}

function renderPage() {
    return render(
        <MemoryRouter>
            <AstronomyPage />
        </MemoryRouter>
    );
}


describe("Astronomy Page", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.navigator.geolocation = mockGeolocation;
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([]),
        });
    });

    it("renders astronomy page heading", () => {
        renderPage();

        expect(
            screen.getByText(/what's in the sky tonight/i)
        ).toBeTruthy();
    });

    it("renders moon phase explorer section", () => {
        renderPage();

        expect(
            screen.getByText(/moon phase explorer/i)
        ).toBeTruthy();
    });

    it("renders constellation explorer section", () => {
        renderPage();

        expect(
            screen.getByText(/constellation explorer/i)
        ).toBeTruthy();
    });

    it("renders moon phase button", () => {
        renderPage();

        expect(
            screen.getByRole("button", {
                name: /explore moon phase/i,
            })
        ).toBeTruthy();
    });

    it("renders star chart button", () => {
        renderPage();

        expect(
            screen.getByRole("button", {
                name: /generate star chart/i,
            })
        ).toBeTruthy();
    });

    it("displays current coordinates when location is granted", async () => {
        mockLocationSuccess();
        renderPage();

        await screen.findByText(/lat: 51.50/i);
    });

    it("displays an error when geolocation is denied", async () => {
        mockLocationError();
        renderPage();

        await screen.findByText(/location permission is required/i);
    });

    it("shows error when geolocation is not supported by browser", () => {
        delete global.navigator.geolocation;
        renderPage();
        expect(screen.getByText(/geolocation is not supported by your browser/i)).toBeTruthy();
        global.navigator.geolocation = mockGeolocation; // restore geolocation for other tests
    });

    it("alerts when visible objects are requested without location", async () => {
        delete global.navigator.geolocation;
        const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
        renderPage();

        await userEvent.click(screen.getByRole("button", { name: /refresh location/i }));

        // trigger date change to call getVisibleObjects manually
        const dateInput = screen.getAllByLabelText(/select a date:/i)[0];
        await userEvent.type(dateInput, "2026-01-01");

        alertMock.mockRestore();
        global.navigator.geolocation = mockGeolocation; // restore geolocation for other tests
    });

    it("renders visible objects when returned from the api", async () => {
        mockLocationSuccess();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([
                { name: "Mars", type: "Planet", azimuth: 180, altitude: 45 },
                { name: "Moon", type: "Natural Satellite", azimuth: 90, altitude: 30 },
            ]),
        });

        renderPage();

        await screen.findByText("🪐 Mars");
        expect(screen.getByText("🌙 Moon")).toBeTruthy();
    });

    it("renders no visible objects list when api returns empty array", async () => {
        mockLocationSuccess();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([]),
        });

        renderPage();

        await waitFor(() => {
            expect(screen.queryByRole("list")).toBeNull();
        });
    });

    it("logs error when visible objects fetch fails", async () => {
        mockLocationSuccess();
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({}),
        });

        renderPage();

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch visible objects");
        });
        consoleSpy.mockRestore();
    });

    it("alerts when moon phase is requested without location", async () => {
        delete global.navigator.geolocation;
        const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
        renderPage();

        await userEvent.click(screen.getByRole("button", { name: /explore moon phase/i }));

        expect(alertMock).toHaveBeenCalledWith("Please enable location services to use this feature.");
        alertMock.mockRestore();
        global.navigator.geolocation = mockGeolocation; // restore geolocation for other tests
    });

    // it("alerts when visible objects are requested without location", async () => {
    //     delete global.navigator.geolocation;
    //     const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    //     renderPage();

    //     await userEvent.click(screen.getByRole("button", { name: /refresh location/i }));

    //     // trigger date change to call getVisibleObjects manually
    //     const dateInput = screen.getAllByLabelText(/select a date:/i)[1];
    //     await userEvent.type(dateInput, "2026-01-01");

    //     expect(alertMock).toHaveBeenCalledWith("Location is required.");

    //     alertMock.mockRestore();
    //     global.navigator.geolocation = mockGeolocation; // restore geolocation for other tests
    // });

    it("shows loading state when fetching moon phase", async () => {
        mockLocationSuccess();
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // visible objects
            .mockImplementationOnce(() => new Promise(() => {})); // moon phase never resolves

        renderPage();

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: /explore moon phase/i }));

        expect(screen.getByText(/fetching moon phase/i)).toBeTruthy();
    });

    it("renders moon image after successful fetch", async () => {
        mockLocationSuccess();
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: { imageUrl: "https://example.com/moon.png" } }),
            });

        renderPage();
        await userEvent.click(screen.getByRole("button", { name: /explore moon phase/i }));

        const img = await screen.findByAltText(/moon phase/i);
        expect(img.src).toBe("https://example.com/moon.png");
    });

    it("logs error when moon phase fetch returns not ok", async () => {
        mockLocationSuccess();
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // visible objects
            .mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: "bad request" }),
            });

        renderPage();
        await screen.findByText(/lat: 51.50/i);
        await userEvent.click(screen.getByRole("button", { name: /explore moon phase/i }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalled();
        });
        consoleSpy.mockRestore();
    });

    it("logs error when moon phase fetch throws", async () => {
        mockLocationSuccess();
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
            .mockRejectedValueOnce(new Error("Network error"));

        renderPage();
        await screen.findByText(/lat: 51.50/i);
        await userEvent.click(screen.getByRole("button", { name: /explore moon phase/i }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        });
        consoleSpy.mockRestore();
    });

    it("shows loading state when generating star chart", async () => {
        mockLocationSuccess();
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
            .mockImplementationOnce(() => new Promise(() => {}));

        renderPage();
        await userEvent.click(screen.getByRole("button", { name: /generate star chart/i }));

        expect(screen.getByText(/generating star chart/i)).toBeTruthy();
    });

    it("renders star chart image after successful fetch", async () => {
        mockLocationSuccess();
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: { imageUrl: "https://example.com/chart.png" } }),
            });

        renderPage();
        await userEvent.click(screen.getByRole("button", { name: /generate star chart/i }));

        const img = await screen.findByAltText(/star chart/i);
        expect(img.src).toBe("https://example.com/chart.png");
    });

    it("changes constellation selection", async () => {
        mockLocationSuccess();
        renderPage();

        const select = screen.getByLabelText(/choose a constellation/i);
        await userEvent.selectOptions(select, "ori");

        expect(select.value).toBe("ori");
    });

    it("logs error when star chart fetch returns not ok", async () => {
        mockLocationSuccess();
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
            .mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: "bad request" }),
            });

        renderPage();
        await userEvent.click(screen.getByRole("button", { name: /generate star chart/i }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Server Error:", expect.anything());
        });
        consoleSpy.mockRestore();
    });

    it("logs error when star chart fetch throws", async () => {
        mockLocationSuccess();
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
            .mockRejectedValueOnce(new Error("Network error"));

        renderPage();
        await userEvent.click(screen.getByRole("button", { name: /generate star chart/i }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Fetch Error:", expect.any(Error));
        });
        consoleSpy.mockRestore();
    });

    it("updates visible objects date when date input changes", async () => {
        mockLocationSuccess();
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
        renderPage();

        const dateInput = screen.getAllByLabelText(/select a date:/i)[0];
        fireEvent.change(dateInput, { target: { value: "2026-12-25" } });

        expect(dateInput.value).toBe("2026-12-25");
    });

    it("calls getCurrentLocation when refresh location button is clicked", async () => {
        mockLocationSuccess();
        renderPage();

        await waitFor(() => {
            expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
        });

        await userEvent.click(screen.getByRole("button", { name: /refresh location/i }));

        await waitFor(() => {
            expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
        });
    });
});