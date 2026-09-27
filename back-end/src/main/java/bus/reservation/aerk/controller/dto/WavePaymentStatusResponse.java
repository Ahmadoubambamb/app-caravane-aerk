package bus.reservation.aerk.controller.dto;

import bus.reservation.aerk.model.Reservation;

public record WavePaymentStatusResponse(String status, Reservation reservation) {
}
