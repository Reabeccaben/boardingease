import { listings } from "./data.js";

let newListings = listings;

const resultsList = document.querySelector(".results__list");
const detailsContainer = document.querySelector(".detail");
const searchCount = document.querySelector(".search__count");
const fieldInput = document.querySelector(".field__input");
const maxRentInput = document.querySelector("#max-input");
const searchForm = document.querySelector("#search-form");

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
    ? `<span class="tag tag--utilities">
        Utilities included
      </span>`
    : `<span class="tag tag--utilities">
        Utilities extra
      </span>`;

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

                  <span class="card__meta">
                    ${barangay} &middot;
                    ${distanceToCampusKm} km from campus &middot;
                    up to ${maxOccupants}
                  </span>

                  <span class="card__rent">
                    &#8369;${monthlyRent} / month
                  </span>

                  <span class="tags">
                    ${utilitiesTag}
                  </span>
                </span>
              </button>
            </li>`;
};

const results = () => {
  // If there are no results
  if (newListings.length === 0) {
    resultsList.innerHTML = `<li class="empty">
              No listings match that search. Try a barangay name.
            </li>`;

    searchCount.textContent = "0 listings found";

    return;
  }

  // Display the matching listings
  resultsList.innerHTML = newListings
    .map(markupGenerator)
    .join("");

  // Display the number of listings
  searchCount.textContent = `${newListings.length} listings found`;
};

results();

// --------------------------------------------------
// DETAIL MARKUP
// --------------------------------------------------

const detailMarkUpGenerator = (listing) => {
  const {
    id,
    name,
    barangay,
    monthlyRent,
    maxOccupants,
  } = listing;

  return `
   <div data-id="${id}">

     <h2 class="detail__name">${name}</h2>

     <p class="detail__where">
       ${barangay} &middot; &#8369;${monthlyRent} / month
     </p>

     <fieldset class="splitter">
       <legend class="splitter__legend">
         Split the cost
       </legend>

       <div class="splitter__row">
         <label for="occupants-demo">
           Sharing with
         </label>

         <input
           class="field__input"
           type="number"
           id="occupants-demo"
           min="1"
           max="${maxOccupants}"
           value="${maxOccupants}"
         />
       </div>

       <div class="splitter__row">
         <label for="transport-demo">
           Include daily fare
         </label>

         <input
           type="checkbox"
           id="transport-demo"
           checked
         />
       </div>
     </fieldset>

     <div class="breakdown">

       <p class="breakdown__line">
         <span>Rent</span>
         <span id="breakdown-rent">&#8369;0</span>
       </p>

       <p class="breakdown__line">
         <span>Utilities</span>
         <span id="breakdown-utilities">&#8369;0</span>
       </p>

       <p class="breakdown__line">
         <span>Transport</span>
         <span id="breakdown-transport">&#8369;0</span>
       </p>

       <p class="breakdown__total">
         <span>Per person</span>
         <span id="breakdown-total">&#8369;0</span>
       </p>

     </div>

     <p class="error" hidden>
       This listing allows at most ${maxOccupants} occupants.
     </p>

   </div>
  `;
};

// --------------------------------------------------
// FORMAT PESO
// --------------------------------------------------

const formatPeso = (amount) => {
  return `&#8369;${Math.round(amount).toLocaleString()}`;
};

// --------------------------------------------------
// CALCULATE BREAKDOWN
// --------------------------------------------------

const calculateBreakdown = (listing, occupants, includeTransport) => {
  // rent = monthlyRent / occupants
  const rent = listing.monthlyRent / occupants;

  // utilities = 0 if utilities are included
  let utilities = 0;

  if (!listing.utilitiesIncluded) {
    const totalUtilities =
      listing.estimatedUtilities.electricity +
      listing.estimatedUtilities.water +
      listing.estimatedUtilities.internet;

    utilities = totalUtilities / occupants;
  }

  // transport = fareOneWay x 2 x 22
  // Transport is NOT divided by occupants.
  let transport = 0;

  if (includeTransport) {
    transport = listing.fareOneWay * 2 * 22;
  }

  // total = rent + utilities + transport
  const total = rent + utilities + transport;

  return {
    rent,
    utilities,
    transport,
    total,
  };
};

// --------------------------------------------------
// UPDATE BREAKDOWN
// --------------------------------------------------

