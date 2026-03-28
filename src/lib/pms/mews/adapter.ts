import type { PMSAdapter, PMSGuest, PMSReservation, PMSEvent } from "../types";
import type { MewsCredentials, MewsCustomer, MewsReservation } from "./types";

const DEFAULT_URL = "https://api.mews.com";

export class MewsAdapter implements PMSAdapter {
  private clientToken: string;
  private accessToken: string;
  private baseUrl: string;

  constructor(credentials: MewsCredentials) {
    this.clientToken = credentials.client_token;
    this.accessToken = credentials.access_token;
    this.baseUrl = credentials.platform_url ?? DEFAULT_URL;
  }

  private async request<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ClientToken: this.clientToken,
        AccessToken: this.accessToken,
        ...body,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Mews API error: ${res.status} ${error}`);
    }

    return res.json() as Promise<T>;
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.request("/api/connector/v1/configuration/get", {});
      return true;
    } catch {
      return false;
    }
  }

  async fetchGuests(cursor?: Record<string, unknown>): Promise<{
    guests: PMSGuest[];
    nextCursor?: Record<string, unknown>;
  }> {
    const body: Record<string, unknown> = {
      Limitation: { Count: 100 },
    };

    if (cursor?.guestLastUpdated) {
      body.UpdatedUtc = {
        StartUtc: cursor.guestLastUpdated,
        EndUtc: new Date().toISOString(),
      };
    }

    const data = await this.request<{ Customers: MewsCustomer[] }>(
      "/api/connector/v1/customers/getAll",
      body
    );

    const guests: PMSGuest[] = (data.Customers ?? []).map((c) => ({
      externalId: c.Id,
      firstName: c.FirstName,
      lastName: c.LastName,
      email: c.Email,
      phone: c.Phone,
      nationality: c.NationalityCode,
      language: c.LanguageCode,
    }));

    const guestLastUpdated =
      data.Customers?.length > 0
        ? data.Customers[data.Customers.length - 1].UpdatedUtc
        : cursor?.guestLastUpdated;

    return {
      guests,
      nextCursor: { guestLastUpdated },
    };
  }

  async fetchReservations(cursor?: Record<string, unknown>): Promise<{
    reservations: PMSReservation[];
    nextCursor?: Record<string, unknown>;
  }> {
    const body: Record<string, unknown> = {
      Limitation: { Count: 100 },
    };

    if (cursor?.reservationLastUpdated) {
      body.UpdatedUtc = {
        StartUtc: cursor.reservationLastUpdated,
        EndUtc: new Date().toISOString(),
      };
    }

    const data = await this.request<{ Reservations: MewsReservation[] }>(
      "/api/connector/v1/reservations/getAll",
      body
    );

    const statusMap: Record<string, PMSReservation["status"]> = {
      Confirmed: "confirmed",
      Started: "checked_in",
      Processed: "checked_out",
      Canceled: "cancelled",
      Optional: "confirmed",
    };

    const reservations: PMSReservation[] = (data.Reservations ?? []).map((r) => ({
      externalId: r.Id,
      guestExternalId: r.CustomerId,
      status: statusMap[r.State] ?? "confirmed",
      checkIn: r.StartUtc.split("T")[0],
      checkOut: r.EndUtc.split("T")[0],
      roomType: r.RequestedResourceCategoryId,
      totalAmount: r.TotalAmount?.Value,
      rateCurrency: r.TotalAmount?.Currency,
      adults: r.AdultCount,
      children: r.ChildCount,
      source: r.Origin,
      specialRequests: r.Notes,
    }));

    const reservationLastUpdated =
      data.Reservations?.length > 0
        ? data.Reservations[data.Reservations.length - 1].UpdatedUtc
        : cursor?.reservationLastUpdated;

    return {
      reservations,
      nextCursor: { reservationLastUpdated },
    };
  }

  parseWebhookEvent(headers: Headers, body: string): PMSEvent | null {
    try {
      const data = JSON.parse(body);
      const events = data.Events as Array<{
        Type: string;
        Id: string;
        Value: Record<string, unknown>;
      }>;

      if (!events?.[0]) return null;

      const event = events[0];
      const typeMap: Record<string, PMSEvent["type"]> = {
        ReservationCreated: "reservation_created",
        ReservationUpdated: "reservation_updated",
        CustomerUpdated: "guest_updated",
        ReservationEnded: "checkout",
      };

      return {
        type: typeMap[event.Type] ?? "reservation_updated",
        externalId: event.Id,
        data: event.Value ?? {},
        timestamp: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }
}
