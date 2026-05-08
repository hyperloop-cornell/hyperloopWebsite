/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./*.html",
    "./subteam-views/*.html",
    "./shared.js"
  ],
  theme: {
    extend: {
      colors: {
        "on-tertiary-container": "#f0f2ff", "inverse-primary": "#bb171d",
        "surface-container-low": "#151b2d", "primary-fixed-dim": "#ffb4ac",
        "secondary-fixed-dim": "#b7c8e1", "on-tertiary-fixed-variant": "#3f465c",
        "primary-fixed": "#ffdad6", "surface-container-high": "#23293c",
        "on-surface": "#dce1fb", "tertiary-fixed-dim": "#bec6e0",
        "primary": "#ffb4ac", "surface-bright": "#33394c",
        "on-error": "#690005", "surface-container-highest": "#2e3447",
        "on-error-container": "#ffdad6", "secondary": "#b7c8e1",
        "on-tertiary": "#283044", "on-primary": "#690007",
        "on-secondary-container": "#a9bad3", "surface-variant": "#2e3447",
        "secondary-fixed": "#d3e4fe", "surface": "#0c1324",
        "on-primary-fixed-variant": "#93000e", "on-primary-fixed": "#410003",
        "outline": "#ab8985", "background": "#0c1324",
        "surface-dim": "#0c1324", "inverse-surface": "#dce1fb",
        "secondary-container": "#3a4a5f", "error": "#ffb4ab",
        "tertiary-container": "#666e85", "outline-variant": "#5b403d",
        "on-secondary": "#213145", "on-secondary-fixed-variant": "#38485d",
        "surface-tint": "#ffb4ac", "on-tertiary-fixed": "#131b2e",
        "on-background": "#dce1fb", "tertiary": "#bec6e0",
        "error-container": "#93000a", "surface-container": "#191f31",
        "on-surface-variant": "#e4beb9", "tertiary-fixed": "#dae2fd",
        "on-primary-container": "#ffeeec", "on-secondary-fixed": "#0b1c30",
        "surface-container-lowest": "#070d1f", "primary-container": "#d22b2b",
        "inverse-on-surface": "#2a3043"
      },
      spacing: {
        "unit": "4px", "container-max": "1280px", "gutter": "24px", "margin": "48px"
      },
      fontFamily: {
        "headline-xl": ["Space Grotesk"], "headline-lg": ["Space Grotesk"],
        "headline-md": ["Space Grotesk"], "body-md": ["Inter"],
        "body-lg": ["Inter"], "label-caps": ["Space Grotesk"],
        "mono-stats": ["Space Grotesk"]
      },
      fontSize: {
        "headline-xl": ["64px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "700" }],
        "headline-lg": ["40px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-caps": ["14px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "600" }],
        "mono-stats": ["48px", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }]
      }
    }
  },
  plugins: [
    require("@tailwindcss/forms")
  ]
}
