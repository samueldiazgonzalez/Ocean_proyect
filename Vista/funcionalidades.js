document.addEventListener("DOMContentLoaded", () => {

  /* ===== 1. CAMBIO DE IMAGEN PRINCIPAL ===== */
  const heroImg = document.querySelector(".hero-img");
  const thumbs = document.querySelectorAll(".thumb");

  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      const info = thumb.getAttribute("data-info");
      if(info) {
        heroImg.classList.add("fade");
        setTimeout(() => heroImg.classList.remove("fade"), 300);
      }
    });
  });

  /* ===== 2. CALCULO TOTAL RESERVA ===== */
  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");
  const guests = document.getElementById("guests");
  const totalPrice = document.getElementById("totalPrice");

  const pricePerNight = 250000; // Precio base por noche COP
  const formatterCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  });

  function calculateTotal() {
    const inDate = new Date(checkin.value);
    const outDate = new Date(checkout.value);
    const numGuests = parseInt(guests.value) || 1;

    if (checkin.value && checkout.value && outDate > inDate) {
      const nights = (outDate - inDate) / (1000*60*60*24);
      const total = nights * pricePerNight * numGuests;
      totalPrice.textContent = formatterCOP.format(total);
    } else {
      totalPrice.textContent = "$0";
    }
  }

  [checkin, checkout, guests].forEach(input => input.addEventListener("change", calculateTotal));

  /* ===== 3. CONTADOR DE CARACTERES TEXTAREA ===== */
  const commentInput = document.getElementById("commentInput");
  const charCount = document.getElementById("charCount");

  commentInput.addEventListener("input", () => {
    charCount.textContent = `${commentInput.value.length} / 250`;
  });

  /* ===== 4. VALORACIÓN CON ESTRELLAS ===== */
  const starRating = document.getElementById("starRating");
  let selectedRating = 0;

  starRating.querySelectorAll("span").forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = star.getAttribute("data-value");
      starRating.querySelectorAll("span").forEach((s, index) => {
        if(index < selectedRating) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });
    star.addEventListener("mouseover", () => {
      const value = star.getAttribute("data-value");
      starRating.querySelectorAll("span").forEach((s, index) => {
        if(index < value) {
          s.style.color = "#fbbf24";
        } else {
          s.style.color = "#e5e7eb";
        }
      });
    });
  });

  starRating.addEventListener("mouseleave", () => {
    starRating.querySelectorAll("span").forEach((s, index) => {
      if(index < selectedRating) {
        s.style.color = "#fbbf24";
      } else {
        s.style.color = "#e5e7eb";
      }
    });
  });

  /* ===== 5. TOAST / RESERVA ===== */
  const reserveBtn = document.getElementById("reserveBtn");
  const toast = document.createElement("div");
  toast.classList.add("toast");
  document.body.appendChild(toast);

  reserveBtn.addEventListener("click", () => {
    const total = totalPrice.textContent;
    if (total === "$0") {
      showToast("Selecciona fechas válidas antes de reservar 🗓️", true);
      return;
    }
    showToast(`Reserva completada por ${total} ✅`);
  });

  /* ===== 7. ENVÍO DE RESEÑA ===== */
  const submitReviewBtn = document.getElementById("submitReview");
  const reviewsList = document.getElementById("reviewsList");

  submitReviewBtn.addEventListener("click", () => {
    const comment = commentInput.value.trim();
    if(!comment) {
      showToast("Por favor escribe una reseña 📝", true);
      return;
    }
    if(selectedRating === 0) {
      showToast("Por favor selecciona una valoración ⭐", true);
      return;
    }
    
    const newReview = document.createElement("div");
    newReview.className = "review";
    newReview.innerHTML = `
      <div class="review-header">
        <img src="https://randomuser.me/api/portraits/lottie/47.jpg" alt="avatar" class="review-avatar">
        <div>
          <strong>Tú</strong>
          <div class="review-stars">${"⭐".repeat(selectedRating)}</div>
        </div>
      </div>
      <p>${comment}</p>
    `;
    reviewsList.appendChild(newReview);
    showToast("Reseña publicada exitosamente ✅");
    commentInput.value = "";
    charCount.textContent = "0 / 250";
    selectedRating = 0;
    starRating.querySelectorAll("span").forEach(s => {
      s.classList.remove("active");
      s.style.color = "#e5e7eb";
    });
  });

  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.style.background = isError ? "#b91c1c" : "#047857";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3200);
  }

  /* ===== 6. EXPANDIR DESCRIPCIÓN ===== */
  const expandBtn = document.getElementById("expandDesc");
  const extraDesc = document.getElementById("extraDesc");
  extraDesc.style.display = "none";

  expandBtn.addEventListener("click", () => {
    if(extraDesc.style.display === "none") {
      extraDesc.style.display = "block";
      expandBtn.textContent = "Mostrar menos";
    } else {
      extraDesc.style.display = "none";
      expandBtn.textContent = "Mostrar más";
    }
  });

});
