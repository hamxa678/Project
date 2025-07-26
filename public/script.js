// Extract the business ID from the query parameter (?business=xyz)
const params = new URLSearchParams(window.location.search);
const businessId = params.get("business");



//  DOM element references
const businessNameEl = document.getElementById("business-name");
const businessDescription = document.getElementById("description");
const starsEl = document.getElementById("stars");
const thankYouEl = document.getElementById("thank-you");
const feedbackForm = document.getElementById("feedback-form");



//  RegEx for validation
const phoneRegex = /^[0-9]{7,15}$/; // allows only digits, 7–15 length
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // simple email pattern



//  Runtime variables
let selectedRating = 0;
let gmbUrl = '';



//  Load business details from backend
fetch(`/api/business/${businessId}`)
  .then(async (res) => {
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Unknown error");
    }
    return res.json();
  })
  .then(business => {
    businessNameEl.textContent = business.name;
    businessDescription.textContent = business.description || '';
    gmbUrl = business.gmb_url;

    if (business.image) {
      document.body.style.backgroundImage = `url('${business.image}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
    }
    createStarComponent();
  })
  .catch(error => {
    businessNameEl.textContent = `${error.message}`;
    if (starsEl) starsEl.remove();
  });



//  Creates 5 clickable stars and attaches event listeners
function createStarComponent() {
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.innerHTML = "★";
    star.dataset.value = i;

    // Event Listeners
    star.addEventListener("mouseover", () => fillStars(i));
    star.addEventListener("mouseout", () => fillStars(selectedRating));
    star.addEventListener("click", () => handleRating(i));

    starsEl.appendChild(star);
  }
}



// Fills in stars visually based on hover or selection
function fillStars(rating) {
  document.querySelectorAll(".stars span").forEach(star => {
    star.classList.toggle("filled", star.dataset.value <= rating);
  });
}

//  Handles logic when a user selects a star rating
function handleRating(rating) {
  selectedRating = rating;
  fillStars(rating);

  const interaction = {
    business_id: businessId,
    rating,
    action: rating >= 4 ? "redirected_to_gmb" : "shown_feedback_form"
  };

  //  Log interaction to server
  fetch("/api/interaction", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(interaction)
  });

  if (rating >= 4) {
    // High rating(4 or 5 stars rating) → redirect to Google review
    thankYouEl.textContent = "Thank you! Redirecting you to Google reviews...";
    thankYouEl.classList.remove("hidden");

    setTimeout(() => {
      window.location.href = gmbUrl;
    }, 2000);
  } else {
    // Low rating(1 to 3 stars rating) → show internal feedback form
    feedbackForm.classList.remove("hidden");
  }
}

//  Handles feedback form submission
feedbackForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  //  Gather all feedback data from form
  const payload = {
    business_id: businessId,
    rating: selectedRating,
    feedback: document.getElementById("feedback").value.trim(),
    category: document.getElementById("category").value,
    customer_name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
  };



  // Basic validation for required fields i.e. Feedback and feedback category
  if (payload.feedback.length < 20 || !payload.category) {
    alert("Please fill in required fields with at least 20 characters of feedback.");
    return;
  }
  if (payload.phone && !phoneRegex.test(payload.phone))
    return alert("Phone number must contain only digits (7–15 characters).");
  
  if (payload.email && !emailRegex.test(payload.email))
    return alert("Please enter a valid email address.");



  //  Submit feedback to server
  await fetch("/api/feedback", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });



  //  Reset form and show thank-you message
  feedbackForm.reset();
  feedbackForm.classList.add("hidden");
  thankYouEl.textContent = "Thank you for your feedback! We’ll use this to improve.";
  thankYouEl.classList.remove("hidden");
});
