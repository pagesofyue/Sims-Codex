/**
 * SHEET_CONFIG
 * ------------
 * Points each section of the site at a CSV data source.
 *
 * Right now these point at the sample CSVs in /data/sample/ so the site
 * works out of the box. To connect your own Google Sheet:
 *
 *   1. In Google Sheets, create one tab per section below
 *      (Townies, SecretLots, Collections, Careers, SaveVersions) using the
 *      same column headers as the sample CSVs in /data/sample/.
 *   2. File > Share > Publish to web.
 *   3. Under "Link", choose the specific sheet tab, and "Comma-separated
 *      values (.csv)" as the format. Click Publish.
 *   4. Copy the generated URL and paste it below, replacing the sample path.
 *   5. Image URLs: upload images to Cloudinary, copy the delivery URL
 *      (https://res.cloudinary.com/...) into the image_url column.
 *
 * Every page re-fetches these on load, so editing the Sheet updates the
 * live site with no rebuild or redeploy needed.
 */
const SHEET_CONFIG = {
  townies: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTO0P0Pp9I79LbahcIvGRYnzffhLxv4EtKkmlrDPas9secLwK609rHYlewE39bi_uWR4zZon7VcpU0/pub?gid=0&single=true&output=csv",
  secretLots: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTO0P0Pp9I79LbahcIvGRYnzffhLxv4EtKkmlrDPas9secLwK609rHYlewE39bi_uWR4zZon7VcpU0/pub?gid=135139116&single=true&output=csv",
  collections: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTO0P0Pp9I79LbahcIvGRYnzffhLxv4EtKkmlrDPas9secLwK609rHYlewE39bi_uWR4zZon7VcpU0/pub?gid=1047193865&single=true&output=csv",
  careers: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTO0P0Pp9I79LbahcIvGRYnzffhLxv4EtKkmlrDPas9secLwK609rHYlewE39bi_uWR4zZon7VcpU0/pub?gid=1903912434&single=true&output=csv",
  saveVersions: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTO0P0Pp9I79LbahcIvGRYnzffhLxv4EtKkmlrDPas9secLwK609rHYlewE39bi_uWR4zZon7VcpU0/pub?gid=1054104480&single=true&output=csv",
};

/**
 * CLOUDINARY_CONFIG
 * -----------------
 * Powers the photo-attach step inside each "+ Add" form (Towniepedia,
 * Secret Lots, Collections, Careers) — drop in a photo and it uploads to
 * your Cloudinary account, no separate dashboard visit needed.
 *
 * One-time setup (a few minutes, only ever done once):
 *   1. Sign up free at cloudinary.com. On your Dashboard, note your
 *      "Cloud name" near the top.
 *   2. Go to Settings (gear icon) → Upload → scroll to "Upload presets"
 *      → Add upload preset.
 *   3. Set "Signing Mode" to Unsigned, save, and note the preset name
 *      it's given (or set your own).
 *   4. Paste both values below.
 *
 * Until you do, the photo-attach field inside each "+ Add" form simply
 * won't upload — everything else on the site still works fine off links
 * pasted directly into the Sheet.
 */
const CLOUDINARY_CONFIG = {
  cloudName: "izmakrk2",
  uploadPreset: "The Sims4",
};

/**
 * ADD_ENTRY_CONFIG
 * ----------------
 * Powers the "+ Add" forms on Towniepedia, Secret Lots, Collections and
 * Careers — fill in the fields, attach a photo, submit, and it writes a
 * new row straight into the matching tab of your Google Sheet.
 *
 * This needs a tiny Google Apps Script "receiver" living inside your
 * Sheet (free, no separate hosting). One-time setup:
 *   1. Open your Google Sheet → Extensions → Apps Script.
 *   2. Delete anything in the editor and paste in the contents of
 *      data/apps-script/Code.gs (included in this project).
 *   3. Near the top of that file, set EDIT_KEY to any word/phrase you like
 *      — this is a simple shared password so random visitors can't submit
 *      entries, just people you've shared the word with. It is NOT secure,
 *      just a light deterrent, since anyone with the URL could still see it.
 *   4. Click Deploy → New deployment → type: Web app.
 *      Execute as: Me. Who has access: Anyone. Click Deploy, and allow
 *      the permissions it asks for (it's your own script on your own sheet).
 *   5. Copy the Web app URL it gives you and paste it below as scriptUrl.
 *   6. Set editKey below to the same word you set in step 3.
 *
 * Until scriptUrl is filled in, the "+ Add" forms stay hidden and the
 * site works exactly as before — nothing breaks in the meantime.
 */
const ADD_ENTRY_CONFIG = {
  scriptUrl: "",  // e.g. "https://script.google.com/macros/s/AKfycb.../exec"
  editKey: "",    // e.g. "plumbob"
};
