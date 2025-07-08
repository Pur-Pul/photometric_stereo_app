import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import 'dotenv/config'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	root: 'client',
	server: {
		proxy: {
			'/api': {
				target: `http://localhost:${process.env.PORT}`,
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: '../dist',
		emptyOutDir: true,
	},
})