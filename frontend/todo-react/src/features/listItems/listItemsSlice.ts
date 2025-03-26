import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// const url = API_URL || "http://localhost:8000/todos";
const url = "/todos";
const initialData: Todo[] = [
  { id: "1234", text: "Welcome to your new todo list", completed: false },
  {
    id: "1235",
    text: "Tap the sun to switch to light mode",
    completed: false,
  },
  {
    id: "12351",
    text: "Tap the circles to mark items completed",
    completed: false,
  },
];

export const initializeData = () => {
  // get the todos from localstorage
  const savedTodos = localStorage.getItem("todos");
  // if there are todos stored
  if (savedTodos && savedTodos !== "[]") {
    // return the parsed JSON object back to a javascript object
    return JSON.parse(savedTodos);
    // otherwise
  } else {
    // return an empty array
    return initialData;
  }
};

export const fetchTodos = async () => {
  const response = await fetch(url);
  console.log("backend url: ", url);

  if (response.ok) {
    return response.json();
  } else {
    console.log("error fetching todos");
  }
};

export const addTodo = async (todo: Partial<Todo>) => {
  const newTodo = { ...todo, id: uuidv4() };
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  };

  console.log("newTodo: ", newTodo);
  const res = await fetch(url, requestOptions);

  if (res.ok) {
    const json = await res.json();
    console.log("json: ", json);
    addListItem(json);
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
    addListItem(json);
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

const options = {
  name: "listItems",
  initialState: {
    listItems: [],
  },
  reducers: {
    addListItem(
      state: { listItems: Todo[] },
      action: { payload: any } | undefined,
    ) {
      state.listItems.push({
        ...action?.payload,
      });
    },
    addList(state: { listItems: Todo[] }, action: { payload: Todo[] }) {
      state.listItems.push(...action.payload);
    },
    removeListItem(state: { listItems: Todo[] }, action: { payload: string }) {
      state.listItems = state.listItems.filter(
        (item) => item.id !== String(action.payload),
      );
    },
    reorderItems(state: { listItems: Todo[] }, action: { payload: Todo[] }) {
      state.listItems = action.payload;
    },
    completeItem(state: { listItems: Todo[] }, action: { payload: any }) {
      let listItem = state.listItems.find((item) => item.id === action.payload);
      if (listItem) {
        listItem.completed = !listItem.completed;
      }
    },
    clearCompletedItems(state: { listItems: Todo[] }) {
      state.listItems = state.listItems.filter((item) => !item.completed);
    },
    resetList(state: { listItems: Todo[] }) {
      state.listItems = initialData;
    },
  },
};

const listItemsSlice = createSlice(options);

export function selectListItems(state: { listItems: { listItems: any } }) {
  return state.listItems.listItems;
}

export const {
  addListItem,
  removeListItem,
  reorderItems,
  completeItem,
  clearCompletedItems,
  resetList,
  addList,
} = listItemsSlice.actions;

export default listItemsSlice.reducer;
