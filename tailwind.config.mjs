/** @type {import('tailwindcss').Config} */
export default {
content: [
"./src/app/**/*.{ts,tsx}",
"./src/components/**/*.{ts,tsx}"
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