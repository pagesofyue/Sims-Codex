/**
 * pages.js — generic "load CSV, filter, render card grid" logic shared by
 * Towniepedia, Secret Lots, Collections and Careers pages.
 *
 * config = {
 *   dataKey,            // key into SHEET_CONFIG / DataStore
 *   gridId,             // container element id
 *   toolbarId,          // element id for filter pills + search (optional)
 *   filterField,         // field used for pill filters (optional)
 *   filterParam,        // querystring param name that pre-selects a filter
 *   searchFields,       // fields checked against the search box
 *   renderCard,         // (row) => html string
 *   emptyMessage
 * }
 */
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function initGridPage(config) {
  const grid = document.getElementById(config.gridId);
  grid.innerHTML = '<div class="empty-state">Loading from the sheet…</div>';

  let rows;
  try {
    rows = await DataStore.load(config.dataKey);
  } catch (e) {
    grid.innerHTML = `<div class="empty-state">Couldn't load this data. Check the CSV link in assets/js/config.js.</div>`;
    console.error(e);
    return;
  }

  const state = {
    activeFilter: getQueryParam(config.filterParam) || "All",
    query: "",
  };

  function renderToolbar() {
    if (!config.toolbarId || !config.filterField) return;
    const toolbar = document.getElementById(config.toolbarId);
    const values = ["All", ...DataStore.uniqueValues(rows, config.filterField)];
    toolbar.innerHTML =
      values
        .map(
          (v) =>
            `<button class="pill ${v === state.activeFilter ? "active" : ""}" data-filter="${v}">${v}</button>`
        )
        .join("") +
      `<input class="search-input" type="text" placeholder="Search…" value="${state.query}">`;

    toolbar.querySelectorAll(".pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeFilter = btn.dataset.filter;
        renderToolbar();
        renderGrid();
      });
    });
    toolbar.querySelector(".search-input").addEventListener("input", (e) => {
      state.query = e.target.value;
      renderGrid();
    });
  }

  function renderGrid() {
    let filtered = rows;
    if (config.filterField && state.activeFilter !== "All") {
      filtered = filtered.filter((r) => r[config.filterField] === state.activeFilter);
    }
    if (state.query) {
      const q = state.query.toLowerCase();
      filtered = filtered.filter((r) =>
        (config.searchFields || []).some((f) => (r[f] || "").toLowerCase().includes(q))
      );
    }
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state">${config.emptyMessage || "Nothing matches yet — add a row to the sheet."}</div>`;
      return;
    }
    grid.innerHTML = `<div class="card-grid">${filtered.map(config.renderCard).join("")}</div>`;
  }

  renderToolbar();
  renderGrid();
}

function thumbHtml(imageUrl, fallbackLabel) {
  if (imageUrl) {
    return `<div class="thumb"><img src="${imageUrl}" alt="${fallbackLabel}" loading="lazy"></div>`;
  }
  return `<div class="thumb">no image yet</div>`;
}
