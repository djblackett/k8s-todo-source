import { configureStore } from "@reduxjs/toolkit";
import dataFilterReducer from "../dataFilter/dataFilterSlice";
import listItemsReducer from "../listItems/listItemsSlice";
import colorModeReducer from "../colorMode/colorModeSlice";

export default configureStore({
  reducer: {
    dataFilter: dataFilterReducer,
    listItems: listItemsReducer,
    colorMode: colorModeReducer,
  },
});
