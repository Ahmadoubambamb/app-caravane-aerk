package bus.reservation.aerk.controller.dto;

import bus.reservation.aerk.model.MoyenPaiement;

public record PaiementTestRequest(String nom, String prenom, String telephone, MoyenPaiement moyenPaiement) {
}
