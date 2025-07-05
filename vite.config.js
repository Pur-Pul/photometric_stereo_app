import { defineConfig } from 'vite'
import config from './utils/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	root: 'client',
	server: {
		proxy: {
			'/api': {
				target: `http://localhost:${config.PORT}`,
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: '../dist',
		emptyOutDir: true,
	},
})