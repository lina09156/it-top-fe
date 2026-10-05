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

async function main() {
  const created = await createTodo('Ляля');
  console.log(created);
}

main();
