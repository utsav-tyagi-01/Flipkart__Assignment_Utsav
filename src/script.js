const searchInput = document.getElementById("searchInput");
const dropdownList = document.getElementById("dropdownList");

const moreButton = document.querySelector('.header__right-nav--more');
const loginButton = document.querySelector('.header__right-nav--login');
const moreDropdown = document.querySelector('.more__dropdown');
const loginDropdown = document.querySelector('.header__dropdown--login');

const showDropdown = (dropdown) => {
    dropdown.style.display = 'block';
};

const hideDropdown = (dropdown) => {
    dropdown.style.display = 'none';
};

const handleMouseEnter = (button, dropdown) => {
    button.addEventListener('mouseenter', () => {
        showDropdown(dropdown);
    });

    dropdown.addEventListener('mouseenter', () => {
        showDropdown(dropdown);
    });
};

const handleMouseLeave = (button, dropdown) => {
    button.addEventListener('mouseleave', () => {
        hideDropdown(dropdown);
    });

    dropdown.addEventListener('mouseleave', () => {
        hideDropdown(dropdown);
    });
};

handleMouseEnter(moreButton, moreDropdown);
handleMouseEnter(loginButton, loginDropdown);

handleMouseLeave(moreButton, moreDropdown);
handleMouseLeave(loginButton, loginDropdown);

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

function renderTrending() {
	dropdownList.innerHTML = "";
    dropdownList.innerHTML = "<li>Trending</li>";
    trendingSearches.forEach(item => {
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
        const res = await fetch(`https://dummyjson.com/products/search?q=${keyword}`);
        const data = await res.json();

        if (keyword !== latestQuery) return;

        if (data.products.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No results found";
            li.style.color = "#888";
            li.style.cursor = "default";
            dropdownList.appendChild(li);
        } else {
            data.products.slice(0, 8).forEach(product => {
                const li = document.createElement("li");
                li.innerHTML = `<i class="fa fa-search"></i> ${product.title}`;
                li.addEventListener("click", () => {
                    window.location.href = `product.html?query=${encodeURIComponent(product.title)}`;
                });
                dropdownList.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

searchInput.addEventListener("input", debounce(async () => {
    const keyword = searchInput.value.trim();
    if (keyword === "") {
        renderTrending();
    } else {
        await renderFilteredResults(keyword);
    }
    dropdownList.style.display = "block";
}, 300));

searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim() === "") {
        renderTrending();
        dropdownList.style.display = "block";
    }
});
searchInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter" && searchInput.value.trim() !== "") {
	  window.location.href = `product.html?query=${encodeURIComponent(searchInput.value.trim())}`;
	}
  });

document.addEventListener("click", (e) => {
    if (!document.querySelector(".header__search-input").contains(e.target)) {
        dropdownList.style.display = "none";
    }
});


