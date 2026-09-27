package bus.reservation.aerk.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "wave_checkouts")
public class WaveCheckout {

    @Id
    private UUID paymentToken;

    @Column(nullable = false, unique = true)
    private String waveSessionId;

    @Column(nullable = false)
    private String clientReference;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false)
    private String telephone;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", unique = true)
    private Reservation reservation;

    protected WaveCheckout() {
    }

    public WaveCheckout(
            UUID paymentToken,
            String waveSessionId,
            String clientReference,
            String nom,
            String prenom,
            String telephone) {
        this.paymentToken = paymentToken;
        this.waveSessionId = waveSessionId;
        this.clientReference = clientReference;
        this.nom = nom;
        this.prenom = prenom;
        this.telephone = telephone;
    }

    public UUID getPaymentToken() { return paymentToken; }
    public String getWaveSessionId() { return waveSessionId; }
    public String getClientReference() { return clientReference; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public String getTelephone() { return telephone; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }
}
