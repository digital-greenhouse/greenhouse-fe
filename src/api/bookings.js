import { apiFactory } from './config/apiFactory';

export async function createBooking(data) {
   return await apiFactory(true).post('/api/v1/bookings', data);
}

export async function getBookings() {
    return await apiFactory(true).get('/api/v1/bookings/history');  
}


