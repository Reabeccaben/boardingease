import { listings } from "./data.js";

// ELEMENTS
const resultsList = document.querySelector(".results__list");
const detailsContainer = document.querySelector(".detail");
const searchCount = document.querySelector(".search__count");
const fieldInput = document.querySelector(".field__input");
const maxRentInput = document.querySelector("#max-rent");
const searchForm = document.querySelector("#search-form");
const sharingWithInput = document.querySelector("#sharing-with");

// STATE
let newListings = listings;
let selectedId = null;
let occupants = 1;
let includeTransport = false;

const SCHOOL_DAYS_PER_MONTH = 22;

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const applyFilters = () => {
  const query = fieldInput.value.toLowerCase().trim();
  const maxRent = maxRentInput.value;

  newListings = listings.filter((listing) => {
    const matchesQuery =
      query === "" || listing.name.toLowerCase().includes(query);

    const matchesRent =
      maxRent === "" || listing.monthlyRent <= Number(maxRent);

    return matchesQuery && matchesRent;
  });

  results();
};

const sumUtilities = ({ electricity = 0, water = 0, internet = 0 }) =>
  electricity + water + internet;

const calculateCostPerHead = (listing, people, withTransport) => {
  if (!Number.isInteger(people) || people < 1)
    throw new Error("Number od occupants must be a whole number, at least 1.");
  if (people > listing.maxOccupants)
    throw new Error(
      `This listing allows at most ${listing.maxOccupants} occupants`,
    );

  const rentPerHead = listing.monthlyRent / people;

  const utilitiesPerHead = listing.utilitiesIncluded
    ? 0
    : sumUtilities(listing.estimatedUtilities) / people;

  const transportPerHead = withTransport
    ? listing.fareOneWay * 2 * SCHOOL_DAYS_PER_MONTH
    : 0;

  return {
    rentPerHead,
    utilitiesPerHead,
    transportPerHead,
    totalPerHead: rentPerHead + utilitiesPerHead,
    transportPerHead,
  };
};

const markupGenerator = (listing) => {
  // Gi destructure nato dire ang object
  const {
    id,
    name,
    barangay,
    monthlyRent,
    maxOccupants,
    utilitiesIncluded,
    estimatedUtilities,
    distanceToCampusKm,
    fareOneWay,
    amenities,
  } = listing;

  const utilitiesTag = utilitiesIncluded
    ? `<span class="tag tag--utilities"
                      >Utilities extra</span
                    >`
    : `<span class="tag tag--utilities"
                      >No Utilities extra</span
                    >`;

  return `<li>
              <button
                class="card"
                type="button"
                data-id="${id}"
                aria-pressed="false"
              >
                <img
                  class="card__image"
                  alt=""
                  width="96"
                  height="96"
                  loading="lazy"
                  src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='%23e8f2ee'/><path d='M20 62l18-20 14 16 10-10 14 14v10H20z' fill='%231e7a5f' opacity='.45'/><circle cx='64' cy='32' r='7' fill='%231e7a5f' opacity='.45'/></svg>"
                />
                <span>
                  <span class="card__name">${name}</span>
                  <span class="card__meta"
                    >${barangay} &middot; ${distanceToCampusKm} km from campus &middot; up to 4</span
                  >
                  <span class="card__rent">&#8369;${monthlyRent} / month</span>
                  <span class="tags"
                    >
                    ${utilitiesTag}</span
                  >
                </span>
              </button>
            </li>`;
};

const results = () => {
  if (newListings.length === 0) {
    resultsList.innerHTML = `<li class="empty">
              No listings match that search. Try a barangay name.
            </li>`;

    searchCount.textContent = "0 listings found";
  }

  resultsList.innerHTML = newListings.map(markupGenerator).join("");
};

const breakdownContent = (listing) => {
  const { rentPerHead, utilitiesPerHead, transportPerHead, totalPerHead } =
    calculateCostPerHead(listing, occupants, includeTransport);

  return `
    <p class="breakdown__line">
      <span>Rent</span><span>${peso.format(rentPerHead)}</span>
    </p>
    <p class="breakdown__line">
      <span>Utilities</span><span>${peso.format(utilitiesPerHead)}</span>
    </p>
    <p class="breakdown__line">
      <span>Transport</span><span>${peso.format(transportPerHead)}</span>
    </p>
    <p class="breakdown__total">
      <span>Per person</span><span>${peso.format(totalPerHead)}</span>
    </p>
    `;
};

const detailMarkUpGenerator = (listing) => {
  const { name, barangay, monthlyRent, maxOccupants } = listing;

  return `
   <h2 class="detail__name">${name}</h2>
          <p class="detail__where">${barangay} &middot; ${peso.format(monthlyRent)} / month</p>
  <fieldset class="splitter">
            <legend class="splitter__legend">Split the cost</legend>

            <div class="splitter__row">
              <label for="occupants-demo">Sharing with</label>
              <input
                class="field__input"
                type="number"
                id="occupants-demo"
                min="1"
                max="${maxOccupants}"
                value="${occupants}"
              />
            </div>

            <div class="splitter__row">
              <label for="transport-demo">Include daily fare</label>
              <input type="checkbox" id="transport-demo" ${includeTransport ? "checked" : ""} />
            </div>
          </fieldset>

          <div class="breakdown">
            ${breakdownContent(listing)}
          </div>        
  `;
};

const selectedListing = () =>
  listings.find((listing) => listing.id === selectedId);

const renderDetail = () => {
  if (!selectedId) {
    detailsContainer.innerHTML = `<p class="detail__empty">Select a listing to see the cost breakdown.</p>`;
    return;
  }

  const listing = selectedListing();

  if (!listing) {
    detailsContainer.innerHTML = `<p class="error">That listing could not be found.</p>`;
    return;
  }

  detailsContainer.innerHTML = detailMarkUpGenerator(listing);
};

const updateBreakdown = () => {
  const breakdown = detailsContainer.querySelector(".breakdown");
  if (!breakdown) return;

  const listing = selectedListing();
  if (!listing) return;

  breakdown.innerHTML = breakdownContent(listing);
};

// EVENT LISTENERS

resultsList.addEventListener("click", (event) => {
  const card = event.target.closest(".card");

  if (!card) return;

  selectedId = card.dataset.id;

  const listing = selectedListing();
  if (!listing) return;

  occupants = listing.maxOccupants;

  results();
  renderDetail();
});

detailsContainer.addEventListener("input", (e) => {
  if (e.target.id === "occupants-demo") {
    occupants = Number(e.target.value);
    updateBreakdown();
  }

  if (e.target.id === "transport-demo") {
    includeTransport = e.target.checked;
    updateBreakdown();
  }
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
});
fieldInput.addEventListener("input", applyFilters);
maxRentInput.addEventListener("input", applyFilters);

applyFilters();
results();
