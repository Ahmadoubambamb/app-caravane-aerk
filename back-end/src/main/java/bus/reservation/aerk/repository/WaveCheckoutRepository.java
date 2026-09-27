package bus.reservation.aerk.repository;

import bus.reservation.aerk.model.WaveCheckout;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface WaveCheckoutRepository extends JpaRepository<WaveCheckout, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select checkout from WaveCheckout checkout where checkout.paymentToken = :paymentToken")
    Optional<WaveCheckout> findByPaymentTokenForUpdate(@Param("paymentToken") UUID paymentToken);
}
