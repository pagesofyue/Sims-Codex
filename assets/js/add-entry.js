/**
 * add-entry.js — builds the "+ Add" form used on Towniepedia, Secret Lots,
 * Collections and Careers. Each form has its own fields, but they all
 * share the same photo-attach + submit-to-sheet plumbing.
 */
function isAddEntryConfigured() {
  return !!(ADD_ENTRY_CONFIG.scriptUrl && ADD_ENTRY_CONFIG.editKey !== undefined);
}

function idPrefixFor(tabName) {
  return { Townies: "t", SecretLots: "sl", Collections: "c", Careers: "cr" }[tabName] || "e";
}

function fieldHtml(field) {
  const req = field.required ? "required" : "";
  const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : "";
  if (field.type === "textarea") {
    return `
      <div class="field" style="flex:1 1 100%;">
        <label for="f_${field.key}">${field.label}${field.required ? " *" : ""}</label>
        <textarea id="f_${field.key}" rows="3" ${placeholder} ${req} style="resize:vertical; font-family:var(--font-body); padding:8px 10px; border-radius:8px; border:1px solid rgba(243,239,224,0.25); background:rgba(255,255,255,0.04); color:var(--text-light);"></textarea>
      </div>`;
  }
  return `
    <div class="field" style="flex:1 1 220px;">
      <label for="f_${field.key}">${field.label}${field.required ? " *" : ""}</label>
      <input id="f_${field.key}" type="text" ${placeholder} ${req}>
    </div>`;
}

function initAddEntryForm({ containerId, entryLabel, tabName, fields }) {
  const host = document.getElementById(containerId);
  if (!host || !isAddEntryConfigured()) return; // stays hidden until configured

  let photoUrl = "";
  let photoUploading = false;

  host.innerHTML = `
    <button type="button" class="btn secondary" id="toggleAddForm_${containerId}">+ Add ${entryLabel}</button>
    <form id="addForm_${containerId}" class="tree-toolbar" style="display:none; margin-top:14px;">
      ${fields.map(fieldHtml).join("")}
      <div class="field" style="flex:1 1 100%;">
        <label>Photo (optional)</label>
        <div class="dropzone" id="dz_${containerId}" style="padding:24px 16px;">
          <p style="margin:0;">Click or drop a photo here</p>
          <input type="file" id="fi_${containerId}" accept="image/*" hidden>
        </div>
        <div id="dzPreview_${containerId}" style="margin-top:8px; display:none; align-items:center; gap:10px;">
          <img id="dzThumb_${containerId}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;">
          <span id="dzStatus_${containerId}" style="font-family:var(--font-mono); font-size:0.75rem;"></span>
        </div>
      </div>
      <div class="field" style="flex:1 1 160px;">
        <label for="ek_${containerId}">Edit key</label>
        <input id="ek_${containerId}" type="password" placeholder="shared word">
      </div>
      <button type="submit" class="btn">Submit</button>
      <button type="button" class="btn secondary" id="cancelAddForm_${containerId}">Cancel</button>
      <div id="addFormStatus_${containerId}" style="flex:1 1 100%; font-family:var(--font-mono); font-size:0.82rem;"></div>
    </form>`;

  const toggleBtn = document.getElementById(`toggleAddForm_${containerId}`);
  const form = document.getElementById(`addForm_${containerId}`);
  const cancelBtn = document.getElementById(`cancelAddForm_${containerId}`);
  const statusEl = document.getElementById(`addFormStatus_${containerId}`);
  const dz = document.getElementById(`dz_${containerId}`);
  const fi = document.getElementById(`fi_${containerId}`);
  const preview = document.getElementById(`dzPreview_${containerId}`);
  const thumb = document.getElementById(`dzThumb_${containerId}`);
  const dzStatus = document.getElementById(`dzStatus_${containerId}`);

  toggleBtn.addEventListener("click", () => {
    form.style.display = form.style.display === "none" ? "flex" : "none";
  });
  cancelBtn.addEventListener("click", () => {
    form.reset();
    form.style.display = "none";
    photoUrl = "";
    preview.style.display = "none";
    statusEl.textContent = "";
  });

  dz.addEventListener("click", () => fi.click());
  fi.addEventListener("change", () => {
    const file = fi.files[0];
    if (!file) return;
    thumb.src = URL.createObjectURL(file);
    preview.style.display = "flex";
    dzStatus.textContent = "Uploading…";
    photoUploading = true;
    uploadToCloudinary(file)
      .then((data) => {
        photoUrl = data.secure_url;
        dzStatus.textContent = "Photo ready ✓";
        photoUploading = false;
      })
      .catch((err) => {
        dzStatus.textContent = "Upload failed: " + err.message;
        photoUploading = false;
      });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (photoUploading) {
      statusEl.textContent = "Still uploading the photo — hang on a second…";
      return;
    }
    const editKey = document.getElementById(`ek_${containerId}`).value;
    const row = { id: idPrefixFor(tabName) + Date.now() };
    for (const field of fields) {
      row[field.key] = document.getElementById(`f_${field.key}`).value.trim();
    }
    row.image_url = photoUrl;

    statusEl.textContent = "Saving…";
    try {
      await fetch(ADD_ENTRY_CONFIG.scriptUrl, {
        method: "POST",
        body: JSON.stringify({ tab: tabName, editKey, row }),
      });
      // Apps Script's response often can't be read back due to a redirect,
      // even when the write succeeded — so we treat "no network error" as
      // success rather than waiting on a parsed response body.
      statusEl.style.color = "var(--mint)";
      statusEl.textContent = "Added! It can take a minute to show up here after Google refreshes the published sheet.";
      form.reset();
      photoUrl = "";
      preview.style.display = "none";
    } catch (err) {
      statusEl.style.color = "var(--coral)";
      statusEl.textContent = "Couldn't reach the sheet: " + err.message;
    }
  });
}
