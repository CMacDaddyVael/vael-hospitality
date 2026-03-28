import { describe, it, expect, vi, beforeEach } from "vitest";
import { MewsAdapter } from "@/lib/pms/mews/adapter";

describe("MewsAdapter", () => {
  let adapter: MewsAdapter;

  beforeEach(() => {
    adapter = new MewsAdapter({
      client_token: "test-client-token",
      access_token: "test-access-token",
    });
  });

  describe("parseWebhookEvent", () => {
    it("parses a valid reservation created event", () => {
      const body = JSON.stringify({
        Events: [
          { Type: "ReservationCreated", Id: "res-123", Value: { foo: "bar" } },
        ],
      });

      const event = adapter.parseWebhookEvent(new Headers(), body);
      expect(event).not.toBeNull();
      expect(event!.type).toBe("reservation_created");
      expect(event!.externalId).toBe("res-123");
    });

    it("parses a guest updated event", () => {
      const body = JSON.stringify({
        Events: [{ Type: "CustomerUpdated", Id: "guest-456", Value: {} }],
      });

      const event = adapter.parseWebhookEvent(new Headers(), body);
      expect(event!.type).toBe("guest_updated");
    });

    it("returns null for invalid JSON", () => {
      const event = adapter.parseWebhookEvent(new Headers(), "not json");
      expect(event).toBeNull();
    });

    it("returns null for empty events array", () => {
      const body = JSON.stringify({ Events: [] });
      const event = adapter.parseWebhookEvent(new Headers(), body);
      expect(event).toBeNull();
    });

    it("returns null for missing Events key", () => {
      const body = JSON.stringify({ data: {} });
      const event = adapter.parseWebhookEvent(new Headers(), body);
      expect(event).toBeNull();
    });
  });

  describe("fetchGuests cursor handling", () => {
    it("uses separate guestLastUpdated cursor key", async () => {
      // Mock fetch to intercept the request
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ Customers: [] }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await adapter.fetchGuests({ guestLastUpdated: "2024-01-01T00:00:00Z" });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.UpdatedUtc.StartUtc).toBe("2024-01-01T00:00:00Z");

      vi.unstubAllGlobals();
    });

    it("returns guestLastUpdated in nextCursor", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            Customers: [
              { Id: "1", FirstName: "John", UpdatedUtc: "2024-06-15T10:00:00Z" },
            ],
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await adapter.fetchGuests();
      expect(result.nextCursor).toEqual({ guestLastUpdated: "2024-06-15T10:00:00Z" });

      vi.unstubAllGlobals();
    });
  });

  describe("fetchReservations cursor handling", () => {
    it("uses separate reservationLastUpdated cursor key", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ Reservations: [] }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await adapter.fetchReservations({ reservationLastUpdated: "2024-02-01T00:00:00Z" });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.UpdatedUtc.StartUtc).toBe("2024-02-01T00:00:00Z");

      vi.unstubAllGlobals();
    });
  });
});
