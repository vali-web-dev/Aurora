/** @type {import('tailwindcss').Config} */
export default {
darkMode: 'class',
content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}"
],
theme: {
extend: {
    colors: {
    aurora: {
        bg: "#050712",
        surface: "#0B0F1F",
        accent: "#7DF9FF",
        accentSoft: "#3C7CFF",
        text: "#F5F7FF",
        muted: "#9CA3AF",
        border: "#1F2933"
    }
    },
    borderRadius: {
    xl: "1.25rem",
    "2xl": "1.75rem"
    },
    boxShadow: {
    aurora: "0 18px 60px rgba(0, 0, 0, 0.65)"
    }
}
},
plugins: []
};