package bus.reservation.aerk.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import bus.reservation.aerk.model.*;
import bus.reservation.aerk.repository.*;
import java.util.List;

@Service
public class ReservationService {

    private final BusRepository busRepository;
    private final ReservationRepository reservationRepository;
    private final CaravaneService caravaneService;

    public ReservationService(
            BusRepository busRepository,
            ReservationRepository reservationRepository,
            CaravaneService caravaneService) {
        this.busRepository = busRepository;
        this.reservationRepository = reservationRepository;
        this.caravaneService = caravaneService;
    }

    @Transactional
    public Reservation effectuerReservation(Reservation request) {
        CaravaneSession sessionActive = caravaneService.getSessionActive()
                .orElseThrow(() -> new RuntimeException("Aucune caravane disponible actuellement."));

        Bus bus = busRepository.findFirstBySessionAndStatutOrderByIdAsc(sessionActive, StatutBus.OUVERT)
                .orElseGet(() -> creerNouveauBus(sessionActive));

        if (bus.getPlacesOccupees() >= bus.getCapacite()) {
            bus.setStatut(StatutBus.PLEIN);
            busRepository.save(bus);
            bus = creerNouveauBus(sessionActive);
        }

        int nouveauSiege = bus.getPlacesOccupees() + 1;
        bus.setPlacesOccupees(nouveauSiege);

        if (nouveauSiege == bus.getCapacite()) {
            bus.setStatut(StatutBus.PLEIN);
        }
        busRepository.save(bus);

        request.setBus(bus);
        request.setNumSiege(nouveauSiege);

        return reservationRepository.save(request);
    }

    private Bus creerNouveauBus(CaravaneSession session) {
        int prochainNumero = (int) busRepository.countBySession(session) + 1;
        return busRepository.save(new Bus(prochainNumero, session));
    }

    public List<Reservation> getPassagersParBus(Integer numeroBus, Long sessionId) {
        return reservationRepository.findByBusNumeroBusAndBusSessionIdOrderByNumSiegeAsc(numeroBus, sessionId);
    }

    public List<Bus> getBusParSession(CaravaneSession session) {
        return busRepository.findBySessionOrderByIdAsc(session);
    }
}