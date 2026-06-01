import { apiFactory } from './config/apiFactory';

export async function getProperties() {
    return await apiFactory(true).get('/api/v1/properties');  
}

export async function getPropertieById(id) {
    return await apiFactory(true).get(`/api/v1/properties/${id}`);  
}

export async function getPropertiesByOwner(id) {
    return await apiFactory(true).get(`/api/v1/properties/owner/${id}`);
}
