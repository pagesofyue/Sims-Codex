/**
 * Code.gs — paste this whole file into Extensions > Apps Script inside
 * your Google Sheet. See ADD_ENTRY_CONFIG in assets/js/config.js for the
 * full setup steps.
 *
 * What it does: the site's "+ Add" forms POST a small JSON payload here.
 * This appends a new row to whichever tab the form was for, using
 * whatever headers already exist in row 1 of that tab — so as long as
 * your headers match the site's expected columns, new rows land in the
 * right place, in the right order, automatically.
 */

// Set this to any word or phrase you like. The site's forms will ask for
// the same word before submitting. It's a light deterrent, not real
// security — anyone who has the word (or reads this script) can submit.
const EDIT_KEY = "CHANGE_ME";

// Which tab names are allowed to be written to. Keep this in sync with
// the tab names in your spreadsheet.
const ALLOWED_TABS = ["Townies", "SecretLots", "Collections", "Careers"];

function doPost(e) {
  const respond = (obj) =>
    ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);

  try {
    const payload = JSON.parse(e.postData.contents);

    if (payload.editKey !== EDIT_KEY) {
      return respond({ success: false, error: "Wrong edit key." });
    }
    if (!ALLOWED_TABS.includes(payload.tab)) {
      return respond({ success: false, error: "Unknown tab: " + payload.tab });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(payload.tab);
    if (!sheet) {
      return respond({ success: false, error: "Tab not found: " + payload.tab });
    }

    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map((h) => h.toString().trim());

    const row = headers.map((h) => (payload.row[h] !== undefined ? payload.row[h] : ""));
    sheet.appendRow(row);

    return respond({ success: true });
  } catch (err) {
    return respond({ success: false, error: err.message });
  }
}

// Lets you sanity-check the deployment by visiting the Web app URL
// directly in a browser — should show a small JSON message, not an error.
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "Sims Codex receiver is running." })
  ).setMimeType(ContentService.MimeType.JSON);
}
