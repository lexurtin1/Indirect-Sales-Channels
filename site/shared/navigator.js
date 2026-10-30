(function () {
  const firms = [
    {
      name: "Northwind Asset Management",
      path: ["Calastone coverage desk", "Harbour Advisory", "Northwind Asset Management"]
    },
    {
      name: "Ashworth Investors",
      path: ["Calastone coverage desk", "Harbour Advisory, funds partner", "Ashworth Investors"]
    },
    {
      name: "Linden Funds",
      path: ["Calastone coverage desk", "Harbour Advisory, retainer", "Linden Funds"]
    },
    {
      name: "Westmere Capital",
      path: ["Calastone coverage desk", "Harbour Advisory", "Westmere Capital"]
    }
  ];
  const list = document.getElementById("firms");
  const path = document.getElementById("path");
  const title = document.getElementById("path-title");

  function draw(index) {
    const firm = firms[index];
    title.textContent = firm.name;
    path.innerHTML = "";
    firm.path.forEach((step, stepIndex) => {
      const item = document.createElement("li");
      item.textContent = step;
      path.appendChild(item);
      const mark = () => item.classList.add("is-on");
      if (window.iscMotionOk && window.iscMotionOk()) setTimeout(mark, 180 * stepIndex);
      else mark();
    });
    list.querySelectorAll("button").forEach((button, buttonIndex) => {
      button.setAttribute("aria-pressed", buttonIndex === index ? "true" : "false");
    });
  }

  firms.forEach((firm, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === 0 ? "hotspot" : "";
    button.textContent = firm.name;
    button.addEventListener("click", () => draw(index));
    list.appendChild(button);
  });
  draw(0);
})();
