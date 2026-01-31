/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#8B5E3C",
                gold: "#D4AF37",
                accent: "#D4AF37",
                "luxury-brown": "#3d2b1f",
                "background-light": "#FDFBF7",
                "background-dark": "#1A1614",
            },
            fontFamily: {
                display: ["Cinzel", "serif"],
                sans: ["Montserrat", "sans-serif"],
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio'),
    ],
}
