document.addEventListener("DOMContentLoaded", function () {
  // Manejador para las tarjetas principales (nivel 1: submetas)
  const objectiveHeaders = document.querySelectorAll(".objective-card-header");
  
  objectiveHeaders.forEach(header => {
    header.addEventListener("click", function () {
      const wrapper = this.closest(".objective-card-wrapper");
      if (!wrapper) return;
      
      const contentBox = wrapper.querySelector(".objective-content-box");
      const iconBtn = this.querySelector(".arrow-btn");
      
      if (!contentBox) return;

      const isVisible = contentBox.style.display === "block" || contentBox.classList.contains("show");
      
      if (isVisible) {
        contentBox.style.display = "none";
        contentBox.classList.remove("show");
        if (iconBtn) iconBtn.style.transform = "rotate(0deg)";
      } else {
        contentBox.style.display = "block";
        contentBox.classList.add("show");
        if (iconBtn) iconBtn.style.transform = "rotate(180deg)";
      }
    });
  });

  // Manejador para las tarjetas de años (nivel 2: distribución quinquenal)
  const yearHeaders = document.querySelectorAll(".year-card-header");
  
  yearHeaders.forEach(header => {
    header.addEventListener("click", function (event) {
      event.stopPropagation(); // Evita que propague el clic a la tarjeta principal
      
      const wrapper = this.closest(".year-card-wrapper");
      if (!wrapper) return;
      
      const contentBox = wrapper.querySelector(".year-content-box");
      const iconBtn = this.querySelector(".year-arrow-btn");
      
      if (!contentBox) return;

      const isVisible = contentBox.style.display === "block" || contentBox.classList.contains("show");
      
      if (isVisible) {
        contentBox.style.display = "none";
        contentBox.classList.remove("show");
        if (iconBtn) iconBtn.style.transform = "rotate(0deg)";
      } else {
        contentBox.style.display = "block";
        contentBox.classList.add("show");
        if (iconBtn) iconBtn.style.transform = "rotate(180deg)";
      }
    });
  });
});