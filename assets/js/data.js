/**
 * data.js — small wrapper around PapaParse for loading Sheet-backed CSVs,
 * with a simple in-memory cache so multiple components on the same page
 * (e.g. nav dropdown + page grid) don't double-fetch.
 */
const DataStore = (() => {
  const cache = {};

  async function load(key) {
    if (cache[key]) return cache[key];
    const url = SHEET_CONFIG[key];
    if (!url) throw new Error(`No data source configured for "${key}"`);

    const promise = new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(cleanRows(results.data)),
        error: reject,
      });
    });

    cache[key] = promise;
    return promise;
  }

  function cleanRows(rows) {
    // trim whitespace on every value, drop fully-empty rows
    return rows
      .map((row) => {
        const clean = {};
        Object.keys(row).forEach((k) => {
          clean[k.trim()] = (row[k] || "").toString().trim();
        });
        return clean;
      })
      .filter((row) => Object.values(row).some((v) => v !== ""));
  }

  function uniqueValues(rows, field) {
    return [...new Set(rows.map((r) => r[field]).filter(Boolean))];
  }

  return { load, uniqueValues };
})();