const updateBreakdown = (listing) => {
  const occupantsInput =
    document.querySelector("#occupants-demo");

  const transportInput =
    document.querySelector("#transport-demo");

  const breakdown =
    detailsContainer.querySelector(".breakdown");

  const errorMessage =
    detailsContainer.querySelector(".error");

  const rentOutput =
    detailsContainer.querySelector("#breakdown-rent");

  const utilitiesOutput =
    detailsContainer.querySelector("#breakdown-utilities");

  const transportOutput =
    detailsContainer.querySelector("#breakdown-transport");

  const totalOutput =
    detailsContainer.querySelector("#breakdown-total");

  if (!occupantsInput) {
    return;
  }

  const occupants = Number(occupantsInput.value);

  // Check if the number is valid
  if (!occupants || occupants < 1) {
    errorMessage.textContent =
      "Please enter at least 1 occupant.";

    errorMessage.hidden = false;
    breakdown.hidden = true;

    return;
  }

  // Respect maxOccupants
  if (occupants > listing.maxOccupants) {
    errorMessage.textContent =
      `This listing allows at most ${listing.maxOccupants} occupants.`;

    errorMessage.hidden = false;
    breakdown.hidden = true;

    return;
  }

  // Valid number
  errorMessage.hidden = true;
  breakdown.hidden = false;

  const values = calculateBreakdown(
    listing,
    occupants,
    transportInput.checked
  );

  rentOutput.innerHTML =
    formatPeso(values.rent);

  utilitiesOutput.innerHTML =
    formatPeso(values.utilities);

  transportOutput.innerHTML =
    formatPeso(values.transport);

  totalOutput.innerHTML =
    formatPeso(values.total);
};

// --------------------------------------------------
// DISPLAY DETAILS WHEN A CARD IS CLICKED
// --------------------------------------------------

resultsList.addEventListener("click", (event) => {
  const card = event.target.closest(".card");

  if (!card) return;

  const listingID = card.dataset.id;

  const listing = newListings.find(
    (listing) => String(listing.id) === String(listingID)
  );

  if (!listing) return;

  detailsContainer.innerHTML =
    detailMarkUpGenerator(listing);

  // Calculate the initial breakdown
  updateBreakdown(listing);
});

// --------------------------------------------------
// SHARING WITH FUNCTION
// --------------------------------------------------

// The Sharing with input is created dynamically
// when a card is clicked.
// Therefore, the listener is placed on the
// existing detail container.

detailsContainer.addEventListener("input", (event) => {
  if (event.target.id !== "occupants-demo") {
    return;
  }

  const detailContainer =
    detailsContainer.querySelector("[data-id]");

  if (!detailContainer) {
    return;
  }

  const listingID =
    detailContainer.dataset.id;

  const listing = listings.find(
    (listing) =>
      String(listing.id) === String(listingID)
  );

  if (!listing) {
    return;
  }

  updateBreakdown(listing);
});

// --------------------------------------------------
// TRANSPORT FUNCTION
// --------------------------------------------------

detailsContainer.addEventListener("change", (event) => {
  if (event.target.id !== "transport-demo") {
    return;
  }

  const detailContainer =
    detailsContainer.querySelector("[data-id]");

  if (!detailContainer) {
    return;
  }

  const listingID =
    detailContainer.dataset.id;

  const listing = listings.find(
    (listing) =>
      String(listing.id) === String(listingID)
  );

  if (!listing) {
    return;
  }

  updateBreakdown(listing);
});

// --------------------------------------------------
// SEARCH FUNCTION
// --------------------------------------------------

fieldInput.addEventListener("input", (event) => {
  const searchValue = event.target.value
    .toLowerCase()
    .trim();

  const maxRent = maxRentInput.value.trim();

  newListings = listings.filter((listing) => {
    const matchesName =
      searchValue === "" ||
      listing.name
        .toLowerCase()
        .includes(searchValue) ||
      listing.barangay
        .toLowerCase()
        .includes(searchValue);

    const matchesRent =
      maxRent === "" ||
      Number(listing.monthlyRent) <= Number(maxRent);

    return matchesName && matchesRent;
  });

  results();
});

// --------------------------------------------------
// MAX RENT FUNCTION
// --------------------------------------------------

maxRentInput.addEventListener("input", (event) => {
  const maxRent = event.target.value.trim();

  const searchValue = fieldInput.value
    .toLowerCase()
    .trim();

  newListings = listings.filter((listing) => {
    const matchesName =
      searchValue === "" ||
      listing.name
        .toLowerCase()
        .includes(searchValue) ||
      listing.barangay
        .toLowerCase()
        .includes(searchValue);

    const matchesRent =
      maxRent === "" ||
      Number(listing.monthlyRent) <= Number(maxRent);

    return matchesName && matchesRent;
  });

  results();
});

// --------------------------------------------------
// SEARCH FORM
// --------------------------------------------------

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const searchValue = fieldInput.value
    .toLowerCase()
    .trim();

  const maxRent = maxRentInput.value.trim();

  newListings = listings.filter((listing) => {
    const matchesName =
      searchValue === "" || listing.name.toLowerCase()
        .includes(searchValue) ||listing.barangay
        .toLowerCase()
        .includes(searchValue);

    const matchesRent =
      maxRent === "" ||
      Number(listing.monthlyRent) <= Number(maxRent);

    return matchesName && matchesRent;
  });

  results();
});