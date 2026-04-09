import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.describe("SoloShift MVP", () => {
  test.skip(!email || !password, "E2E_EMAIL and E2E_PASSWORD are required for end-to-end tests.");

  test("can sign in and reach the dashboard shell", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("이메일").fill(email!);
    await page.getByLabel("비밀번호").fill(password!);
    await page.getByRole("button", { name: "로그인" }).click();

    await expect(page).toHaveURL(/\/(onboarding)?$/);
    await expect(page.getByText(/SoloShift/)).toBeVisible();
  });
});
