import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,   // bind to 0.0.0.0 so Meta Quest on same WiFi can connect
    https: {
      key: './key.pem',
      cert: './cert.pem',
    }
  }
})
