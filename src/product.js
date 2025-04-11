document.querySelectorAll(".accordion__header").forEach((header) => {
  header.addEventListener("click", () => {
    const item = header.parentElement;
    item.classList.toggle("active");
  });
});

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

let currentProducts = [];
const searchInput = document.querySelector(".header__search-input");
const dropdownList = document.getElementById("dropdownList");

const trendingSearches = [
  "mobiles",
  "shoes",
  "t shirts",
  "laptops",
  "watches",
  "tv",
];

async function fetchDropdownProducts(query) {
  const response = await fetch(
    `https://dummyjson.com/products/search?q=${query}`
  );
  const data = await response.json();
  return data.products || [];
}

function renderTrending() {
  dropdownList.innerHTML = "";
  dropdownList.innerHTML = "<li>Trending</li>";
  trendingSearches.slice(0, 8).forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<i class="fa fa-search"></i> ${item}`;
    li.addEventListener("click", () => {
      window.location.href = `product.html?query=${encodeURIComponent(item)}`;
    });
    dropdownList.appendChild(li);
  });
}

async function renderFilteredResults(keyword) {
  dropdownList.innerHTML = "";
  latestQuery = keyword;

  try {
    const res = await fetch(
      `https://dummyjson.com/products/search?q=${keyword}`
    );
    const data = await res.json();
    if (keyword !== latestQuery) return;

    if (data.products.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No results found";
      li.style.color = "#888";
      li.style.cursor = "default";
      dropdownList.appendChild(li);
    } else {
      data.products.slice(0, 8).forEach((product) => {
        const li = document.createElement("li");
        li.innerHTML = `<i class="fa fa-search"></i> ${product.title}`;
        li.addEventListener("click", () => {
          window.location.href = `product.html?query=${encodeURIComponent(
            product.title
          )}`;
        });
        dropdownList.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

searchInput.addEventListener(
  "input",
  debounce(async () => {
    const keyword = searchInput.value.trim();
    if (keyword === "") {
      renderTrending();
    } else {
      await renderFilteredResults(keyword);
    }
    dropdownList.style.display = "block";
  }, 300)
);

searchInput.addEventListener("focus", () => {
  if (searchInput.value.trim() === "") {
    renderTrending();
    dropdownList.style.display = "block";
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && searchInput.value.trim() !== "") {
    console.log(
      `product.html?query=${encodeURIComponent(searchInput.value.trim())}`
    );
    window.location.href = `product.html?query=${encodeURIComponent(
      searchInput.value.trim()
    )}`;
  }
});

document.addEventListener("click", (e) => {
  if (!document.querySelector(".header__search-input").contains(e.target)) {
    dropdownList.style.display = "none";
  }
});

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("query");
const productContainer = document.getElementById("productContainer");

async function fetchProducts(searchQuery) {
  try {
    const res = await fetch(
      `https://dummyjson.com/products/search?q=${searchQuery}`
    );
    const data = await res.json();

    const filtered = data.products.filter(
      (product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand &&
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (filtered.length > 0) {
      updateResultsHeader(searchQuery, filtered.length);
      currentProducts = filtered;
      renderProductCards(filtered);
    } else {
      productContainer.innerHTML = "<p>No products found</p>";
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    productContainer.innerHTML = "<p>Error fetching data</p>";
  }
}

function renderProductCards(products) {
  productContainer.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product__card";
    const originalPrice = (
      product.price /
      (1 - product.discountPercentage / 100)
    ).toFixed(2);
    card.innerHTML = `
        <div class="product__card">
        <div class="product__image">
          <img src="${product.thumbnail}"  alt="${product.title}" >
          <div class="wishlist__icon"><svg xmlns="http://www.w3.org/2000/svg" class="N1bADF" width="20" height="20" viewBox="0 0 20 16"><path d="M8.695 16.682C4.06 12.382 1 9.536 1 6.065 1 3.219 3.178 1 5.95 1c1.566 0 3.069.746 4.05 1.915C10.981 1.745 12.484 1 14.05 1 16.822 1 19 3.22 19 6.065c0 3.471-3.06 6.316-7.695 10.617L10 17.897l-1.305-1.215z" fill="gray" class="x1UMqG" stroke="gray" fill-rule="evenodd" opacity=".9"></path></svg></div>
        </div>
        <div class="product__info">
          <span class="sponsored">Sponsored</span>
            <div class="title__assured">
        <h3 class="product__title">${product.title}</h3>
          <div class="assurance">
            <img src="assets/card/fa_9e47c1.png" alt="Assured">
          </div>
       </div>
          <div class="pricing">
            <span class="price">₹${product.price}</span>
            <span class="original__price">${originalPrice}</span>
            <span class="discount">${product.discountPercentage}%</span>
          </div>
          <p class="offers">Save extra with combo offers</p>
        </div>
      </div>
        `;
    productContainer.appendChild(card);
  });
}

let filtersApplied = false;
function applyFilters() {
  const checkboxes = document.querySelectorAll(".filter-checkbox:checked");
  const selectedFilters = {
    category: [],
    brand: [],
    rating: [],
    color: [],
    discount: [],
    availability: false,
  };

  checkboxes.forEach((cb) => {
    const type = cb.dataset.type;
    const value = cb.value;

    if (type === "availability" && value === "Include Out of Stock") {
      selectedFilters.availability = true;
    } else {
      selectedFilters[type].push(value.toLowerCase());
    }
  });

  const maxPrice = document.getElementById("priceRange").value;

  const filteredProducts = currentProducts.filter((product) => {
    const categoryMatch =
      selectedFilters.category.length === 0 ||
      selectedFilters.category.includes(product.category.toLowerCase());
    const brandMatch =
      selectedFilters.brand.length === 0 ||
      selectedFilters.brand.includes(product.brand?.toLowerCase());
    const ratingMatch =
      selectedFilters.rating.length === 0 ||
      selectedFilters.rating.some((r) => product.rating >= parseInt(r));
    const colorMatch =
      selectedFilters.color.length === 0 ||
      selectedFilters.color.includes(product.color?.toLowerCase());
    const discountMatch =
      selectedFilters.discount.length === 0 ||
      selectedFilters.discount.some(
        (d) => product.discountPercentage >= parseInt(d)
      );
    const availabilityMatch = selectedFilters.availability || product.stock > 0;
    const priceMatch = product.price <= parseInt(maxPrice);

    return (
      categoryMatch &&
      brandMatch &&
      ratingMatch &&
      colorMatch &&
      discountMatch &&
      availabilityMatch &&
      priceMatch
    );
  });

  filtersApplied =
    Object.values(selectedFilters).some(
      (filterArray) => filterArray.length > 0
    ) || maxPrice < 5000;
  toggleClearAllButton();

  const searchInputValue = document
    .querySelector(".header__search-input")
    ?.value.trim();
  const urlParams = new URLSearchParams(window.location.search);
  const urlQuery = urlParams.get("query");
  const keyword = searchInputValue || urlQuery || "results";

  const categoryNameElem = document.getElementById("categoryName");
  const searchTermElem = document.getElementById("searchTerm");
  const resultsCountElem = document.getElementById("resultsCount");

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const totalCount = filteredProducts.length;

  if (categoryNameElem) categoryNameElem.textContent = cap(keyword);
  if (searchTermElem) searchTermElem.textContent = keyword;
  if (resultsCountElem) {
    resultsCountElem.innerHTML = `Showing 1 - ${totalCount} of ${totalCount} results for "<span>${keyword}</span>"`;
  }

  if (filteredProducts.length > 0) {
    renderProductCards(filteredProducts);
  } else {
    productContainer.innerHTML = "<p>No products match your filters.</p>";
  }
  renderProductCards(filteredProducts);
}

function toggleClearAllButton() {
  const clearAllBtn = document.getElementById("clearAllBtn");
  if (filtersApplied) {
    clearAllBtn.style.display = "block";
  } else {
    clearAllBtn.style.display = "none";
  }
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateResultsHeader(query, totalCount) {
  document.getElementById("categoryName").textContent =
    capitalizeFirstLetter(query);
  document.getElementById("searchTerm").textContent = query;
  document.getElementById(
    "resultsCount"
  ).innerHTML = `Showing 1 - ${totalCount} of ${totalCount} results for "<span>${query}</span>"`;
}

document.querySelectorAll(".sort__btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".sort__btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const type = btn.dataset.sort;
    let sorted = [...currentProducts];

    switch (type) {
      case "priceLow":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "popularity":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        sorted.sort(
          (a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0)
        );
        break;
      default:
        sorted = [...currentProducts];
    }

    renderProductCards(sorted);
  });
});

document.querySelectorAll(".filter-checkbox").forEach((cb) => {
  cb.addEventListener("change", applyFilters);
});

document.getElementById("priceRange").addEventListener("input", applyFilters);

document.getElementById("clearAllBtn").addEventListener("click", () => {
  document
    .querySelectorAll(".filter-checkbox")
    .forEach((cb) => (cb.checked = false));
  document.getElementById("priceRange").value = 500000;
  filtersApplied = false;
  toggleClearAllButton();
  applyFilters();
});

if (query) {
  fetchProducts(query);
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

const priceRange = document.getElementById("priceRange");
const maxPrice = document.getElementById("maxPrice");

priceRange.addEventListener("input", function () {
  maxPrice.textContent = `Max: ₹${parseInt(priceRange.value).toLocaleString()}`;
});


function closeAllAccordions() {
  const accordionItems = document.querySelectorAll('.accordion__item');
  accordionItems.forEach(item => {
    item.classList.remove('active');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 768) {
    closeAllAccordions();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    closeAllAccordions();
  }
});

