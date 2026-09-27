package bus.reservation.aerk.service;

import bus.reservation.aerk.controller.dto.WaveCheckoutResponse;
import bus.reservation.aerk.controller.dto.WavePaymentRequest;
import bus.reservation.aerk.controller.dto.WavePaymentStatusResponse;
import bus.reservation.aerk.model.MoyenPaiement;
import bus.reservation.aerk.model.Reservation;
import bus.reservation.aerk.model.StatutPaiement;
import bus.reservation.aerk.model.WaveCheckout;
import bus.reservation.aerk.repository.WaveCheckoutRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.UUID;

@Service
public class WavePaymentService {

    private static final String AMOUNT = "6500";
    private static final String CURRENCY = "XOF";

    private final RestClient waveClient;
    private final WaveCheckoutRepository checkoutRepository;
    private final ReservationService reservationService;
    private final CaravaneService caravaneService;
    private final String apiKey;
    private final String successUrl;
    private final String errorUrl;

    public WavePaymentService(
            RestClient.Builder restClientBuilder,
            WaveCheckoutRepository checkoutRepository,
            ReservationService reservationService,
            CaravaneService caravaneService,
            @Value("${app.payment.wave.api-key:}") String apiKey,
            @Value("${app.payment.wave.success-url:http://localhost:4200/?payment=success&token={token}}") String successUrl,
            @Value("${app.payment.wave.error-url:http://localhost:4200/?payment=error&token={token}}") String errorUrl) {
        this.waveClient = restClientBuilder.baseUrl("https://api.wave.com").build();
        this.checkoutRepository = checkoutRepository;
        this.reservationService = reservationService;
        this.caravaneService = caravaneService;
        this.apiKey = apiKey;
        this.successUrl = successUrl;
        this.errorUrl = errorUrl;
    }

    public boolean isConfigured() {
        return !apiKey.isBlank();
    }

    public WaveCheckoutResponse createCheckout(WavePaymentRequest request) {
        requireConfigured();
        validatePassenger(request);
        if (caravaneService.getSessionActive().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Aucune caravane n'accepte de réservation actuellement.");
        }

        UUID token = UUID.randomUUID();
        String clientReference = "AERK-" + token;
        WaveCreateRequest waveRequest = new WaveCreateRequest(
                AMOUNT,
                CURRENCY,
                clientReference,
                successUrl.replace("{token}", token.toString()),
                errorUrl.replace("{token}", token.toString()));

        WaveCreateResponse waveResponse = postCheckout(waveRequest);
        if (waveResponse == null || isBlank(waveResponse.id()) || isBlank(waveResponse.waveLaunchUrl())) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Wave n'a pas retourné une session de paiement exploitable.");
        }

        WaveCheckout checkout = new WaveCheckout(
                token,
                waveResponse.id(),
                clientReference,
                request.nom().trim(),
                request.prenom().trim(),
                request.telephone().trim());
        checkoutRepository.save(checkout);
        return new WaveCheckoutResponse(token, waveResponse.waveLaunchUrl());
    }

    @Transactional
    public WavePaymentStatusResponse refreshStatus(UUID paymentToken) {
        requireConfigured();
        WaveCheckout checkout = checkoutRepository.findByPaymentTokenForUpdate(paymentToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paiement introuvable."));

        if (checkout.getReservation() != null) {
            return new WavePaymentStatusResponse("SUCCEEDED", checkout.getReservation());
        }

        WaveSessionResponse waveSession = getCheckout(checkout.getWaveSessionId());
        if (waveSession == null || isBlank(waveSession.paymentStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Wave n'a pas retourné le statut du paiement.");
        }
        validateCheckout(checkout, waveSession);

        String waveStatus = waveSession.paymentStatus().toLowerCase(Locale.ROOT);
        if ("succeeded".equals(waveStatus)) {
            Reservation reservation = new Reservation();
            reservation.setNom(checkout.getNom());
            reservation.setPrenom(checkout.getPrenom());
            reservation.setTelephone(checkout.getTelephone());
            reservation.setMoyenPaiement(MoyenPaiement.WAVE);
            reservation.setStatutPaiement(StatutPaiement.VALIDE);
            reservation.setPaiementTest(false);
            Reservation savedReservation = reservationService.effectuerReservation(reservation);
            checkout.setReservation(savedReservation);
            checkout.setStatus("SUCCEEDED");
            checkoutRepository.save(checkout);
            return new WavePaymentStatusResponse("SUCCEEDED", savedReservation);
        }

        if ("failed".equals(waveStatus) || "cancelled".equals(waveStatus) || "expired".equals(waveStatus)) {
            checkout.setStatus("FAILED");
            checkoutRepository.save(checkout);
            return new WavePaymentStatusResponse("FAILED", null);
        }

        return new WavePaymentStatusResponse("PENDING", null);
    }

    private WaveCreateResponse postCheckout(WaveCreateRequest request) {
        try {
            return waveClient.post()
                    .uri("/v1/checkout/sessions")
                    .header("Authorization", "Bearer " + apiKey)
                    .body(request)
                    .retrieve()
                    .body(WaveCreateResponse.class);
        } catch (RestClientResponseException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Wave a refusé la création du paiement (HTTP " + exception.getStatusCode().value() + ").");
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Wave est momentanément injoignable.");
        }
    }

    private WaveSessionResponse getCheckout(String waveSessionId) {
        try {
            return waveClient.get()
                    .uri("/v1/checkout/sessions/{id}", waveSessionId)
                    .header("Authorization", "Bearer " + apiKey)
                    .retrieve()
                    .body(WaveSessionResponse.class);
        } catch (RestClientResponseException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Wave n'a pas pu vérifier le paiement (HTTP " + exception.getStatusCode().value() + ").");
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Wave est momentanément injoignable.");
        }
    }

    private void validateCheckout(WaveCheckout checkout, WaveSessionResponse waveSession) {
        if (!AMOUNT.equals(waveSession.amount())
                || !CURRENCY.equals(waveSession.currency())
                || !checkout.getClientReference().equals(waveSession.clientReference())) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Les informations du paiement Wave ne correspondent pas à la commande.");
        }
    }

    private void validatePassenger(WavePaymentRequest request) {
        if (request == null || isBlank(request.nom()) || isBlank(request.prenom()) || isBlank(request.telephone())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom, le prénom et le téléphone sont requis.");
        }
    }

    private void requireConfigured() {
        if (!isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Le paiement Wave n'est pas encore configuré.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record WaveCreateRequest(
            String amount,
            String currency,
            @JsonProperty("client_reference") String clientReference,
            @JsonProperty("success_url") String successUrl,
            @JsonProperty("error_url") String errorUrl) {
    }

    private record WaveCreateResponse(
            String id,
            @JsonProperty("wave_launch_url") String waveLaunchUrl) {
    }

    private record WaveSessionResponse(
            String amount,
            String currency,
            @JsonProperty("client_reference") String clientReference,
            @JsonProperty("payment_status") String paymentStatus) {
    }
}
