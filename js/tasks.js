// tasks.js — לוגיקת ניהול משימות וקטגוריות (CRUD, מיון, סינון)

import { getTasks, saveTasks, getCategories, saveCategories, generateId } from "./storage.js";

export function loadTasks() {
  return getTasks();
}

export function loadCategories() {
  return getCategories();
}

export function addTask(task) {
  const tasks = getTasks();
  const newTask = {
    id: generateId(),
    title: task.title.trim(),
    notes: task.notes?.trim() || "",
    dueDate: task.dueDate || "",
    priority: task.priority || "medium",
    category: task.category || "",
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTask(id, updates) {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...updates };
  saveTasks(tasks);
  return tasks[idx];
}

export function deleteTask(id) {
  const tasks = getTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
}

export function toggleComplete(id) {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx].completed = !tasks[idx].completed;
  saveTasks(tasks);
  return tasks[idx];
}

export function getTaskById(id) {
  return getTasks().find((t) => t.id === id) || null;
}

export function addCategory(name) {
  const categories = getCategories();
  const trimmed = name.trim();
  if (!trimmed || categories.includes(trimmed)) return categories;
  categories.push(trimmed);
  saveCategories(categories);
  return categories;
}

export function deleteCategory(name) {
  const categories = getCategories().filter((c) => c !== name);
  saveCategories(categories);
  return categories;
}

export function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function sortByDueDate(tasks) {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
}

export function filterTasks(tasks, { category, priority, status }) {
  return tasks.filter((t) => {
    if (category && t.category !== category) return false;
    if (priority && t.priority !== priority) return false;
    if (status === "open" && t.completed) return false;
    if (status === "done" && !t.completed) return false;
    return true;
  });
}
