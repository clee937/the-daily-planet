import createFetchMock from "vitest-fetch-mock";
import { describe, vi } from "vitest";
import { getUser, editUser, deleteUser } from "../../src/services/users";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Mock fetch
createFetchMock(vi).enableMocks();

// Fake token with a valid base64 payload containing a user ID
const fakeToken = "header." + btoa(JSON.stringify({ sub: "123" })) + ".signature";

describe("users service", () => {

    describe("getUser", () => {
        test("calls the correct backend URL", async () => {
        fetch.mockResponseOnce(JSON.stringify({ user: { email: "test@test.com" } }), {
            status: 200,
        });

        await getUser(fakeToken);

        const fetchArguments = fetch.mock.lastCall;
        const url = fetchArguments[0];
        const options = fetchArguments[1];

        expect(url).toEqual(`${BACKEND_URL}/users/123`);
        expect(options.method).toEqual("GET");
        expect(options.headers["Authorization"]).toEqual(`Bearer ${fakeToken}`);
        });

        test("returns the user data on success", async () => {
        fetch.mockResponseOnce(JSON.stringify({ user: { email: "test@test.com" } }), {
            status: 200,
        });

        const data = await getUser(fakeToken);
        expect(data.user.email).toEqual("test@test.com");
        });

        test("throws an error if request fails", async () => {
        fetch.mockResponseOnce(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
        });

        try {
            await getUser(fakeToken);
        } catch (err) {
            expect(err.message).toContain("401");
        }
        });
    });

    describe("editUser", () => {
        test("calls the correct backend URL with PATCH", async () => {
        fetch.mockResponseOnce(JSON.stringify({ user: { email: "new@test.com" } }), {
            status: 200,
        });

        await editUser(fakeToken, { email: "new@test.com" });

        const fetchArguments = fetch.mock.lastCall;
        const url = fetchArguments[0];
        const options = fetchArguments[1];

        expect(url).toEqual(`${BACKEND_URL}/users/123`);
        expect(options.method).toEqual("PATCH");
        expect(options.headers["Authorization"]).toEqual(`Bearer ${fakeToken}`);
        });

        test("throws an error if request fails", async () => {
        fetch.mockResponseOnce(JSON.stringify({ message: "Error" }), {
            status: 400,
        });

        try {
            await editUser(fakeToken, { email: "new@test.com" });
        } catch (err) {
            expect(err.message).toContain("400");
        }
        });
    });

    describe("deleteUser", () => {
        test("calls the correct backend URL with DELETE", async () => {
        fetch.mockResponseOnce(JSON.stringify({ message: "Deleted" }), {
            status: 200,
        });

        await deleteUser(fakeToken);

        const fetchArguments = fetch.mock.lastCall;
        const url = fetchArguments[0];
        const options = fetchArguments[1];

        expect(url).toEqual(`${BACKEND_URL}/users/123`);
        expect(options.method).toEqual("DELETE");
        expect(options.headers["Authorization"]).toEqual(`Bearer ${fakeToken}`);
        });

        test("throws an error if request fails", async () => {
        fetch.mockResponseOnce(JSON.stringify({ message: "Error" }), {
            status: 500,
        });

        try {
            await deleteUser(fakeToken);
        } catch (err) {
            expect(err.message).toContain("500");
        }
        });
    });

});
