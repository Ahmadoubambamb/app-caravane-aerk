package bus.reservation.aerk.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import bus.reservation.aerk.model.*;
import bus.reservation.aerk.service.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final CaravaneService caravaneService;
    private final ReservationService reservationService;

    public AdminController(CaravaneService caravaneService, ReservationService reservationService) {
        this.caravaneService = caravaneService;
        this.reservationService = reservationService;
    }

    @GetMapping("/auth-check")
    public ResponseEntity<Void> verifierAuthentification() {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/demarrer-caravane")
    public ResponseEntity<CaravaneSession> demarrer(@RequestParam String datesDepart) {
        return ResponseEntity.ok(caravaneService.demarrerNouvelleSession(datesDepart));
    }

    @PostMapping("/fermer-caravane")
    public ResponseEntity<String> fermer() {
        caravaneService.fermerSessionActive();
        return ResponseEntity.ok("Caravane fermée et archivée.");
    }

    @GetMapping("/buses")
    public ResponseEntity<List<Bus>> getBusesSessionActive() {
        CaravaneSession active = caravaneService.getSessionActive().orElse(null);
        if (active == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(reservationService.getBusParSession(active));
    }

    @GetMapping("/bus/{numeroBus}/passagers")
    public ResponseEntity<List<Reservation>> getPassagers(@PathVariable Integer numeroBus, @RequestParam Long sessionId) {
        return ResponseEntity.ok(reservationService.getPassagersParBus(numeroBus, sessionId));
    }
}