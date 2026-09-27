import { CaravaneSession } from './caravane-session';

export interface Bus {
    id: number;
    numeroBus: number;
    capacite: number;
    placesOccupees: number;
    statut: 'OUVERT' | 'PLEIN' | string;
    session?: CaravaneSession;
}
