import { createSlice } from "@reduxjs/toolkit";
import { Config } from "../../config";

// const url = API_URL || "http://localhost:8000/todos";
const url = "/todos"
const initialData = [
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
  console.log("backend url: ", url)

  if (response.ok) {
    return response.json()
  } else {
    console.log("error fetching todos")

  }
}

export const addTodo = async (todo) => {
  const newTodo = { ...todo }
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTodo)
  };


  const res = await fetch(url, requestOptions);

  if (res.ok) {
    const json = await res.json()
    addListItem(json)
    return json
  }
}

export const completeTodo = async (todo) => {
  const newTodo = {...todo, completed: !todo.completed}
  const requestOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTodo)
  }

  const res = await fetch(url + "/" + todo.id, requestOptions);

  if (res.ok) {
    const json = await res.json()
    addListItem(json)
    return json
  }
}

const options = {
  name: "listItems",
  initialState: {
    // listItems: initializeData(),
    listItems: []
  },
  reducers: {
    addListItem(state, action) {
      state.listItems.push({
        // id: String(uniqueId++),
        ...action.payload,
      });
    },
    addList(state, action) {
      state.listItems.push(...action.payload)
    },
    removeListItem(state, action) {
      state.listItems = state.listItems.filter(
        (item) => item.id !== String(action.payload)
      );
    },
    reorderItems(state, action) {
      state.listItems = action.payload;
      return state;
    },
    applyFilter(state, action) {
      state.filteredListItems = action.payload;
    },
    completeItem(state, action) {
      let listItem = state.listItems.find(
        (item) => item.id === action.payload
      );
      listItem.completed = !listItem.completed;
    },
    clearCompletedItems(state) {
      state.listItems = state.listItems.filter((item) => !item.completed);
    },
    resetList(state) {
      state.listItems = initialData;
    },
  },
};

const listItemsSlice = createSlice(options);

export function selectListItems(state) {
  return state.listItems.listItems;
}

export const {
  addListItem,
  removeListItem,
  reorderItems,
  applyFilter,
  completeItem,
  clearCompletedItems,
  resetList,
  addList
} = listItemsSlice.actions;

export default listItemsSlice.reducer;
