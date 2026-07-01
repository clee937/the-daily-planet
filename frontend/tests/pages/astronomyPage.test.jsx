import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AstronomyPage from "../../src/pages/Astronomy/AstronomyPage";

describe("Astronomy Page", () => {
    it("renders astronomy page heading", () => {
        render(<MemoryRouter><AstronomyPage /></MemoryRouter>);

        expect(
            screen.getByText(/what's in the sky tonight/i)
        ).toBeTruthy();
    });

    it("renders moon phase explorer section", () => {
        render(<MemoryRouter><AstronomyPage /></MemoryRouter>);

        expect(
            screen.getByText(/moon phase explorer/i)
        ).toBeTruthy();
    });

    it("renders constellation explorer section", () => {
        render(<MemoryRouter><AstronomyPage /></MemoryRouter>);

        expect(
            screen.getByText(/constellation explorer/i)
        ).toBeTruthy();
    });

    it("renders moon phase button", () => {
        render(<MemoryRouter><AstronomyPage /></MemoryRouter>);

        expect(
            screen.getByRole("button", {
                name: /explore moon phase/i,
            })
        ).toBeTruthy();
    });

    it("renders star chart button", () => {
        render(<MemoryRouter><AstronomyPage /></MemoryRouter>);

        expect(
            screen.getByRole("button", {
                name: /generate star chart/i,
            })
        ).toBeTruthy();
    });
});
