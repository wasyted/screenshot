import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

type RenderRequest = {
  url: string
  resolution: 'desktop' | 'tablet' | 'mobile'
  removeAds?: boolean
  removeCookies?: boolean
  forceDarkMode?: boolean
}

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RenderRequest

    const { url, resolution, removeAds, removeCookies, forceDarkMode } = body

    if (!url || !resolution) {
      return NextResponse.json({ error: 'Missing url or resolution' }, { status: 400 })
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setViewport(VIEWPORTS[resolution])

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    // 🧩 Inyecciones opcionales
    if (removeAds) {
      await page.addStyleTag({ content: '[id*="ad"], [class*="ad"] { display: none !important; }' })
    }

    if (removeCookies) {
      await page.evaluate(() => {
        const selectors = ['[id*="cookie"]', '[class*="cookie"]']
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => el.remove())
        })
      })
    }

    if (forceDarkMode) {
      await page.evaluate(() => {
        document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)'
        document.body.style.backgroundColor = '#111'
      })
    }

    // 📸 Screenshot en base64
    const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true })

    await browser.close()

    return NextResponse.json({ screenshot: `data:image/png;base64,${screenshot}` })
  } catch (err) {
    console.error('[ERROR /api/render]', err)
    return NextResponse.json({ error: 'Error rendering page' }, { status: 500 })
  }
}
