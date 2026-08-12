/**
 * uploader.js — direct browser-to-Cloudinary uploads using an unsigned
 * upload preset (see CLOUDINARY_CONFIG in config.js). No backend needed:
 * the file goes straight from the visitor's browser to Cloudinary, and
 * Cloudinary hands back a permanent URL.
 */
function isCloudinaryConfigured() {
  return !!(CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.uploadPreset);
}

async function uploadToCloudinary(file, onProgress) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data);
        } else {
          reject(new Error(data.error?.message || "Upload failed"));
        }
      } catch (e) {
        reject(e);
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}

function initUploader({ dropZoneId, fileInputId, listId, setupNoticeId }) {
  const dropZone = document.getElementById(dropZoneId);
  const fileInput = document.getElementById(fileInputId);
  const list = document.getElementById(listId);
  const setupNotice = document.getElementById(setupNoticeId);

  if (!isCloudinaryConfigured()) {
    dropZone.style.display = "none";
    setupNotice.style.display = "block";
    return;
  }

  function handleFiles(files) {
    [...files].forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      queueUpload(file);
    });
  }

  function queueUpload(file) {
    const rowId = "up" + Date.now() + Math.floor(Math.random() * 1000);
    const previewUrl = URL.createObjectURL(file);

    const row = document.createElement("div");
    row.className = "upload-row";
    row.id = rowId;
    row.innerHTML = `
      <img class="upload-thumb" src="${previewUrl}" alt="">
      <div class="upload-info">
        <div class="upload-name">${file.name}</div>
        <div class="upload-status">Uploading…</div>
        <div class="upload-bar"><div class="upload-bar-fill" style="width:0%"></div></div>
      </div>
      <div class="upload-result" style="display:none;">
        <input type="text" class="search-input upload-url" readonly>
        <button class="btn secondary copy-btn">Copy link</button>
      </div>`;
    list.prepend(row);

    uploadToCloudinary(file, (pct) => {
      row.querySelector(".upload-bar-fill").style.width = pct + "%";
    })
      .then((data) => {
        row.querySelector(".upload-status").textContent = "Done";
        row.querySelector(".upload-bar").style.display = "none";
        const resultEl = row.querySelector(".upload-result");
        resultEl.style.display = "flex";
        const urlInput = row.querySelector(".upload-url");
        urlInput.value = data.secure_url;
        row.querySelector(".copy-btn").addEventListener("click", () => {
          urlInput.select();
          navigator.clipboard.writeText(data.secure_url);
          const btn = row.querySelector(".copy-btn");
          const original = btn.textContent;
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = original), 1500);
        });
      })
      .catch((err) => {
        row.querySelector(".upload-status").textContent = "Failed: " + err.message;
        row.querySelector(".upload-status").style.color = "var(--coral)";
      });
  }

  dropZone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

  ["dragenter", "dragover"].forEach((evt) =>
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-active");
    })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropZone.classList.remove("drag-active");
    })
  );
  dropZone.addEventListener("drop", (e) => handleFiles(e.dataTransfer.files));
}
