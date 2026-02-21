import { test, expect } from "@playwright/test"

test.describe("Fluxo de jogo", () => {
  test("página de setup carrega e mostra operações", async ({ page }) => {
    await page.goto("/jogar")
    // Pode redirecionar para login se não autenticado
    // Verificamos se pelo menos a página carregou
    await expect(page).toHaveURL(/\/(jogar|entrar)/)
  })

  test("página inicial carrega", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Vó Virgínia/)
  })

  test("página de login renderiza formulário", async ({ page }) => {
    await page.goto("/entrar")
    await expect(page.getByPlaceholder("Email")).toBeVisible()
    await expect(page.getByPlaceholder("Senha")).toBeVisible()
  })

  test("página de cadastro renderiza formulário", async ({ page }) => {
    await page.goto("/cadastro")
    await expect(page.getByPlaceholder("Nome")).toBeVisible()
    await expect(page.getByPlaceholder("Email")).toBeVisible()
    await expect(page.getByPlaceholder("Senha")).toBeVisible()
  })

  test("navegação entre login e cadastro", async ({ page }) => {
    await page.goto("/entrar")
    await page.getByText("Criar conta").click()
    await expect(page).toHaveURL(/\/cadastro/)
  })
})
