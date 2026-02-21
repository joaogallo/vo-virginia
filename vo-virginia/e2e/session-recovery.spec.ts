import { test, expect } from "@playwright/test"

test.describe("Recuperação de sessão", () => {
  test("localStorage persiste entre navegações", async ({ page }) => {
    await page.goto("/")

    // Definir um item no localStorage
    await page.evaluate(() => {
      localStorage.setItem("test-key", "test-value")
    })

    // Navegar para outra página
    await page.goto("/entrar")

    // Verificar que o item ainda existe
    const value = await page.evaluate(() => localStorage.getItem("test-key"))
    expect(value).toBe("test-value")
  })

  test("página de jogo redireciona sem autenticação", async ({ page }) => {
    await page.goto("/jogar")
    // Deve redirecionar para login
    await expect(page).toHaveURL(/\/entrar/)
  })
})
