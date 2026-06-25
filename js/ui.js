// ui.js — רינדור ל-DOM ואינטראקציות (כרטיסיות, טופס, מסך הגדרות, swipe למחיקה)

const PRIORITY_LABELS = { high: "גבוהה", medium: "בינונית", low: "נמוכה" };

function formatDate(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function renderTaskCard(task, { onToggle, onOpen, onDelete }) {
  const li = document.createElement("li");
  li.className = "task-card" + (task.completed ? " completed" : "");
  if (task.overdue) li.classList.add("overdue");
  li.dataset.id = task.id;

  li.innerHTML = `
    <div class="task-card-swipe-bg"><i class="ti ti-trash"></i></div>
    <div class="task-card-content">
      <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} aria-label="סמן כהושלם" />
      <div class="task-card-main">
        <p class="task-card-title">${escapeHtml(task.title)}</p>
        <div class="task-card-meta">
          ${task.dueDate ? `<span class="task-date">${formatDate(task.dueDate)}</span>` : ""}
        </div>
      </div>
      <span class="priority-tag priority-${task.priority}">${PRIORITY_LABELS[task.priority]}</span>
      <button class="icon-btn delete-btn" aria-label="מחיקה"><i class="ti ti-trash"></i></button>
    </div>
  `;

  const checkbox = li.querySelector(".task-checkbox");
  checkbox.addEventListener("click", (e) => {
    e.stopPropagation();
    onToggle(task.id);
  });

  const deleteBtn = li.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    onDelete(task.id);
  });

  const content = li.querySelector(".task-card-content");
  content.addEventListener("click", (e) => {
    if (e.target.closest(".task-checkbox") || e.target.closest(".delete-btn")) return;
    onOpen(task.id);
  });

  attachSwipeToDelete(li, content, () => onDelete(task.id));

  return li;
}

const UNCATEGORIZED_LABEL = "ללא קטגוריה";

export function renderTaskListGrouped(container, emptyState, tasks, categoryOrder, handlers) {
  container.innerHTML = "";

  if (tasks.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  const groups = new Map();
  for (const task of tasks) {
    const key = task.category || UNCATEGORIZED_LABEL;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(task);
  }

  const orderedKeys = [...categoryOrder.filter((c) => groups.has(c)), ...[...groups.keys()].filter((k) => !categoryOrder.includes(k))];

  for (const key of orderedKeys) {
    const groupHeader = document.createElement("li");
    groupHeader.className = "category-group-header";
    groupHeader.textContent = key;
    container.appendChild(groupHeader);

    for (const task of groups.get(key)) {
      container.appendChild(renderTaskCard(task, handlers));
    }
  }
}

export function renderTaskList(container, emptyState, tasks, handlers) {
  container.innerHTML = "";

  if (tasks.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  for (const task of tasks) {
    container.appendChild(renderTaskCard(task, handlers));
  }
}

function attachSwipeToDelete(li, content, onConfirmDelete) {
  let startX = 0;
  let currentX = 0;
  let dragging = false;
  const threshold = -80;

  content.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
    content.style.transition = "none";
  });

  content.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    currentX = e.touches[0].clientX - startX;
    if (currentX > 0) currentX = 0;
    content.style.transform = `translateX(${currentX}px)`;
  });

  content.addEventListener("touchend", () => {
    dragging = false;
    content.style.transition = "transform 0.2s ease";
    if (currentX < threshold) {
      content.style.transform = `translateX(-100%)`;
      setTimeout(onConfirmDelete, 180);
    } else {
      content.style.transform = "translateX(0)";
    }
    currentX = 0;
  });
}

export function populateCategorySelect(select, categories, { includeEmptyOption = false, placeholder = "" } = {}) {
  const current = select.value;
  select.innerHTML = "";
  if (includeEmptyOption) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholder;
    select.appendChild(opt);
  }
  for (const cat of categories) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  }
  if ([...select.options].some((o) => o.value === current)) {
    select.value = current;
  }
}

export function renderCategoryList(container, categories, onDelete) {
  container.innerHTML = "";
  if (categories.length === 0) {
    container.innerHTML = `<li class="empty-state">אין קטגוריות</li>`;
    return;
  }
  for (const cat of categories) {
    const li = document.createElement("li");
    li.className = "category-item";
    li.innerHTML = `
      <span>${escapeHtml(cat)}</span>
      <button class="icon-btn danger" aria-label="מחיקת קטגוריה"><i class="ti ti-trash"></i></button>
    `;
    li.querySelector("button").addEventListener("click", () => onDelete(cat));
    container.appendChild(li);
  }
}

export function showToast(el, message) {
  el.textContent = message;
  el.hidden = false;
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.classList.remove("show");
    el.hidden = true;
  }, 2200);
}

export function switchView(views, viewName) {
  for (const [name, el] of Object.entries(views)) {
    el.hidden = name !== viewName;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
