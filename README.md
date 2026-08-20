# Sims Codex

A fan-made Sims 4 walkthrough/reference site: Towniepedia, a family tree builder,
Secret Lots, Collections and Careers. No backend, no build step — plain
HTML/CSS/JS, data pulled live from a published Google Sheet, images hosted on
Cloudinary, deployed on GitHub Pages.

## How it's wired together

```
sims-wiki/
├── index.html             Home
├── secret-lots.html       Hidden/unlockable lots
├── family-tree.html       Interactive family tree builder (localStorage)
├── collections.html       Skill & collectible items
├── careers.html           Careers + promotion tracks
├── forever-world.html     The ongoing save file + its version log
├── towniepedia.html       Original townies, grouped by world (search + jump chips)
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── config.js      <- point this at your published Sheet CSVs
│       ├── data.js         CSV loading + caching (uses PapaParse)
│       ├── nav.js          Shared header/footer, live dropdown menus
│       ├── pages.js        Generic filter/search grid used by 4 list pages
│       └── family-tree.js  Family tree logic
└── data/sample/           Sample CSVs so the site works before you connect a Sheet
```

Every list page (Towniepedia, Secret Lots, Collections, Careers) reads from a
CSV on load. The nav dropdowns (Secret Lots, Collections, Careers, Original
Townie) are populated from the same data, so they always match what's in the
sheet — add a row, refresh the site, it shows up.

## 1. Set up your Google Sheet

Create one spreadsheet with a tab per section. Use these exact column headers
(see `/data/sample/*.csv` for example rows):

| Tab | Columns |
|---|---|
| **Townies** | `id, name, world, household, traits, image_url, bio` |
| **SecretLots** | `id, name, world, how_to_unlock, description, image_url` |
| **Collections** | `id, category, item_name, found_where, image_url` |
| **Careers** | `id, name, type, description, track, image_url` |
| **SaveVersions** | `id, version, date, notes, download_url` |

- `world` on the Townies tab groups Towniepedia into sections, and drives the **Towniepedia** dropdown.
- `category` on Collections drives the **Collections** dropdown (e.g. "Skill: Paintings").
- `name` on Careers/SecretLots drives those dropdowns.
- **SaveVersions** feeds the **Forever World** page — it's an update log (new townies, new houses, milestones), not a file download. `download_url` is optional per row, for the rare case you do want to link something.

For each tab: **File → Share → Publish to web** → select the specific tab →
format **Comma-separated values (.csv)** → **Publish**. Copy the resulting URL.

## 2. Point the site at your sheet

Edit `assets/js/config.js`:

```js
const SHEET_CONFIG = {
  townies: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=0&single=true&output=csv",
  secretLots: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=1&single=true&output=csv",
  collections: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=2&single=true&output=csv",
  careers: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=3&single=true&output=csv",
  saveVersions: "https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=4&single=true&output=csv",
};
```

Leave any entry pointing at `data/sample/...csv` and that section keeps using
the built-in sample data.

## 3. Add entries and photos directly from the site

Each of Towniepedia, Secret Lots, Collections and Careers has a small
**"+ Add"** button at the top of the page. Click it, fill in the fields,
optionally drop in a photo, and submit — it writes a new row straight into
the matching tab of your Google Sheet, photo included.

This needs two one-time setups:

- **Cloudinary**, for the photo upload step. Sign up free at
  cloudinary.com, create an **unsigned** upload preset under
  Settings → Upload, then paste your cloud name and preset name into
  `CLOUDINARY_CONFIG` in `assets/js/config.js`.
- **A small Google Apps Script**, so the site can actually write the new
  row into your Sheet. Open your Sheet → Extensions → Apps Script, paste
  in the contents of `data/apps-script/Code.gs`, set an `EDIT_KEY` word of
  your choosing near the top, then Deploy → New deployment → Web app
  (Execute as: Me, Who has access: Anyone). Paste the resulting URL and
  your edit key into `ADD_ENTRY_CONFIG` in `assets/js/config.js`.

Until both are filled in, the "+ Add" forms simply don't appear — you can
always fall back to editing the Sheet directly and pasting image links
(Cloudinary, Imgur, wherever) into the `image_url` column by hand.

No image files are ever committed to the repo either way.

## 4. Deploy on GitHub Pages

1. Push this folder to a GitHub repo.
2. Repo **Settings → Pages** → Source: deploy from branch → pick `main` and
   the root folder.
3. Your site will be live at `https://<username>.github.io/<repo-name>/`.

Because everything is static and fetched client-side, there's nothing to
build — every push (or every Sheet edit) is reflected immediately.

## The Family Tree Maker

Fully client-side: members are stored in the browser's `localStorage`, keyed
per-device (not shared between visitors). Generation is computed
automatically from parents. Use **Export JSON** to save/back up a tree, or
to hand it to someone else.

If you'd rather trees be shareable across devices, the natural next step is
writing tree data to its own Google Sheet tab (one row per member) the same
way the other pages read data — ask if you want that wired up.

## Extending this

- Add a `Skills` tab and page the same way as the four existing list pages —
  copy `collections.html` + its `initGridPage()` config as a starting point.
- `pages.js`'s `initGridPage()` is generic: any CSV with a filterable field
  and a few search fields can become a new page in a few lines.
