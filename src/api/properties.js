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

export async function createProperty(propertyData) {
    return await apiFactory(true).post('/api/v1/properties', propertyData);
}

export async function autoGenerateRules(propertyId) {
    return await apiFactory(true).post(`/api/v1/properties/${propertyId}/pricing-rules/auto-generate`);
}
export async function getPropertyById(propertyId) {
    return await apiFactory(true).get(`/api/v1/properties/${propertyId}`);
}

export async function getParcingRules(propertyId) {
    return await apiFactory(true).get(`/api/v1/properties/${propertyId}/pricing-rules`);
}

export async function createPricingRule(propertyId, ruleData) {
    return await apiFactory(true).post(`/api/v1/properties/${propertyId}/pricing-rules`, ruleData);
}