import { configureStore } from "@reduxjs/toolkit";
import dataFilterReducer from "../dataFilter/dataFilterSlice";
import colorModeReducer from "../colorMode/colorModeSlice";

export default configureStore({
  reducer: {
    dataFilter: dataFilterReducer,
    colorMode: colorModeReducer,
  },
});
