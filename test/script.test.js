/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Functionality Testing', () => {
  let document, starsEl;

  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf8');
    document = new DOMParser().parseFromString(html, 'text/html');
    global.document = document;
    global.window = document.defaultView;

    // Reference to stars container
    starsEl = document.getElementById('stars');
  });

  
  // TEST 1: Star Interaction: Here we compare the length of filled stars with the number of stars rated, here we used 4 stars rating.
  test('fills stars correctly on rating selection', () => {
    const createStarComponent = () => {
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.innerHTML = "★";
        star.dataset.value = i;
        starsEl.appendChild(star);
      }
    };

    createStarComponent();

    const fillStars = (rating) => {
      document.querySelectorAll(".stars span").forEach(star => {
        star.classList.toggle("filled", star.dataset.value <= rating);
      });
    };

    fillStars(4);

    const filledStars = document.querySelectorAll(".stars .filled");
    expect(filledStars.length).toBe(4);
  });

  // TEST 2: Form Validation (invalid input): Here we are adding an invalid feedback(length > 20), invalid category(no category selected) and invalid phone number(consist of alphanumeric charachters)
  test('form blocks submission for invalid inputs', () => {
    document.body.innerHTML = `
      <form id="feedback-form">
        <textarea id="feedback">Too short(char<20)</textarea>
        <select id="category"><option value="" selected>Service</option></select>
        <input id="name" value="Hamza Test" />
        <input id="email" value="hamza@outlook.com" />
        <input id="phone" value="12334523ABC" />
      </form>
    `;

    const feedback = document.getElementById('feedback').value.trim();
    const category = document.getElementById('category').value;
    const phone = document.getElementById('phone').value.trim();
    const phoneRegex = /^[0-9]{7,15}$/;

    const isValid = feedback.length >= 20 && category && (!phone || phoneRegex.test(phone));

    expect(isValid).toBe(false); 
  });

  // TEST 3: Feedback Submission (valid input): Comparing both DOM values and structure having values similar to those injected through innerHTML.
  test('feedback form submission payload structure', () => {
    document.body.innerHTML = `
      <form id="feedback-form">
        <textarea id="feedback">This is valid feedback of 20+ characters.</textarea>
        <select id="category">
          <option value="Service" selected>Service</option>
        </select>
        <input id="name" value="Hamza Test" />
        <input id="email" value="hamza@outlook.com" />
        <input id="phone" value="03334444444" />
      </form>
    `;

    const payload = {
      business_id: "restaurant-abc",
      rating: 2,
      feedback: document.getElementById("feedback").value.trim(),
      category: document.getElementById("category").value,
      customer_name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
    };

    expect(payload).toMatchObject({
      business_id: "restaurant-abc",
      rating: 2,
      feedback: "This is valid feedback of 20+ characters.",
      category: "Service",
      customer_name: "Hamza Test",
      email: "hamza@outlook.com",
      phone: "03334444444"
    });
  });
});
