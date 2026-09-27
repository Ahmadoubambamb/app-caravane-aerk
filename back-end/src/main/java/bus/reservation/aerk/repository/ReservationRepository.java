package bus.reservation.aerk.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import bus.reservation.aerk.model.Reservation;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByBusNumeroBusAndBusSessionIdOrderByNumSiegeAsc(Integer numeroBus, Long sessionId);
}