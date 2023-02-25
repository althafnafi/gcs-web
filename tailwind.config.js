/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    fontFamily: {
      mono: ["Ubuntu Mono"],
      roboto: ["Roboto"],
      roboto_bold: ["Roboto Bold"],
      jetbrains: ["JetBrains Mono"],
      jetbrains_bold: ["JetBrains Mono Bold"],
    },
    extend: {},
  },
  plugins: [require("daisyui")],
};
