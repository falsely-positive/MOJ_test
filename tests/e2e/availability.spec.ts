import { expect, test } from "../../fixtures/test";
import { futureDate, futureApiDate } from "../../helpers/date";
import { env } from "../../environments";


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
    expect(roomTypes).toHaveLength(count);
    expect(roomTypes).toEqual(expect.arrayContaining(["Single", "Double", "Suite"]));
  });
});

/**
 * US2: "The user is informed on the page if there are no rooms available."
 *
 * Note: there is no "no rooms available" message in the front end — the grid
 * renders `rooms.slice(0, 3).map(...)` with no empty-state branch, so when
 * nothing is available the grid is simply empty (confirmed in source — see
 * qe_technical_exercise.md, Task 1 §2). This test therefore asserts only that
 * no room cards are displayed; the missing message is recorded as a defect.
 *
 * This runs and passes against the shared demo: the setup books out every room
 * available for a far-future date via the API, and the test asserts the grid is
 * empty immediately after. So zero availability only has to exist for the
 * instant of the assertion — it does not need to be *held*, which the shared
 * demo cannot do (other users create rooms continuously). Setup/teardown make
 * it self-contained.
 *
 * Caveat: there is a small race if another user creates a room between the API
 * setup and the UI re-query (rare for a far-future date; CI retries absorb it),
 * so an isolated Docker instance (ENV=local) remains the cleaner long-term home.
 */
test.describe("Availability checker — no rooms available", () => {

  // Same calendar day in both formats: UI uses dd/mm/yyyy, API uses yyyy-mm-dd.
  const checkInUi = futureDate(120);
  const checkOutUi = futureDate(121);
  const checkInApi = futureApiDate(120);
  const checkOutApi = futureApiDate(121);

  let bookingIds: number[] = [];

  // Empty-state rendering is browser-agnostic, and the real booking setup
  // contends on shared inventory when every project books the same date. Skip
  // on non-chromium first, so the booking setup below never runs there; then
  // book every room available for the date range so none remain.
  test.beforeEach(async ({ bookingApi }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Empty-state is browser-agnostic — run once on chromium to avoid cross-project inventory contention.",
    );
    bookingIds = await bookingApi.bookAllRooms(checkInApi, checkOutApi);
  });

  // Teardown: get an admin token via the auth API and delete the bookings.
  test.afterEach(async ({ bookingApi, authApi }) => {
    const token = await authApi.getToken(
      env.users.admin.Username,
      env.users.admin.Password,
    );
    await Promise.all(bookingIds.map((id) => bookingApi.delete(id, token)));
  });

  test("no room cards are displayed when none are available", async ({ homePage }) => {
    await homePage.pageload();
    await homePage.setCheckInDate(checkInUi);
    await homePage.setCheckOutDate(checkOutUi);
    await homePage.checkAvailability();

    // The front end has no "no rooms available" message (see Task 1 §2), so the
    // only assertable UI signal is that the grid renders no room cards.
    // toHaveCount auto-retries until the grid re-renders, rather than reading
    // the count once before React has cleared the previous cards.
    await expect(homePage.roomCards).toHaveCount(0);
  });
});

/**
 * Stubbed counterpart to the test above. Instead of booking out real inventory,
 * it intercepts the date-filtered availability call and returns zero rooms, so
 * the empty-state renders deterministically with no dependency on shared demo
 * data. This is cheap and reliable enough to run on every browser, giving
 * cross-engine coverage of the empty grid that the real-API test (chromium
 * only) deliberately skips. See qe_technical_exercise.md, Task 2 §5.
 */
test.describe("Availability checker — no rooms available (stubbed)", () => {
  test("the grid renders empty when the API returns no rooms", async ({ homePage, page }) => {
    // Stub before navigating so every date-filtered call returns an empty list.
    await page.route("**/api/room?checkin*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ rooms: [] }),
      }),
    );

    await homePage.pageload();
    await homePage.setCheckInDate(futureDate(120));
    await homePage.setCheckOutDate(futureDate(121));
    await homePage.checkAvailability();

    // Same known gap as the real-API test: no "no rooms available" message
    // exists, so the empty grid is the only assertable signal (US2 AC3 defect).
    await expect(homePage.roomCards).toHaveCount(0);
  });
});
