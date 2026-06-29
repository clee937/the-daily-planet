import { render, screen } from "@testing-library/react";
import AstronomyPage from "../../src/pages/Astronomy/AstronomyPage";

describe("Astronomy Page", () => {
    it("renders astronomy page heading", () => {
        render(<AstronomyPage />);

        expect(
            screen.getByText(/what`s in the sky tonight/i)
        ).toBeTruthy();
    });

    it("renders moon phase explorer section", () => {
        render(<AstronomyPage />);

        expect(
            screen.getByText(/moon phase explorer/i)
        ).toBeTruthy();
    });

    it("renders constellation explorer section", () => {
        render(<AstronomyPage />);

        expect(
            screen.getByText(/constellation explorer/i)
        ).toBeTruthy();
    });

    it("renders moon phase button", () => {
        render(<AstronomyPage />);

        expect(
            screen.getByRole("button", {
                name: /explore moon phase/i,
            })
        ).toBeTruthy();
    });

    it("renders star chart button", () => {
        render(<AstronomyPage />);

        expect(
            screen.getByRole("button", {
                name: /generate star chart/i,
            })
        ).toBeTruthy();
    });
});
