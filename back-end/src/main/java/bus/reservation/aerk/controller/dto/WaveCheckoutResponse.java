package bus.reservation.aerk.controller.dto;

import java.util.UUID;

public record WaveCheckoutResponse(UUID paymentToken, String checkoutUrl) {
}
