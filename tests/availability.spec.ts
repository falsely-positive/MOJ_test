import { expect, test } from "../fixtures/test";
import { HomePage } from "../pages/homePage";
import { futureDate } from "../helpers/date";


test.describe("Room availability checker", () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.pageload();
  });


  test("Available room types are listed for a valid date range", async ({ homePage }) => {

    const checkInDate = futureDate(90);
    const checkOutDate = futureDate(91); // 1 night later

    await homePage.setCheckInDate(checkInDate);
    await homePage.setCheckOutDate(checkOutDate);
    await homePage.checkAvailability();

    expect(await homePage.getCheckInInput()).toBe(checkInDate);
    expect(await homePage.getCheckOutInput()).toBe(checkOutDate);

    const roomTypes = await homePage.getAvailableRoomTypes();
    expect(roomTypes.length).toBeGreaterThan(0);
    for (const type of roomTypes) {
      expect(type).not.toBe("");
    }

    expect(await homePage.getAvailableRoomCount()).toBe(roomTypes.length);

    const count = await homePage.getAvailableRoomCount();
    expect(roomTypes.length).toBe(count);
    expect(roomTypes).toEqual(expect.arrayContaining(["Single", "Double", "Suite"]));
  });
});
