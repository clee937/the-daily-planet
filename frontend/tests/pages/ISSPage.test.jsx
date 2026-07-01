import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ISSPage } from "../../src/pages/ISS/ISSPage";

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock Leaflet as leaflet will not wirk in tests - learned the hard way!
vi.mock("react-leaflet", () => ({
    MapContainer: ({ children }) => <div>{children}</div>,
    TileLayer: () => <div />,
    Marker: ({ children }) => <div>{children}</div>,
    Popup: ({ children }) => <div>{children}</div>,
}));

// Mock geolocation
const mockGeolocation = {
    getCurrentPosition: vi.fn(),
};
globalThis.navigator.geolocation = mockGeolocation;

describe("ISS Page", () => {
    beforeEach(() => {
        vi.resetAllMocks();

    // Default ISS fetch response
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
        iss_position: {
            latitude: "51.5074",
            longitude: "-0.1278",
        },
        timestamp: 1234567890,
        }),
    });
});

test("shows loading state initially", () => {
    render(<MemoryRouter><ISSPage /></MemoryRouter>);
    expect(screen.getByText("Locating the ISS...")).toBeTruthy();
});

test("displays ISS location after loading", async () => {
    render(<MemoryRouter><ISSPage /></MemoryRouter>);
    await waitFor(() => {
        expect(screen.getByText(/LATITUDE/)).toBeTruthy();
        expect(screen.getByText(/LONGITUDE/)).toBeTruthy();
    });
});

test("shows location prompt when user location not shared", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error(new Error("Permission denied"));
    });
    render(<MemoryRouter><ISSPage /></MemoryRouter>);
    await waitFor(() => {
        expect(screen.getByText(/Share your location/)).toBeTruthy();
    });
});

test("shows distance when user location is shared", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
            coords: { latitude: 51.5074, longitude: -0.1278 }
    });
});
    render(<MemoryRouter><ISSPage /></MemoryRouter>);
    await waitFor(() => {
        expect(screen.getByText(/DISTANCE FROM YOU/)).toBeTruthy();
    });
});

test("shows refresh button", async () => {
    render(<MemoryRouter><ISSPage /></MemoryRouter>);
    await waitFor(() => {
        expect(screen.getByText(/Refresh Location/)).toBeTruthy();
    });
});

test("shows error message when ISS fetch fails", async () => {
    vi.resetAllMocks(); // reset beforeEach mocks
    
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    render(<MemoryRouter><ISSPage /></MemoryRouter>);
    await waitFor(() => {
        expect(screen.getByText("Failed to fetch ISS location")).toBeTruthy();
    });
});

test("shows ISS tracker title", async () => {
    render(<MemoryRouter><ISSPage /></MemoryRouter>);
    await waitFor(() => {
        expect(screen.getByText(/ISS LIVE TRACKER/)).toBeTruthy();
    });
});
});