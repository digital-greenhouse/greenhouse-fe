import { apiFactory } from './config/apiFactory';

export async function createBooking(data) {
   return await apiFactory(true).post('/api/v1/bookings', data);
}

export async function getBookings() {
    return await apiFactory(true).get('/api/v1/bookings/history');  
}

export async function GetBlockedDates(propertyId) {
    return await apiFactory(true).get(`/api/v1/bookings/reserved-dates/${propertyId}`);
}

export async function savePaymentProof(data) {
    return await apiFactory(true).post('/api/v1/payments/upload', data);
}

export async function cancelBooking(bookingId, data) {
    return await apiFactory(true).post(`/api/v1/bookings/${bookingId}/cancel`, data);
}

export async function getBookingByUser(UserId) {
    return await apiFactory(true).get(`/api/v1/bookings/user/${UserId}`);
}

export async function getBookingByPropertyOwner(ownerId) {  
    return await apiFactory(true).get(`/api/v1/bookings/owner/${ownerId}`);
}

