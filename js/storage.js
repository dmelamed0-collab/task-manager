// storage.js — כל פעולות הקריאה/כתיבה ל-localStorage (משימות וקטגוריות)

const TASKS_KEY = "tasks_app_tasks";
const CATEGORIES_KEY = "tasks_app_categories";

const DEFAULT_CATEGORIES = ["עבודה", "אישי", "משפחה"];

// crypto.randomUUID() עובד רק בהקשר מאובטח (HTTPS/localhost) — חלופה שעובדת גם ב-HTTP רגיל
export function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
}

function seedDefaultTasks() {
  const today = new Date();
  const inDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  return [
    {
      id: generateId(),
      title: "להגיש דוח שבועי",
      notes: "לשלוח למנהל עד סוף היום",
      dueDate: inDays(1),
      priority: "high",
      category: "עבודה",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: "לקנות מתנה ליום הולדת",
      notes: "",
      dueDate: inDays(3),
      priority: "medium",
      category: "אישי",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      title: "לתאם ביקור אצל ההורים",
      notes: "בסוף השבוע הקרוב",
      dueDate: inDays(5),
      priority: "low",
      category: "משפחה",
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getTasks() {
  const raw = localStorage.getItem(TASKS_KEY);
  if (!raw) {
    const seeded = seedDefaultTasks();
    saveTasks(seeded);
    return seeded;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getCategories() {
  const raw = localStorage.getItem(CATEGORIES_KEY);
  if (!raw) {
    saveCategories(DEFAULT_CATEGORIES);
    return [...DEFAULT_CATEGORIES];
  }
  try {
    const parsed = JSON.parse(raw);
    const deduped = [...new Set(parsed)];
    if (deduped.length !== parsed.length) saveCategories(deduped);
    return deduped;
  } catch {
    return [...DEFAULT_CATEGORIES];
  }
}

export function saveCategories(categories) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}
