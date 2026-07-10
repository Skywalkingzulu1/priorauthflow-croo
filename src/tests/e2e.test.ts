import { describe, it, expect } from "vitest"
import puppeteer from "puppeteer"

const BASE = process.env.PUPPETEER_BASE_URL || "http://localhost:4173"

describe("PriorAuthFlow E2E", () => {
  it("health endpoint is up", async () => {
    const res = await fetch(BASE + "/api/health")
    expect(res.ok).toBe(true)
    const data = await res.json()
    expect(data.ok).toBe(true)
  })

  it("homepage loads", async () => {
    const browser = await puppeteer.launch({ headless: "new" as any })
    try {
      const page = await browser.newPage()
      await page.goto(BASE, { waitUntil: "load" })
      await page.waitForSelector("h1", { timeout: 3000 })
      const title = await page.$eval("h1", el => el.textContent?.trim() || "")
      expect(title).toContain("PriorAuthFlow")
    } finally {
      await browser.close()
    }
  }, 10000)

  it("demo sections render", async () => {
    const browser = await puppeteer.launch({ headless: "new" as any })
    try {
      const page = await browser.newPage()
      await page.goto(BASE, { waitUntil: "networkidle0" })
      const text = await page.content()
      expect(text).toContain("Problem")
      expect(text).toContain("How it works")
      expect(text).toContain("Live demo")
    } finally {
      await browser.close()
    }
  })
})
