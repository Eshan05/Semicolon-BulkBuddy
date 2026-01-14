
import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
	await page.goto("http://localhost:3000/");

	await expect(page).toHaveTitle(/BulkBuddy/i);
	await expect(page.getByRole("link", { name: "BulkBuddy", exact: true })).toBeVisible();
});

