import { apiFactory } from "./config/apiFactory";

export async function createUser(data) {
    return await apiFactory(false).post('/api/v1/users/', data);
}

export async function getUserById(id) {
    return await apiFactory(false).get(`/api/v1/users/${id}`);
}
