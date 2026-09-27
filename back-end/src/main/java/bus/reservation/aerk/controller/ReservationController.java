package bus.reservation.aerk.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import bus.reservation.aerk.model.CaravaneSession;
import bus.reservation.aerk.service.CaravaneService;

import java.util.Optional;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class ReservationController {

    private final CaravaneService caravaneService;

    public ReservationController(CaravaneService caravaneService) {
        this.caravaneService = caravaneService;
    }

    @GetMapping("/caravane-statut")
    public ResponseEntity<Optional<CaravaneSession>> getStatutCaravane() {
        return ResponseEntity.ok(caravaneService.getSessionActive());
    }

    @PostMapping("/reserver")
    public ResponseEntity<String> reserver() {
        return ResponseEntity.status(HttpStatus.GONE)
                .body("Le paiement par référence manuelle est désactivé.");
    }
}