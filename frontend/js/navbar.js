const menu = document.querySelector(".navbar__menu");
const button = document.querySelector(".menu-toggle");

button.addEventListener("click", () => {

    menu.classList.toggle("active");

});