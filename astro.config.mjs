import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
	output: "static",
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Archivo Black",
			cssVariable: "--font-heading",
			weights: [400],
			fallbacks: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
		},
	],
	devToolbar: { enabled: false },
});
