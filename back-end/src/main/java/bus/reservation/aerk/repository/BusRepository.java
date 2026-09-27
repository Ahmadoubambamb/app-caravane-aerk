package bus.reservation.aerk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import bus.reservation.aerk.model.Bus;
import bus.reservation.aerk.model.CaravaneSession;
import bus.reservation.aerk.model.StatutBus;
import java.util.List;
import java.util.Optional;

public interface BusRepository extends JpaRepository<Bus, Long> {
    Optional<Bus> findFirstBySessionAndStatutOrderByIdAsc(CaravaneSession session, StatutBus statut);
    long countBySession(CaravaneSession session);
    List<Bus> findBySessionOrderByIdAsc(CaravaneSession session);
}