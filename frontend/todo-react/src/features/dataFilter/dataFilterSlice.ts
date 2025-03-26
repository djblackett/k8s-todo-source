import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define filter values as a type
type FilterValue = "all" | "active" | "completed"; // Add other values as needed

// Interface for the data filter state
interface DataFilterState {
  filter: FilterValue;
}

const options = {
  name: "dataFilter",
  initialState: {
    filter: "all",
  } as DataFilterState,
  reducers: {
    changeFilter: (
      state: DataFilterState,
      action: PayloadAction<FilterValue>,
    ) => {
      state.filter = action.payload;
    },
  },
};

const dataFilterSlice = createSlice(options);

export const selectDataFilter = (state: { dataFilter: DataFilterState }) => {
  return state.dataFilter.filter as FilterValue;
};

export const { changeFilter } = dataFilterSlice.actions;

export default dataFilterSlice.reducer;
