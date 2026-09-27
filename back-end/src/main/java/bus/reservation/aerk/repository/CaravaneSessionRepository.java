package bus.reservation.aerk.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import bus.reservation.aerk.model.CaravaneSession;
import java.util.Optional;

public interface CaravaneSessionRepository extends JpaRepository<CaravaneSession, Long> {
    Optional<CaravaneSession> findFirstByActiveTrue();
}
