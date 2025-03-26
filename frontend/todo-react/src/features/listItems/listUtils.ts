import { Todo } from "@/types/types";
import { v4 as uuidv4 } from "uuid";

const url = "/todos";
export const fetchTodos = async () => {
  const response = await fetch(url);

  if (response.ok) {
    return response.json();
  } else {
    console.error("error fetching todos");
  }
};

export const addTodo = async (todo: Partial<Todo>) => {
  const newTodo = { ...todo, id: uuidv4() };
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  };

  const res = await fetch(url, requestOptions);

  if (res.ok) {
    const json = await res.json();
    return json;
  }
};

export const completeTodo = async (todo: Todo) => {
  const newTodo = { ...todo, completed: !todo.completed };
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  };

  const res = await fetch(url + "/" + todo.id, requestOptions);

  if (res.ok) {
    const json = await res.json();
    return json;
  }
};

export const deleteTodo = async (todo: Todo) => {
  const requestOptions = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  };

  const res = await fetch(url + "/" + todo.id, requestOptions);
  if (res.ok) {
    return todo;
  }
};

export const deleteCompletedTodos = async () => {
  const requestOptions = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  };

  const res = await fetch(url + "/completed", requestOptions);
  if (res.ok) {
    return res;
  }
};
