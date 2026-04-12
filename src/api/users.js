import { apiFactory } from "./config/apiFactory";

export async function createUser(data) {
    return await apiFactory(false).post('/api/v1/users/', data);
}
