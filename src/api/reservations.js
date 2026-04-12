import { apiFactory } from './config/apiFactory';


export async function createQuote(data) {
   return await apiFactory(true).post('/api/v1/bookings/quote', data);
}
