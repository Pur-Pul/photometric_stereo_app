import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
	globalIgnores(["**/tests/", "eslint.config.js"]),
	{
		files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
		rules: {
			indent: ["error", 4],
			"linebreak-style": ["error", "unix"],
			quotes: ["error", "single"],
			semi: ["error", "never"],
			eqeqeq: "error",
			"no-trailing-spaces": "error",
			"object-curly-spacing": ["error", "always"],
			"arrow-spacing": ["error", { before: true, after: true }],
			"no-console": "error",
			"react/react-in-jsx-scope": "off",
			"react/prop-types": 0,
			"no-unused-vars": "error",
		},
	},
]);