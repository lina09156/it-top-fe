const API_URL = 'http://212.193.11.210:3000';
const STUDENT_ID = 13;

const headers = {
  'X-Student-Id': String(STUDENT_ID),
};

const jsonHeaders = {
  ...headers,
  'Content-Type': 'application/json',
};

async function getTodos() {
  const res = await fetch(`${API_URL}/todos`, { headers: jsonHeaders });
  const result = await res.json();
  return result;
}

async function createTodo(title) {
  const res = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ title }),
  });
  const result = await res.json();
  return result;
}

async function updateTodo(id, data) {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  const result = await res.json();
  return result;
}

async function deleteTodo(id) {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
    headers: jsonHeaders,
  });
  const result = await res.json();
  return result;
}

async function main() {
  const todos = await getTodos();
  console.log('todos:', todos);

  const created = await createTodo('Новая задача на JS аззазаза');
  console.log('created:', created);

  const updated = await updateTodo(created.id, { completed: true });
  console.log('updated:', updated);
}

main();
