import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`

/* 🔹 Base Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Work Sans", sans-serif;
}

html {
  font-size: 62.5%; /* 1rem = 10px */
  overflow-x: hidden;
  scroll-behavior: smooth;
}

body {
  overflow-x: hidden;
  scrollbar-color: ${({ theme }) => theme.colors.btn} transparent;
  scrollbar-width: thin;
  background-color: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 🔹 Scrollbar Styling */
body::-webkit-scrollbar {
  width: 1.2rem;
}

body::-webkit-scrollbar-track {
  background-color: ${({ theme }) => theme.colors.bg};
}

body::-webkit-scrollbar-thumb {
  background: ${({ theme }) => theme.colors.btn};
  border-radius: 1rem;
  border: 3px solid ${({ theme }) => theme.colors.bg};
}

/* 🔹 Typography */
h1,
h2,
h3,
h4 {
  font-family: "Work Sans", sans-serif;
  line-height: 1.2;
}

h1 {
  color: ${({ theme }) => theme.colors.heading};
  font-size: 6rem;
  font-weight: 900;
}

h2 {
  color: ${({ theme }) => theme.colors.heading};
  font-size: 4.4rem;
  font-weight: 500;
  white-space: normal;
}

h3 {
  font-size: 2rem;
  font-weight: 500;
}

p, button {
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.6rem;
  line-height: 1.6;
  font-weight: 400;
}

a {
  text-decoration: none;
  color: inherit;
}

li {
  list-style: none;
}

/* 🔹 Layout Utilities */
.container {
  max-width: 120rem;
  margin: 0 auto;
  padding: 0 2rem;
}

.grid {
  display: grid;
  gap: 9rem;
}

.grid-two-column {
  grid-template-columns: repeat(2, 1fr);
}

.grid-three-column {
  grid-template-columns: repeat(3, 1fr);
}

.grid-four-column {
  grid-template-columns: 1fr 1.2fr 0.5fr 0.8fr;
}

.grid-five-column {
  grid-template-columns: repeat(5, 1fr);
}

/* 🔹 Common Headings */
.common-heading {
  font-size: 3.8rem;
  font-weight: 600;
  margin-bottom: 6rem;
  text-transform: capitalize;
  text-align: center;
  position: relative;
}

.intro-data {
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.btn};
  font-weight: 600;
}

.caption {
  position: absolute;
  top: 15%;
  right: 10%;
  text-transform: uppercase;
  background-color: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.helper};
  padding: 0.8rem 2rem;
  font-size: 1.2rem;
  border-radius: 2rem;
}

/* 🔹 Forms */
input, textarea {
  max-width: 50rem;
  width: 100%;
  color: ${({ theme }) => theme.colors.black};
  padding: 1.6rem 2.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-transform: uppercase;
  border-radius: 0.5rem;
  box-shadow: ${({ theme }) => theme.colors.shadowSupport};
  transition: all 0.2s ease;
}

input:focus,
textarea:focus {
  border-color: ${({ theme }) => theme.colors.btn};
  outline: none;
}

input[type="submit"] {
  max-width: 18rem;
  margin-top: 2rem;
  background-color: ${({ theme }) => theme.colors.btn};
  color: ${({ theme }) => theme.colors.white};
  padding: 1.4rem 2.2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.8rem;
  font-weight: 500;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
}

input[type="submit"]:hover {
  transform: scale(0.95);
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.btn};
  border: 1px solid ${({ theme }) => theme.colors.btn};
}

/* 🔹 Modern Dropdown */
select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  width: 20rem;
  padding: 1rem 1.2rem;
  font-size: 1.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  position: relative;

  /* Custom arrow */
  background-image: linear-gradient(45deg, transparent 50%, ${({ theme }) =>
    theme.colors.btn} 50%),
    linear-gradient(135deg, ${({ theme }) => theme.colors.btn} 50%, transparent 50%);
  background-position: calc(100% - 1.2rem) calc(50% - 0.3rem),
    calc(100% - 0.8rem) calc(50% - 0.3rem);
  background-size: 0.5rem 0.5rem, 0.5rem 0.5rem;
  background-repeat: no-repeat;
  padding-right: 3rem; /* space for arrow */
}

select:hover,
select:focus {
  border-color: ${({ theme }) => theme.colors.btn};
  box-shadow: 0 4px 12px rgba(0,64,128,0.2);
}

select option {
  padding: 1rem;
  font-size: 1.4rem;
  background: #fff;
  color: ${({ theme }) => theme.colors.text};
}

/* 🔹 Responsive */
@media (max-width: ${({ theme }) => theme.media.tab}) {
  .container {
    max-width: 95%;
    padding: 0 2rem;
  }
}

@media (max-width: ${({ theme }) => theme.media.mobile}) {
  html {
    font-size: 55%;
  }

  .grid {
    gap: 3.2rem;
  }

  .grid-two-column,
  .grid-three-column,
  .grid-four-column {
    grid-template-columns: 1fr;
  }
}

@keyframes glowPulse {
  0% {
    box-shadow: 0 0 5px rgba(98, 84, 243, 0.6), 0 0 10px rgba(98, 84, 243, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(98, 84, 243, 0.9), 0 0 30px rgba(98, 84, 243, 0.7);
  }
  100% {
    box-shadow: 0 0 5px rgba(98, 84, 243, 0.6), 0 0 10px rgba(98, 84, 243, 0.4);
  }
}

.chat-icon-btn:hover {
  animation: none; /* stops pulsing */
  box-shadow: 0 0 25px rgba(98, 84, 243, 1), 0 0 40px rgba(98, 84, 243, 0.9); /* steady glow */
}
`;
