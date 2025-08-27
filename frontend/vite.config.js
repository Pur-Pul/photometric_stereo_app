import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import 'dotenv/config'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	root: '.',
	server: {
		proxy: {
			'/api': {
				target: `${process.env.BACKEND_URL}`,
				changeOrigin: true,
			},
		},
		allowedHosts: ["front", "front-dev"]
	},
	build: {
		outDir: './dist',
		emptyOutDir: true,
	},
	test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './testSetup.js',
    },
})