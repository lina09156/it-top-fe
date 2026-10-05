const API_URL = 'http://212.193.11.210:3000';
const STUDENT_ID = 13;

const state = {
  todos: [],
  filter: 'all',
  search: '',
  loading: false,
  error: null,
};

const todoForm = document.querySelector('#todoForm');
const todoInput = document.querySelector('#todoInput');
const todoList = document.querySelector('#todoList');
const searchInput = document.querySelector('#searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.querySelector('#clearCompletedBtn');
const totalCount = document.querySelector('#totalCount');
const activeCount = document.querySelector('#activeCount');
const doneCount = document.querySelector('#doneCount');

const headers = {
  'X-Student-Id': String(STUDENT_ID),
};

const jsonHeaders = {
  ...headers,
  'Content-Type': 'application/json',
};

async function getTodos() {
  const res = await fetch(`${API_URL}/todos`, { headers });
  if (!res.ok) throw new Error('Не удалось загрузить задачи');
  return res.json();
}

async function createTodo(title) {
  const res = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Не удалось создать задачу');
  return res.json();
}

async function updateTodo(id, data) {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Не удалось обновить задачу');
  return res.json();
}

async function deleteTodo(id) {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Не удалось удалить задачу');
  if (res.status === 204) return null;
  return res.json();
}

function createDeleteHandler(id) {
  return async function (event) {
    const btn = event.currentTarget;
    btn.disabled = true;
    try {
      await deleteTodo(id);
      state.todos = state.todos.filter((todo) => todo.id !== id);
      renderTodos();
    } catch (error) {
      btn.disabled = false;
      alert(error.message);
    }
  };
}

function createToggleHandler(id) {
  return async function (event) {
    const checkbox = event.currentTarget;
    const todo = state.todos.find((t) => t.id === id);
    if (!todo) return;
    checkbox.disabled = true;
    try {
      const updated = await updateTodo(id, { completed: !todo.completed });
      const idx = state.todos.findIndex((t) => t.id === id);
      state.todos[idx] = updated;
      renderTodos();
    } catch (error) {
      checkbox.checked = todo.completed;
      checkbox.disabled = false;
      alert(error.message);
    }
  };
}

async function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  const submitButton = todoForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Сохраняем...';

  try {
    const newTodo = await createTodo(text);
    state.todos.push(newTodo);
    todoInput.value = '';
    renderTodos();
  } catch (error) {
    alert(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Добавить';
  }
}

function searchTodos() {
  state.search = searchInput.value;
  renderTodos();
}

function getFilteredTodos() {
  return state.todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(state.search.toLowerCase());
    if (state.filter === 'active') return !todo.completed && matchesSearch;
    if (state.filter === 'completed') return todo.completed && matchesSearch;
    return matchesSearch;
  });
}

function renderTodos() {
  if (state.loading) {
    todoList.innerHTML = '<li class="empty-state">Загрузка...</li>';
    return;
  }

  if (state.error) {
    todoList.innerHTML = `<li class="empty-state">${state.error}</li>`;
    return;
  }

  const filtered = getFilteredTodos();
  todoList.innerHTML = '';

  if (filtered.length === 0) {
    todoList.innerHTML = '<li class="empty-state">Ничего не найдено</li>';
  } else {
    filtered.forEach((todo) => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', createToggleHandler(todo.id));

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.title;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', createDeleteHandler(todo.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  }

  updateStats();
}

function updateStats() {
  const total = state.todos.length;
  const active = state.todos.filter((t) => !t.completed).length;
  const done = state.todos.filter((t) => t.completed).length;

  totalCount.textContent = total;
  activeCount.textContent = active;
  doneCount.textContent = done;
}

async function clearCompleted() {
  const completed = state.todos.filter((t) => t.completed);
  if (completed.length === 0) return;

  const originalText = clearCompletedBtn.textContent;
  clearCompletedBtn.disabled = true;
  clearCompletedBtn.textContent = 'Удаляем...';

  try {
    for (const todo of completed) {
      await deleteTodo(todo.id);
      state.todos = state.todos.filter((t) => t.id !== todo.id);
    }
    renderTodos();
  } catch (error) {
    alert(error.message);
  } finally {
    clearCompletedBtn.disabled = false;
    clearCompletedBtn.textContent = originalText;
  }
}

function setActiveFilter(button) {
  state.filter = button.dataset.filter;
  filterButtons.forEach((btn) => btn.classList.remove('active'));
  button.classList.add('active');
  renderTodos();
}

async function init() {
  state.loading = true;
  state.error = null;
  renderTodos();

  try {
    state.todos = await getTodos();
  } catch (error) {
    state.error = error.message;
    alert(error.message);
  } finally {
    state.loading = false;
    renderTodos();
  }
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo();
});

searchInput.addEventListener('input', () => {
  searchTodos();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveFilter(button);
  });
});

clearCompletedBtn.addEventListener('click', () => {
  clearCompleted();
});

init();
