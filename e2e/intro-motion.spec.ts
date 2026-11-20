import { test, expect } from "@playwright/test";

const intro = (page: import("@playwright/test").Page) => page.getByTestId("welcome-intro");

test.describe("Bienvenida animada v0.7.1", () => {
  test("la primera visita presenta una bienvenida y permite omitirla", async ({ page }) => {
    await page.goto("/");
    await expect(intro(page)).toBeVisible();
    await expect(intro(page)).toContainText("A veces, todo empieza con una pausa.");
    await expect(intro(page).getByRole("button", { name: /Entrar ahora/ })).toBeVisible();
    await intro(page).getByRole("button", { name: /Entrar ahora/ }).click();
    await expect(intro(page)).toHaveCount(0);
    await expect(page.locator("main#contenido")).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("equilibramind:intro:v071"))).toBe("seen");
  });

  test("se muestra una vez por pestaña y no reaparece al recargar", async ({ page }) => {
    await page.goto("/");
    await expect(intro(page)).toBeVisible();
    await intro(page).getByRole("button", { name: /Entrar ahora/ }).click();
    await expect(intro(page)).toHaveCount(0);
    await page.reload();
    await page.waitForTimeout(300);
    await expect(intro(page)).toHaveCount(0);
  });

  test("se cierra automáticamente y se puede omitir con Escape", async ({ page, browser }) => {
    await page.goto("/");
    await expect(intro(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(intro(page)).toHaveCount(0);

    // En un contexto de navegador nuevo, la intro desaparece también por tiempo.
    const context = await browser.newContext();
    try {
      const second = await context.newPage();
      await second.goto("http://127.0.0.1:3100/");
      await expect(intro(second)).toBeVisible();
      await expect(intro(second)).toHaveCount(0, { timeout: 7000 });
    } finally {
      await context.close();
    }
  });

  test("respeta reducir movimiento y conserva la navegación con teclado", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(220);
    await expect(intro(page)).toHaveCount(0);

    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Saltar al contenido principal" })).toBeFocused();
  });

  test("no bloquea el menú ni crea desplazamiento horizontal en móvil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(intro(page)).toBeVisible();
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(intro(page)).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Navegación principal" })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
  });
});

test("las tarjetas empresariales siguen respondiendo al hover tras la entrada", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Navegación principal" })
    .getByRole("button", { name: "Para empresas" }).click();
  const card = page.locator(".company-journey-steps > li").first();
  await expect(card).toBeVisible();
  // La entrada dura 560 ms; su transform no debe quedar fijado tras completarse.
  await page.waitForTimeout(700);
  await card.hover();
  await expect(card).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -4)");
});
