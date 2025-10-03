/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sesm-deep': '#0C4B5E',
        'sesm-teal': '#147E83',
        'sesm-sky': '#29B9C3',
        // Warna baru untuk tombol welcome
        'sesm-button-bg': '#D7DDDC',
        'sesm-button-text': '#3E5455',
      },
      fontFamily: {
        // Daftarkan font baru di sini
        'sans': ['Poppins', 'sans-serif'], // Ganti font default ke Poppins
        'lora': ['Lora', 'serif'], // Font Lora untuk slogan
      }
    },
  },
  plugins: [],
}