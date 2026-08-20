/**
 * nav.js — injects the shared header + footer into every page, then
 * populates each dropdown from the live sheet data so the nav always
 * reflects whatever is in the Google Sheet.
 */
function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const NAV_LINKS = [
  { label: "Home", href: "index.html" },
  { label: "Secret Lots", href: "secret-lots.html", dropdown: "secretLots", labelField: "name" },
  { label: "Family Tree", href: "family-tree.html" },
  { label: "Collections", href: "collections.html", dropdown: "collections", labelField: "category" },
  { label: "Careers", href: "careers.html", dropdown: "careers", labelField: "name" },
  { label: "Forever World", href: "forever-world.html" },
  { label: "Towniepedia", href: "towniepedia.html", dropdown: "townies", labelField: "world" },
];

function headerTemplate() {
  const items = NAV_LINKS.map((link) => {
    const hasDropdown = !!link.dropdown;
    return `
      <li class="nav-item" data-nav="${slugify(link.label)}">
        <a class="nav-link" href="${link.href}" ${hasDropdown ? `data-dropdown-toggle="${link.dropdown}"` : ""}>
          <span class="diamond" style="opacity:0.6"></span>
          ${link.label}
          ${hasDropdown ? '<span class="nav-caret"></span>' : ""}
        </a>
        ${hasDropdown ? `<div class="dropdown" data-dropdown="${link.dropdown}"><div class="empty">Loading…</div></div>` : ""}
      </li>`;
  }).join("");

  return `
    <div class="nav-wrap">
      <a class="brand" href="index.html"><span class="diamond"></span>Sims Codex</a>
      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">☰</button>
      <ul class="nav-list" id="navList">
        ${items}
      </ul>
      <a class="nav-search" href="towniepedia.html" title="Search the Codex">⌕</a>
    </div>`;
}

function footerTemplate() {
  return `
    <div class="wrap">
      <span class="diamond" style="margin-right:8px;"></span>
      Sims Codex — a fan-made walkthrough site. Data lives in Google Sheets, media in Cloudinary, hosted on GitHub Pages.
    </div>`;
}

async function populateDropdown(key, container, labelField, pageHref) {
  try {
    const rows = await DataStore.load(key);
    const values = DataStore.uniqueValues(rows, labelField);
    if (!values.length) {
      container.innerHTML = '<div class="empty">No entries yet</div>';
      return;
    }
    container.innerHTML = values
      .slice(0, 12)
      .map(
        (v) =>
          `<a href="${pageHref}?${labelField === "world" ? "world" : "filter"}=${encodeURIComponent(v)}">
             <span class="diamond" style="width:6px;height:6px;opacity:0.5;"></span>${v}
           </a>`
      )
      .join("");
  } catch (e) {
    container.innerHTML = '<div class="empty">Couldn\'t load — check your Sheet link</div>';
    console.warn(`Dropdown "${key}" failed to load:`, e);
  }
}

function initNav(activePage) {
  document.getElementById("site-header").innerHTML = headerTemplate();
  const footerEl = document.getElementById("site-footer");
  if (footerEl) footerEl.innerHTML = footerTemplate();

  // active state
  if (activePage) {
    const item = document.querySelector(`.nav-item[data-nav="${activePage}"]`);
    if (item) item.classList.add("active");
  }

  // mobile toggle
  const toggle = document.getElementById("navToggle");
  const list = document.getElementById("navList");
  toggle.addEventListener("click", () => list.classList.toggle("open"));
  list.querySelectorAll(".nav-item").forEach((item) => {
    const link = item.querySelector(".nav-link[data-dropdown-toggle]");
    if (!link) return;
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 860) {
        e.preventDefault();
        item.classList.toggle("expanded");
      }
    });
  });

  // populate dropdowns
  document.querySelectorAll("[data-dropdown]").forEach((container) => {
    const key = container.dataset.dropdown;
    const linkCfg = NAV_LINKS.find((l) => l.dropdown === key);
    populateDropdown(key, container, linkCfg.labelField, linkCfg.href);
  });
}
