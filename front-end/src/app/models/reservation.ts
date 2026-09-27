import { Bus } from './bus';

export type PaymentMethod = 'WAVE' | 'ORANGE_MONEY';
export type PaymentMode = 'wave' | 'test' | 'unavailable';

export interface ReservationPayload {
    nom: string;
    prenom: string;
    telephone: string;
}

export interface Reservation {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    numSiege: number;
    moyenPaiement?: PaymentMethod | null;
    paiementTest?: boolean;
    statutPaiement: string;
    dateReservation?: string;
    bus: Bus;
}

export interface ReservationReceipt {
    reservation: Reservation;
    paymentMethod: PaymentMethod;
    testMode: boolean;
}

export interface WaveCheckoutResponse {
    paymentToken: string;
    checkoutUrl: string;
}

export interface WavePaymentStatus {
    status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
    reservation: Reservation | null;
}
