const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to get user ID from token
function getUserIdFromToken(token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub;
}

export async function getUser(token) {
    const userId = getUserIdFromToken(token);
    const requestOptions = {
        method: "GET",
        headers: {
        "Authorization": `Bearer ${token}`,
    },
    };
    const response = await fetch(`${BACKEND_URL}/users/${userId}`, requestOptions);
    if (response.status === 200) {
        return await response.json();
    } else {
        throw new Error(`Received status ${response.status} when fetching user.`);
    }
}

export async function editUser(token, updatedDetails) {
    const userId = getUserIdFromToken(token);
    const requestOptions = {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedDetails),
    };
    const response = await fetch(`${BACKEND_URL}/users/${userId}`, requestOptions);
    if (response.status === 200) {
        return await response.json();
    } else {
        throw new Error(`Received status ${response.status} when editing user.`);
    }
}

export async function deleteUser(token) {
    const userId = getUserIdFromToken(token);
    const requestOptions = {
        method: "DELETE",
        headers: {
        "Authorization": `Bearer ${token}`,
        },
    };
    const response = await fetch(`${BACKEND_URL}/users/${userId}`, requestOptions);
    if (response.status === 200) {
        return await response.json();
    } else {
        throw new Error(`Received status ${response.status} when deleting user.`);
    }
}