/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [`./views/**/*.ejs`],
  plugins: [
    require('daisyui'),

  ],
  
  theme: {
    extend: {

      colors: {

        primary: '#4A90E2',
        secondary: '#F76C6C',
      },
    },
  },
};
