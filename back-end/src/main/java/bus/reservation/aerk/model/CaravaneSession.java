package bus.reservation.aerk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "caravane_sessions")
public class CaravaneSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String datesDepart; // ex: "21, 22 et 23 Octobre"
    private boolean active = false;
    private LocalDateTime dateCreation = LocalDateTime.now();

    public CaravaneSession() {}

    public CaravaneSession(String datesDepart, boolean active) {
        this.datesDepart = datesDepart;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDatesDepart() { return datesDepart; }
    public void setDatesDepart(String datesDepart) { this.datesDepart = datesDepart; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getDateCreation() { return dateCreation; }
}
