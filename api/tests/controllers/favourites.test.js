const {
    createFavourite,
    deleteFavourite,
    listFavourites,
} = require("../../controllers/favouritesController");
const Favourite = require("../../models/Favourite");

jest.mock("../../models/Favourite");

function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res); //allows status 201
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("favouritesController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

describe("createFavourite", () => {
    it("creates a favourite and returns a 201", async () => {
        const req = {
            user_id: "user123",
            body: {
                title: "The Houston Nebula",
                imageUrl: "https://example.com/houston.jpg",
                sourceId: "2026-06-23",
            },
        };
    const res = mockResponse();

    Favourite.create.mockResolvedValue({ _id: "fav1", title: "The Houston Nebula"})

    await createFavourite(req, res);

    expect(Favourite.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    });

    it("returns 409 when the favourite already exists", async () => {
        const req = {
            user_id: "user123",
            body: { title: "Dup", imageUrl: "http://image.jpg", sourceId: "2026-06-23"}
        };
        const res = mockResponse();

        Favourite.create.mockRejectedValue({ code: 11000 }); //simulate the unique index duplicate key err

        await createFavourite(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });
});

describe("listFavourites", () => {
    it("returns only the logged-in users favourites", async () => {
        const req = { user_id: "user123" };
        const res = mockResponse();

        const fakeFavourites = [{ title: "One" }, { title: "Two" }];
        Favourite.find.mockResolvedValue(fakeFavourites);

        await listFavourites(req, res); 

        expect(Favourite.find).toHaveBeenCalledWith({ user: "user123" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ favourites: fakeFavourites });
    });
});

describe("deleteFavourite", () => {
    it("deletes the users own fav and returns 200", async () => {
        const req = { user_id: "user123", params: { id: "fav1" } };
        const res = mockResponse();

        Favourite.findOneAndDelete.mockResolvedValue({ _id: "fav1" });

        await deleteFavourite(req, res);

        expect(Favourite.findOneAndDelete).toHaveBeenCalledWith({
            _id: "fav1",
            user: "user123",
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 404 if the favourite isn't found or is not theirs", async () => {
        const req = { user_id: "user123", params: { id: "nope" } };
        const res = mockResponse();

        Favourite.findOneAndDelete.mockResolvedValue(null);

        await deleteFavourite(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

describe("error handling", () => {
    it("createFavourite returns 500 if the database throws", async () => {
        const req = {
            user_id: "user123",
            body: { title: "X", imageUrl: "http://image.jpg", sourceId: "abc" },
    };
    const res = mockResponse();

    // A generic error (not a 409 duplicate) — triggers the catch block
    Favourite.create.mockRejectedValue(new Error("Database exploded"));

    await createFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    });

    it("listFavourites returns 500 if the database throws", async () => {
        const req = { user_id: "user123" };
        const res = mockResponse();

        Favourite.find.mockRejectedValue(new Error("Database exploded"));

        await listFavourites(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it("deleteFavourite returns 500 if the database throws", async () => {
        const req = { user_id: "user123", params: { id: "fav1" } };
        const res = mockResponse();

        Favourite.findOneAndDelete.mockRejectedValue(new Error("Database exploded"));

        await deleteFavourite(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
})
