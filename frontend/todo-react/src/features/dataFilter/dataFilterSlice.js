import { createSlice } from "@reduxjs/toolkit";

const options = {
  name: "dataFilter",
  initialState: {
    filter: "all",
  },
  reducers: {
    changeFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
};

const dataFilterSlice = createSlice(options);

export const selectDataFilter = (state) => {
  return state.dataFilter.filter;
};

export const { changeFilter } = dataFilterSlice.actions;

export default dataFilterSlice.reducer;
