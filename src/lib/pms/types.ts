export type PMSCredentials = Record<string, unknown>;

export type PMSGuest = {
  externalId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  language?: string;
  metadata?: Record<string, unknown>;
};

export type PMSReservation = {
  externalId: string;
  guestExternalId: string;
  status: "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show";
  checkIn: string;
  checkOut: string;
  roomType?: string;
  roomNumber?: string;
  rateAmount?: number;
  rateCurrency?: string;
  totalAmount?: number;
  adults?: number;
  children?: number;
  source?: string;
  specialRequests?: string;
  metadata?: Record<string, unknown>;
};

export type PMSEvent = {
  type: "reservation_created" | "reservation_updated" | "guest_updated" | "checkout";
  externalId: string;
  data: Record<string, unknown>;
  timestamp: string;
};

export interface PMSAdapter {
  validateCredentials(): Promise<boolean>;
  fetchGuests(cursor?: Record<string, unknown>): Promise<{
    guests: PMSGuest[];
    nextCursor?: Record<string, unknown>;
  }>;
  fetchReservations(cursor?: Record<string, unknown>): Promise<{
    reservations: PMSReservation[];
    nextCursor?: Record<string, unknown>;
  }>;
  parseWebhookEvent(headers: Headers, body: string): PMSEvent | null;
}
