import { apiFactory } from './config/apiFactory';


export async function createQuote(data) {
   return await apiFactory(true).post('/api/v1/bookings/quote', data);
}

export async function getHistory() {
    return await apiFactory(true).get('/api/v1/bookings/history');  
}
