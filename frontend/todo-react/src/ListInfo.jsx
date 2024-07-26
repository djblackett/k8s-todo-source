import React from "react";
import { PropTypes } from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { selectColorMode } from "./features/colorMode/colorModeSlice";
import {
  selectListItems,
  clearCompletedItems,
} from "./features/listItems/listItemsSlice";
import {
  changeFilter,
  // selectDataFilter,
} from "./features/dataFilter/dataFilterSlice";

function ListInfo(props) {
  const mode = useSelector(selectColorMode);
  // const dataFilter = useSelector(selectDataFilter);
  const listItems = useSelector(selectListItems);
  const dispatch = useDispatch();

  const flashRed = (e) => {
    let element = e.target;
    let currentColor = element.style.color;
    element.style.color = "red";
    setTimeout(() => {
      element.style.color = currentColor;
    }, 200);
  };

  function handleChangeFilter(e) {
    let filter = e.target.innerText.toLowerCase();
    dispatch(changeFilter({ filter: filter }));
    props.listChange(e);
  }

  const clickFunctions = (e) => {
    flashRed(e);
    dispatch(clearCompletedItems());
  };

  const handleItemsLeft = () => {
    if (listItems) {
      return listItems.filter((item) => !item.completed).length;
    }
  };

  return (
    <div
      id="list-info"
      className={`list-info-${mode}`}
      data-testid="list-info-component-test"
    >
      <p>{handleItemsLeft()} items left</p>
      <div id="completion-status">
        <button
          tabIndex={0}
          id="list-all"
          className="list-option list-option-selected"
          onClick={handleChangeFilter}
        >
          All
        </button>
        <button
          tabIndex={0}
          id="list-active"
          className={`list-option list-option-unselected-${mode}`}
          onClick={handleChangeFilter}
        >
          Active
        </button>
        <button
          tabIndex={0}
          id="list-completed"
          className={`list-option list-option-unselected-${mode}`}
          onClick={handleChangeFilter}
        >
          Completed
        </button>
      </div>
      <button
        tabIndex={0}
        id="clear-button"
        className={`clear-button-${mode}`}
        onClick={clickFunctions}
      >
        Clear Completed
      </button>
    </div>
  );
}

ListInfo.propTypes = {
  listChange: PropTypes.func,
};

export default ListInfo;
