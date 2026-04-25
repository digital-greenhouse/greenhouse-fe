import { apiFactory } from './config/apiFactory';

export async function getPropertieById(id) {
    return await apiFactory(true).get(`/api/v1/properties/${id}`);  
}