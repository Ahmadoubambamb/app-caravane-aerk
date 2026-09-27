package bus.reservation.aerk.controller;

import bus.reservation.aerk.controller.dto.ModePaiementResponse;
import bus.reservation.aerk.controller.dto.PaiementTestRequest;
import bus.reservation.aerk.controller.dto.WaveCheckoutResponse;
import bus.reservation.aerk.controller.dto.WavePaymentRequest;
import bus.reservation.aerk.controller.dto.WavePaymentStatusResponse;
import bus.reservation.aerk.model.Reservation;
import bus.reservation.aerk.model.StatutPaiement;
import bus.reservation.aerk.service.ReservationService;
import bus.reservation.aerk.service.WavePaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/public/paiements")
@CrossOrigin(origins = "*")
public class PaiementController {

    private final ReservationService reservationService;
    private final WavePaymentService wavePaymentService;
    private final Environment environment;
    private final String paymentMode;

    public PaiementController(
            ReservationService reservationService,
            WavePaymentService wavePaymentService,
            Environment environment,
            @Value("${app.payment.mode:disabled}") String paymentMode) {
        this.reservationService = reservationService;
        this.wavePaymentService = wavePaymentService;
        this.environment = environment;
        this.paymentMode = paymentMode;
    }

    @GetMapping("/mode")
    public ResponseEntity<ModePaiementResponse> getMode() {
        String mode = wavePaymentService.isConfigured() ? "wave" : (isTestMode() ? "test" : "unavailable");
        return ResponseEntity.ok(new ModePaiementResponse(mode));
    }

    @PostMapping("/wave")
    public ResponseEntity<WaveCheckoutResponse> creerPaiementWave(@RequestBody WavePaymentRequest request) {
        return ResponseEntity.ok(wavePaymentService.createCheckout(request));
    }

    @GetMapping("/wave/{paymentToken}")
    public ResponseEntity<WavePaymentStatusResponse> verifierPaiementWave(@PathVariable UUID paymentToken) {
        return ResponseEntity.ok(wavePaymentService.refreshStatus(paymentToken));
    }

    @PostMapping("/simuler")
    public ResponseEntity<?> simulerPaiement(@RequestBody PaiementTestRequest request) {
        if (!isTestMode() || wavePaymentService.isConfigured()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Le paiement de test est désactivé sur cet environnement.");
        }
        if (request == null || isBlank(request.nom()) || isBlank(request.prenom()) || isBlank(request.telephone())
                || request.moyenPaiement() == null) {
            return ResponseEntity.badRequest().body("Les informations du passager et le moyen de paiement sont requis.");
        }

        Reservation reservation = new Reservation();
        reservation.setNom(request.nom().trim());
        reservation.setPrenom(request.prenom().trim());
        reservation.setTelephone(request.telephone().trim());
        reservation.setMoyenPaiement(request.moyenPaiement());
        reservation.setStatutPaiement(StatutPaiement.VALIDE);
        reservation.setPaiementTest(true);
        return ResponseEntity.ok(reservationService.effectuerReservation(reservation));
    }

    private boolean isTestMode() {
        return "test".equalsIgnoreCase(paymentMode)
                && environment.acceptsProfiles(Profiles.of("local", "test"));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
