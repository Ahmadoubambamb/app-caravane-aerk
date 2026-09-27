package bus.reservation.aerk.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import bus.reservation.aerk.model.CaravaneSession;
import bus.reservation.aerk.repository.CaravaneSessionRepository;
import java.util.Optional;

@Service
public class CaravaneService {

    private final CaravaneSessionRepository sessionRepository;

    public CaravaneService(CaravaneSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public Optional<CaravaneSession> getSessionActive() {
        return sessionRepository.findFirstByActiveTrue();
    }

    @Transactional
    public CaravaneSession demarrerNouvelleSession(String datesDepart) {
        // Désactiver toutes les anciennes sessions
        sessionRepository.findAll().forEach(session -> {
            session.setActive(false);
            sessionRepository.save(session);
        });

        // Créer la nouvelle session
        CaravaneSession nouvelleSession = new CaravaneSession(datesDepart, true);
        return sessionRepository.save(nouvelleSession);
    }

    @Transactional
    public void fermerSessionActive() {
        sessionRepository.findFirstByActiveTrue().ifPresent(session -> {
            session.setActive(false);
            sessionRepository.save(session);
        });
    }
}