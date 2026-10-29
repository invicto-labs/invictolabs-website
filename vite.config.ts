import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig({ plugins: [react(), {
  name: 'missing-agent-catalog',
  configureServer(server) {
    server.middlewares.use('/.well-known/ai-catalog.json', (_req, res) => { res.statusCode = 404; res.end('Not found') })
  },
  configurePreviewServer(server) {
    server.middlewares.use('/.well-known/ai-catalog.json', (_req, res) => { res.statusCode = 404; res.end('Not found') })
    const routes = new Set(['/our-company', '/faq', '/products', '/products/traceq', '/products/titleflow-ai', '/products/tax-flow', '/services', '/services/title', '/services/mortgage', '/services/tax-property', '/services/technology', '/location', '/our-approach'])
    server.middlewares.use((req, res, next) => {
      const path = req.url?.split('?')[0].replace(/\/$/, '')
      if (path && (routes.has(path) || /^\/(blogs|case-studies)(\/[^/]+)?$/.test(path))) req.url = `${path}/index.html`
      const requestPath = (req.url ?? '/').split('?')[0]
      if (requestPath !== '/' && !existsSync(resolve('dist', `.${requestPath}`))) {
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(readFileSync('dist/404.html'))
        return
      }
      next()
    })
  },
}] })
