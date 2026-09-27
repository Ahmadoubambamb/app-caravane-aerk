package bus.reservation.aerk.model;
import jakarta.persistence.*;

@Entity
@Table(name = "buses")
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer numeroBus;

    @Column(nullable = false)
    private Integer capacite = 56;

    @Column(nullable = false)
    private Integer placesOccupees = 0;

    @Enumerated(EnumType.STRING)
    private StatutBus statut = StatutBus.OUVERT;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private CaravaneSession session;

    public Bus() {}

    public Bus(Integer numeroBus, CaravaneSession session) {
        this.numeroBus = numeroBus;
        this.session = session;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getNumeroBus() { return numeroBus; }
    public void setNumeroBus(Integer numeroBus) { this.numeroBus = numeroBus; }

    public Integer getCapacite() { return capacite; }
    public void setCapacite(Integer capacite) { this.capacite = capacite; }

    public Integer getPlacesOccupees() { return placesOccupees; }
    public void setPlacesOccupees(Integer placesOccupees) { this.placesOccupees = placesOccupees; }

    public StatutBus getStatut() { return statut; }
    public void setStatut(StatutBus statut) { this.statut = statut; }

    public CaravaneSession getSession() { return session; }
    public void setSession(CaravaneSession session) { this.session = session; }
}