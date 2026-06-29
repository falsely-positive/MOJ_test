import { Page, Locator} from '@playwright/test';
import { BasePage } from './basePage';

export class HomePage extends BasePage {

private readonly checkInInput: Locator;
private readonly checkOutInput: Locator;
readonly roomCards: Locator;
private readonly roomTitles: Locator;
private readonly checkAvailabilityButton: Locator;
readonly path = "/";  



  constructor(page: Page) {
    super(page);
    this.checkAvailabilityButton = page.getByRole("button", { name: "Check Availability" });
    this.checkInInput = page
      .locator('label[for="checkin"]', { hasText: "Check In" })
      .locator("+ .dateWrapper input.form-control");
    this.checkOutInput = page
      .locator('label[for="checkout"]', { hasText: "Check Out" })
      .locator("+ .dateWrapper input.form-control");
    this.roomCards = page.locator(".room-card");
    this.roomTitles = page.locator(".room-card .card-title");
  }

  async getCheckInInput(): Promise<string> {
    return await this.checkInInput.inputValue();
  }

  async getCheckOutInput(): Promise<string> {
    return await this.checkOutInput.inputValue();
  }

  async setCheckInDate(date: string): Promise<void> {
    await this.checkInInput.fill(date);
  }

  async setCheckOutDate(date: string): Promise<void> {
    await this.checkOutInput.fill(date);
  } 

  async pageload() {
    await this.goto();
    await this.checkAvailabilityButton.isVisible();
  }

    async getAvailableRoomCount(): Promise<number> {
    return this.roomCards.count();
  }

  async checkAvailability(): Promise<void> {
    // Wait for the date-filtered availability response so callers read the
    // checked result, not the rooms rendered on initial page load.
    await Promise.all([
      this.page.waitForResponse((response) =>
        response.url().includes("/api/room?checkin"),
      ),
      this.checkAvailabilityButton.click(),
    ]);
  }

  async getAvailableRoomTypes(): Promise<string[]> {
    const roomTypes: string[] = [];
    const count = await this.roomTitles.count();
    for (let i = 0; i < count; i++) {
      roomTypes.push(await this.roomTitles.nth(i).innerText());
    }
    return roomTypes;
  }
}