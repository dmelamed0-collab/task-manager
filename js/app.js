// app.js — אתחול האפליקציה, ניתוב בין מסכים, וחיבור הלוגיקה לממשק

import {
  loadTasks,
  loadCategories,
  addTask,
  updateTask,
  deleteTask,
  toggleComplete,
  getTaskById,
  addCategory,
  deleteCategory,
  isOverdue,
  sortByPriorityThenDate,
  filterTasks,
} from "./tasks.js?v=6";
import { renderTaskListGrouped, populateCategorySelect, renderCategoryList, showToast, switchView } from "./ui.js?v=6";

const views = {
  list: document.getElementById("view-list"),
  form: document.getElementById("view-form"),
  settings: document.getElementById("view-settings"),
};

const taskListEl = document.getElementById("task-list");
const emptyStateEl = document.getElementById("empty-state");
const toastEl = document.getElementById("toast");

const filterCategoryEl = document.getElementById("filter-category");
const filterPriorityEl = document.getElementById("filter-priority");
const filterStatusEl = document.getElementById("filter-status");
const btnClearFilters = document.getElementById("btn-clear-filters");

const taskForm = document.getElementById("task-form");
const formTitle = document.getElementById("form-title");
const fieldId = document.getElementById("task-id");
const fieldTitle = document.getElementById("task-title");
const fieldDueDate = document.getElementById("task-due-date");
const fieldPriority = document.getElementById("task-priority");
const fieldCategory = document.getElementById("task-category");
const fieldNotes = document.getElementById("task-notes");
const errorTitle = document.getElementById("error-title");
const btnDeleteTask = document.getElementById("btn-delete-task");
const btnCancelForm = document.getElementById("btn-cancel-form");
const btnToggleNewCategory = document.getElementById("btn-toggle-new-category");
const newCategoryField = document.getElementById("new-category-field");
const newCategoryNameInput = document.getElementById("new-category-name");
const btnAddCategory = document.getElementById("btn-add-category");

const btnSettings = document.getElementById("btn-settings");
const btnBackSettings = document.getElementById("btn-back-settings");
const categoryListEl = document.getElementById("category-list");
const settingsNewCategoryInput = document.getElementById("settings-new-category");
const btnSettingsAddCategory = document.getElementById("btn-settings-add-category");

const btnFabAdd = document.getElementById("btn-fab-add");

let editingTaskId = null;

function goToView(name) {
  switchView(views, name);
  btnFabAdd.hidden = name !== "list";
}

function refreshTaskList() {
  const allTasks = loadTasks();
  const filtered = filterTasks(allTasks, {
    category: filterCategoryEl.value,
    priority: filterPriorityEl.value,
    status: filterStatusEl.value,
  });
  const sorted = sortByPriorityThenDate(filtered).map((t) => ({ ...t, overdue: isOverdue(t) }));
  renderTaskListGrouped(taskListEl, emptyStateEl, sorted, loadCategories(), {
    onToggle: (id) => {
      toggleComplete(id);
      refreshTaskList();
    },
    onOpen: (id) => openEditForm(id),
    onDelete: (id) => {
      deleteTask(id);
      refreshTaskList();
      showToast(toastEl, "המשימה נמחקה");
    },
  });
}

function refreshFilterCategories() {
  const categories = loadCategories();
  populateCategorySelect(filterCategoryEl, categories, { includeEmptyOption: true, placeholder: "כל הקטגוריות" });
}

function refreshFormCategories() {
  const categories = loadCategories();
  populateCategorySelect(fieldCategory, categories, { includeEmptyOption: true, placeholder: "ללא קטגוריה" });
}

function refreshSettings() {
  const categories = loadCategories();
  renderCategoryList(categoryListEl, categories, (cat) => {
    deleteCategory(cat);
    refreshSettings();
    refreshFilterCategories();
    refreshFormCategories();
    showToast(toastEl, "הקטגוריה נמחקה");
  });
}

function openAddForm() {
  editingTaskId = null;
  formTitle.textContent = "משימה חדשה";
  btnDeleteTask.hidden = true;
  taskForm.reset();
  fieldId.value = "";
  fieldPriority.value = "medium";
  refreshFormCategories();
  newCategoryField.hidden = true;
  errorTitle.hidden = true;
  goToView("form");
}

function openEditForm(id) {
  const task = getTaskById(id);
  if (!task) return;
  editingTaskId = id;
  formTitle.textContent = "עריכת משימה";
  btnDeleteTask.hidden = false;
  fieldId.value = task.id;
  fieldTitle.value = task.title;
  fieldDueDate.value = task.dueDate || "";
  fieldPriority.value = task.priority;
  fieldNotes.value = task.notes || "";
  refreshFormCategories();
  fieldCategory.value = task.category || "";
  newCategoryField.hidden = true;
  errorTitle.hidden = true;
  goToView("form");
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = fieldTitle.value.trim();
  if (!title) {
    errorTitle.hidden = false;
    fieldTitle.scrollIntoView({ behavior: "smooth", block: "center" });
    fieldTitle.focus();
    showToast(toastEl, "נא להזין כותרת למשימה");
    return;
  }
  errorTitle.hidden = true;

  const data = {
    title,
    dueDate: fieldDueDate.value,
    priority: fieldPriority.value,
    category: fieldCategory.value,
    notes: fieldNotes.value,
  };

  if (editingTaskId) {
    updateTask(editingTaskId, data);
    showToast(toastEl, "המשימה עודכנה");
  } else {
    addTask(data);
    showToast(toastEl, "המשימה נוספה");
  }

  refreshFilterCategories();
  refreshTaskList();
  goToView("list");
});

btnDeleteTask.addEventListener("click", () => {
  if (!editingTaskId) return;
  deleteTask(editingTaskId);
  refreshTaskList();
  goToView("list");
  showToast(toastEl, "המשימה נמחקה");
});

btnCancelForm.addEventListener("click", () => goToView("list"));

btnToggleNewCategory.addEventListener("click", () => {
  newCategoryField.hidden = !newCategoryField.hidden;
  if (!newCategoryField.hidden) newCategoryNameInput.focus();
});

btnAddCategory.addEventListener("click", () => {
  const name = newCategoryNameInput.value.trim();
  if (!name) return;
  addCategory(name);
  refreshFormCategories();
  fieldCategory.value = name;
  newCategoryNameInput.value = "";
  newCategoryField.hidden = true;
  refreshFilterCategories();
  showToast(toastEl, "הקטגוריה נוספה");
});

btnFabAdd.addEventListener("click", openAddForm);

filterCategoryEl.addEventListener("change", refreshTaskList);
filterPriorityEl.addEventListener("change", refreshTaskList);
filterStatusEl.addEventListener("change", refreshTaskList);

btnClearFilters.addEventListener("click", () => {
  filterCategoryEl.value = "";
  filterPriorityEl.value = "";
  filterStatusEl.value = "";
  refreshTaskList();
});

btnSettings.addEventListener("click", () => {
  refreshSettings();
  goToView("settings");
});

btnBackSettings.addEventListener("click", () => {
  refreshTaskList();
  goToView("list");
});

btnSettingsAddCategory.addEventListener("click", () => {
  const name = settingsNewCategoryInput.value.trim();
  if (!name) return;
  addCategory(name);
  settingsNewCategoryInput.value = "";
  refreshSettings();
  refreshFilterCategories();
  showToast(toastEl, "הקטגוריה נוספה");
});

function init() {
  refreshFilterCategories();
  refreshTaskList();
}

init();
