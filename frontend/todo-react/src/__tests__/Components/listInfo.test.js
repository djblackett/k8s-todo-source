/* eslint-disable no-unused-vars */
import { render, screen } from "@testing-library/react";
import React from "react";
import ListInfo from "../../ListInfo";
import store from "../../features/app/store";
import { Provider } from "react-redux";
import userEvent from "@testing-library/user-event";

test("renders ListInfo", () => {
  render(
    <Provider store={store}>
      <ListInfo />
    </Provider>
  );

  const listInfo = screen.getByTestId(/list-info-component-test/i);
  expect(listInfo).toBeInTheDocument();
});

test("renders items left text", () => {
  render(
    <Provider store={store}>
      <ListInfo />
    </Provider>
  );

  const text = screen.getByText(/ items left/i);
  expect(text).toBeInTheDocument();
});

test("renders All text", () => {
  render(
    <Provider store={store}>
      <ListInfo />
    </Provider>
  );

  const text = screen.getByText(/All/i);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass("list-option list-option-selected");
});

test("renders Completed text", () => {
  render(
    <Provider store={store}>
      <ListInfo />
    </Provider>
  );

  const mode = store.getState().colorMode.colorMode;
  const text = screen.getByText(/^Completed$/i);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass(`list-option list-option-unselected-${mode}`);
});

test("renders Active text", () => {
  render(
    <Provider store={store}>
      <ListInfo />
    </Provider>
  );

  const mode = store.getState().colorMode.colorMode;
  const text = screen.getByText(/Active/i);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass(`list-option list-option-unselected-${mode}`);
});

// test("renders Active text", () => {
//   render(
//     <Provider store={store}>
//       <ListInfo />
//     </Provider>
//   );

//   const mode = store.getState().colorMode.colorMode;
//   const text = screen.getByText("Active");
//   expect(text).toHaveClass(`list-option list-option-unselected-${mode}`);
//   userEvent.click(text);
//   const text1 = screen.getByText("Active");
//   expect(text1).toHaveClass("list-option list-option-selected");
// });
