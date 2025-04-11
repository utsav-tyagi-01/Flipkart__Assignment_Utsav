const searchInputs = document.querySelectorAll(".header__search-input");
const dropdownList = document.querySelectorAll(".header__search-dropdown");



const trendingSearches = ["mobiles", "shoes", "t shirts", "laptops", "watches", "tv"];
let latestQuery = "";

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function fetchProducts(query) {
    const response = await fetch(`https://dummyjson.com/products/search?q=${query}`);
    const data = await response.json();
    return data.products || [];
}

  function hamburger(){
    const hamburgerIcon = document.querySelector(".header__hamburger i");
    const hamburgerMenu = document.querySelector(".header__hamburger-menu");

    if (hamburgerIcon && hamburgerMenu) {
      hamburgerIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        hamburgerMenu.classList.toggle("show");
      });

      document.addEventListener("click", (e) => {
        if (!e.target.closest(".header__hamburger")) {
          hamburgerMenu.classList.remove("show");
        }
      });
    }
  }

  hamburger();

function getDropdownForInput(input) {
  return input.parentElement.querySelector(".header__search-dropdown");
}


function renderTrending(dropdown) {
  dropdown.innerHTML = "<li style='font-weight:bold;'>Trending</li>";
  trendingSearches.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<i class="fa fa-search"></i> ${item}`;
    li.addEventListener("click", () => {
      window.location.href = `product.html?query=${encodeURIComponent(item)}`;
    });
    dropdown.appendChild(li);
  });
}

async function renderFilteredResults(keyword, dropdown) {
  dropdown.innerHTML = "";
  latestQuery = keyword;

  try {
    const res = await fetch(`https://dummyjson.com/products/search?q=${keyword}`);
    const data = await res.json();

    if (keyword !== latestQuery) return;

    if (data.products.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No results found";
      li.style.color = "#888";
      li.style.cursor = "default";
      dropdown.appendChild(li);
    } else {
      data.products.slice(0, 8).forEach(product => {
        const li = document.createElement("li");
        li.innerHTML = `<i class="fa fa-search"></i> ${product.title}`;
        li.addEventListener("click", () => {
          window.location.href = `product.html?query=${encodeURIComponent(product.title)}`;
        });
        dropdown.appendChild(li);
      });
    }
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

function positionDropdown(input, dropdown) {
  const rect = input.getBoundingClientRect();
 const width = window.innerWidth;
 if(width<=798){
  dropdown.style.position = "absolute";
  dropdown.style.top = `${window.scrollY + rect.bottom}px`;
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.width = `${rect.width}px`;
  dropdown.style.zIndex = "9";
  dropdown.style.display = "block";
 }
 else{
 
  dropdown.style.position = "absolute";
  dropdown.style.top = `${input.offsetTop + input.offsetHeight}px`;
  dropdown.style.left = `${input.offsetLeft}px`;
  dropdown.style.width = `${input.offsetWidth}px`;
  dropdown.style.display = "block";
  dropdown.style.zIndex = "999";
 }
}



searchInputs.forEach((input) => {
  const dropdown = getDropdownForInput(input);

  input.addEventListener("input", debounce(async () => {
    const keyword = input.value.trim();
    if (keyword === "") {
      renderTrending(dropdown);
    } else {
      await renderFilteredResults(keyword, dropdown);
    }
    positionDropdown(input, dropdown);
  }, 300));

  input.addEventListener("focus", () => {
    if (input.value.trim() === "") {
      renderTrending(dropdown);
    }
    positionDropdown(input, dropdown);
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && input.value.trim() !== "") {
      window.location.href = `product.html?query=${encodeURIComponent(input.value.trim())}`;
    }
  });
});


document.addEventListener("click", (e) => {
  searchInputs.forEach((input) => {
    const dropdown = getDropdownForInput(input);
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
});
