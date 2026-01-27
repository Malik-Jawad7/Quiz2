import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-r58y9vkx6-khalids-projects-3de9ee65.vercel.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxy Request:', req.method, req.url);
            
            // Remove any existing headers that might cause issues
            proxyReq.removeHeader('Origin');
            proxyReq.removeHeader('Referer');
            
            // Add necessary headers
            proxyReq.setHeader('X-Forwarded-For', req.socket.remoteAddress);
            proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
          });
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Proxy Response:', proxyRes.statusCode, req.url);
            
            // Ensure CORS headers are passed through
            proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
            proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
          });
        }
      }
    },
    port: 5173,
    host: true,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
    }
  }
})