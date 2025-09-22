module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",   // ✅ App Router 사용 시
    "./pages/**/*.{js,ts,jsx,tsx}", // Pages Router 있을 때
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
