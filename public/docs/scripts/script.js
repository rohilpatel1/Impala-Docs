const sections = document.querySelectorAll(".section");

function createDropDown(element) {
  console.log(element);
  const sectionId = element.querySelector(".section-id")?.getElementByTagName("a")[0];
  if (!sectionId) return;

  const sectionContent = element.querySelector(".section-content");
  if (!sectionContent) return;

  sectionId.addEventListener("click", () => {
    sectionContent.classList.toggle("")
  }, true);
}

for (const section of sections) {
  if (section instanceof HTMLElement) {
    createDropDown(section);
  }
}