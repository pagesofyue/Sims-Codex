/**
 * family-tree.js — a small client-side family tree builder.
 * Members are stored in localStorage (per-browser, no backend needed).
 * Layout is automatic: generation = 1 + max(parents' generations).
 */
const STORAGE_KEY = "simsCodex.familyTree";

function loadMembers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveMembers(members) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

let members = loadMembers();

function computeGeneration(parentIds, spouseId) {
  const parents = members.filter((m) => parentIds.includes(m.id));
  if (parents.length) {
    return Math.max(...parents.map((p) => p.gen)) + 1;
  }
  const spouse = members.find((m) => m.id === spouseId);
  if (spouse) return spouse.gen;
  return 0;
}

function addMember({ name, parentIds, spouseId, photo }) {
  const id = "m" + Date.now() + Math.floor(Math.random() * 1000);
  const gen = computeGeneration(parentIds, spouseId);
  const member = { id, name, parentIds: parentIds.filter(Boolean), spouseId: spouseId || null, photo: photo || "", gen };
  members.push(member);
  if (spouseId) {
    const spouse = members.find((m) => m.id === spouseId);
    if (spouse && !spouse.spouseId) spouse.spouseId = id;
  }
  saveMembers(members);
  renderAll();
}

function removeMember(id) {
  members = members.filter((m) => m.id !== id);
  members.forEach((m) => {
    m.parentIds = m.parentIds.filter((p) => p !== id);
    if (m.spouseId === id) m.spouseId = null;
  });
  saveMembers(members);
  renderAll();
}

function clearTree() {
  if (!confirm("Clear the entire tree? This can't be undone.")) return;
  members = [];
  saveMembers(members);
  renderAll();
}

function exportTree() {
  const blob = new Blob([JSON.stringify(members, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "family-tree.json";
  a.click();
}

function populateSelects() {
  const parentASel = document.getElementById("parentA");
  const parentBSel = document.getElementById("parentB");
  const spouseSel = document.getElementById("spouseSel");
  const options =
    '<option value="">— none —</option>' +
    members.map((m) => `<option value="${m.id}">${m.name} (gen ${m.gen})</option>`).join("");
  parentASel.innerHTML = options;
  parentBSel.innerHTML = options;
  spouseSel.innerHTML = options;
}

function renderTree() {
  const inner = document.getElementById("tree-canvas-inner");
  const rowsHost = document.getElementById("tree-rows");
  rowsHost.innerHTML = "";

  if (!members.length) {
    rowsHost.innerHTML = '<div class="empty-state">No sims yet — add your first founder below.</div>';
    const svg = document.getElementById("tree-svg");
    svg.innerHTML = "";
    return;
  }

  const byGen = {};
  members.forEach((m) => {
    byGen[m.gen] = byGen[m.gen] || [];
    byGen[m.gen].push(m);
  });

  Object.keys(byGen)
    .sort((a, b) => a - b)
    .forEach((gen) => {
      const row = document.createElement("div");
      row.className = "tree-gen-row";
      row.dataset.gen = gen;

      const placed = new Set();
      byGen[gen].forEach((m) => {
        if (placed.has(m.id)) return;
        row.appendChild(nodeEl(m));
        placed.add(m.id);
        if (m.spouseId && byGen[gen].some((x) => x.id === m.spouseId) && !placed.has(m.spouseId)) {
          const spouse = byGen[gen].find((x) => x.id === m.spouseId);
          row.appendChild(nodeEl(spouse));
          placed.add(spouse.id);
        }
      });
      rowsHost.appendChild(row);
    });

  drawConnectors(inner);
}

function nodeEl(m) {
  const div = document.createElement("div");
  div.className = "tree-node";
  div.dataset.id = m.id;
  div.innerHTML = `${m.name}<span class="sub">Gen ${m.gen}</span><button class="remove" title="Remove" data-remove="${m.id}">×</button>`;
  return div;
}

function drawConnectors(inner) {
  const svg = document.getElementById("tree-svg");
  const w = inner.scrollWidth;
  const h = inner.scrollHeight;
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  let paths = "";

  const rect = (el) => {
    const r = el.getBoundingClientRect();
    const c = inner.getBoundingClientRect();
    return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
  };
  const nodeById = (id) => inner.querySelector(`.tree-node[data-id="${id}"]`);

  // spouse lines
  const drawnSpousePairs = new Set();
  members.forEach((m) => {
    if (!m.spouseId) return;
    const pairKey = [m.id, m.spouseId].sort().join("-");
    if (drawnSpousePairs.has(pairKey)) return;
    drawnSpousePairs.add(pairKey);
    const a = nodeById(m.id);
    const b = nodeById(m.spouseId);
    if (!a || !b) return;
    const ra = rect(a);
    const rb = rect(b);
    const y = ra.y + ra.h / 2;
    const x1 = Math.min(ra.x + ra.w, rb.x + rb.w);
    const x2 = Math.max(ra.x, rb.x);
    paths += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="var(--gold)" stroke-width="2"/>`;
  });

  // parent-child lines
  members.forEach((m) => {
    if (!m.parentIds.length) return;
    const child = nodeById(m.id);
    if (!child) return;
    const rc = rect(child);
    const childTop = { x: rc.x + rc.w / 2, y: rc.y };

    const parentEls = m.parentIds.map(nodeById).filter(Boolean);
    if (!parentEls.length) return;
    const parentRects = parentEls.map(rect);
    const parentBottomY = Math.max(...parentRects.map((r) => r.y + r.h));
    const parentX = parentRects.reduce((sum, r) => sum + r.x + r.w / 2, 0) / parentRects.length;

    const busY = parentBottomY + (childTop.y - parentBottomY) / 2;
    paths += `<path d="M${parentX},${parentBottomY} L${parentX},${busY} L${childTop.x},${busY} L${childTop.x},${childTop.y}" fill="none" stroke="var(--mint)" stroke-width="2"/>`;
  });

  svg.innerHTML = paths;
}

function renderAll() {
  populateSelects();
  renderTree();
}

function initFamilyTree() {
  document.getElementById("addSimForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("simName").value.trim();
    if (!name) return;
    addMember({
      name,
      parentIds: [document.getElementById("parentA").value, document.getElementById("parentB").value],
      spouseId: document.getElementById("spouseSel").value,
      photo: document.getElementById("simPhoto").value.trim(),
    });
    e.target.reset();
  });

  document.getElementById("clearTreeBtn").addEventListener("click", clearTree);
  document.getElementById("exportTreeBtn").addEventListener("click", exportTree);

  document.getElementById("tree-rows").addEventListener("click", (e) => {
    const id = e.target.dataset.remove;
    if (id) removeMember(id);
  });

  window.addEventListener("resize", () => drawConnectors(document.getElementById("tree-canvas-inner")));

  renderAll();
}
