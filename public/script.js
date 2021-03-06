window.addEventListener("scroll", () => {
  const scroll = window.scrollY;
  const navbar = document.querySelector("#navbar");

  if (scroll > 227.516) 
    navbar.classList.add("shadow")
  else 
    navbar.classList.remove("shadow");
});