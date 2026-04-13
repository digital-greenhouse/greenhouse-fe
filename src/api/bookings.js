import { apiFactory } from './config/apiFactory';

export async function createBooking(data) {
   return await apiFactory(true).post('/api/v1/bookings', data);
}


