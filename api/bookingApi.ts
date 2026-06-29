import { APIRequestContext } from "@playwright/test";
import { env } from "../environments";

/**
 * Service object for the room/booking endpoints — used for test data setup and
 * teardown. Creating a booking is public; deleting one needs an admin token
 * (obtain it via AuthApi.getToken).
 */
export class BookingApi {
  private readonly roomPath = env.apiURL + "/room";
  private readonly bookingPath = env.apiURL + "/booking";

  constructor(private readonly request: APIRequestContext) {}

  /** Room ids available for the given date range (what the checker shows). */
  async getAvailableRooms(checkin: string, checkout: string): Promise<number[]> {
    const response = await this.request.get(
      `${this.roomPath}?checkin=${checkin}&checkout=${checkout}`,
    );
    const body = await response.json();
    return body.rooms.map((room: { roomid: number }) => room.roomid);
  }

  /** Create a booking (no auth required). Returns the new bookingid. */
  async book(roomid: number, checkin: string, checkout: string): Promise<number> {
    const response = await this.request.post(this.bookingPath, {
      data: {
        bookingdates: { checkin, checkout },
        roomid,
        firstname: "Test",
        lastname: "Setup",
        depositpaid: true,
        email: "test@example.com",
        phone: "07111111111",
      },
    });
    const body = await response.json();
    return body.bookingid;
  }

  /** Book every room available for the date range. Returns the booking ids. */
  async bookAllRooms(checkin: string, checkout: string): Promise<number[]> {
    const roomIds = await this.getAvailableRooms(checkin, checkout);
    return Promise.all(roomIds.map((id) => this.book(id, checkin, checkout)));
  }

  /** Delete a booking (requires an admin token, passed as a cookie). */
  async delete(bookingid: number, token: string): Promise<void> {
    await this.request.delete(`${this.bookingPath}/${bookingid}`, {
      headers: { Cookie: `token=${token}` },
    });
  }
}
