import { apiFactory } from './config/apiFactory';

export async function sendPayment(data) {
    return await apiFactory(true).post('/api/v1/payments/upload', data);
}

export async function getPayment(idPayment) {
    return await apiFactory(true).get(`/api/v1/payments/${idPayment}/proof`, {
        responseType: 'blob',
    });
}

