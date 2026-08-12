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
 * Powers the "Upload Photos" page (upload.html), which lets you drag a
 * photo in and get back a hosted link — no need to open Cloudinary's
 * dashboard by hand.
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
 * Until you do, the Upload Photos page will show a setup reminder instead
 * of the uploader — everything else on the site still works fine off
 * links pasted directly into the Sheet.
 */
const CLOUDINARY_CONFIG = {
  cloudName: "izmakrk2",
  uploadPreset: "The Sims4",
};
