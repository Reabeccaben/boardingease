import { listings } from "./data.js";

let newListings = listings;

const resultsList = document.querySelector(".results__list");
const detailsContainer = document.querySelector(".detail");
const searchCount = document.querySelector(".search__count");

// Get the SEARCH input specifically
const fieldInput = document.querySelector('input[type="search"]');


// --------------------------------------------------
// MARKUP GENERATOR
// --------------------------------------------------

const markupGenerator = (listing) => {
  const {
    id,
    name,
    barangay,
    monthlyRent,
    maxOccupants,
    utilitiesIncluded,
    distanceToCampusKm,
  } = listing;

  const utilitiesTag = utilitiesIncluded
    ? `<span class="tag tag--utilities">Utilities included</span>`
    : `<span class="tag tag--utilities">Utilities extra</span>`;

  return `
    <li>
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
            &#8369;${monthlyRent.toLocaleString()} / month
          </span>

          <span class="tags">
            ${utilitiesTag}
          </span>
        </span>
      </button>
    </li>
  `;
};


// --------------------------------------------------
// RESULTS
// --------------------------------------------------

const results = () => {

  // No results
  if (newListings.length === 0) {
    resultsList.innerHTML = `
      <li class="empty">
        No listings match that search. Try a barangay name.
      </li>
    `;

    searchCount.textContent = "0 listings found";

    return;
  }

  // Display the listings
  resultsList.innerHTML = newListings
    .map(markupGenerator)
    .join("");

  // Update count
  searchCount.textContent =
    `${newListings.length} listing${newListings.length === 1 ? "" : "s"} found`;
};


// --------------------------------------------------
// INITIAL DISPLAY
// --------------------------------------------------

results();


// --------------------------------------------------
// DETAIL MARKUP GENERATOR
// --------------------------------------------------

const detailMarkUpGenerator = (listing) => {
  const {
    name,
    barangay,
    monthlyRent,
    maxOccupants,
    utilitiesIncluded,
    estimatedUtilities,
    fareOneWay,
  } = listing;

  const totalUtilities =
    estimatedUtilities.electricity +
    estimatedUtilities.water +
    estimatedUtilities.internet;

  const rentPerPerson = monthlyRent / maxOccupants;

  const utilitiesPerPerson = utilitiesIncluded
    ? 0
    : totalUtilities / maxOccupants;

  const transportPerPerson =
    fareOneWay * 2 * 22;

  const totalPerPerson =
    rentPerPerson +
    utilitiesPerPerson +
    transportPerPerson;

  return `
    <h2 class="detail__name">${name}</h2>

    <p class="detail__where">
      ${barangay} &middot;
      &#8369;${monthlyRent.toLocaleString()} / month
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
        <span>
          &#8369;${Math.round(rentPerPerson).toLocaleString()}
        </span>
      </p>

      <p class="breakdown__line">
        <span>Utilities</span>
        <span>
          ${
            utilitiesIncluded
              ? "Included"
              : `&#8369;${Math.round(
                  utilitiesPerPerson
                ).toLocaleString()}`
          }
        </span>
      </p>

      <p class="breakdown__line">
        <span>Transport</span>
        <span>
          &#8369;${Math.round(
            transportPerPerson
          ).toLocaleString()}
        </span>
      </p>

      <p class="breakdown__total">
        <span>Per person</span>
        <span>
          &#8369;${Math.round(
            totalPerPerson
          ).toLocaleString()}
        </span>
      </p>

    </div>
  `;
};


// --------------------------------------------------
// CLICK LISTING
// --------------------------------------------------

resultsList.addEventListener("click", (event) => {

  const card = event.target.closest(".card");

  if (!card) return;

  const listingID = card.dataset.id;

  const listing = newListings.find(
    (listing) => listing.id === listingID
  );

  if (!listing) return;

  detailsContainer.innerHTML =
    detailMarkUpGenerator(listing);
});


// --------------------------------------------------
// SEARCH
// --------------------------------------------------

fieldInput.addEventListener("input", (event) => {

  const searchValue =
    event.target.value.toLowerCase().trim();

  // If search is empty,
  // show all listings again
  if (searchValue === "") {

    newListings = listings;

  } else {

    newListings = listings.filter((listing) => {

      const nameMatch =
        listing.name
          .toLowerCase()
          .includes(searchValue);

      const barangayMatch =
        listing.barangay
          .toLowerCase()
          .includes(searchValue);

      return nameMatch || barangayMatch;
    });
  }

  results();
});