import { useSelector, useDispatch } from "react-redux";
import { selectColorMode } from "./features/colorMode/colorModeSlice";
import { deleteCompletedTodos } from "./features/listItems/listItemsSlice";
import { changeFilter } from "./features/dataFilter/dataFilterSlice";
import { Todo } from "./types/types";
import { SyntheticEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ListInfoProps {
  listChange: (e: any) => void;
  listItems: Todo[];
}

function ListInfo({ listChange, listItems }: ListInfoProps) {
  const mode = useSelector(selectColorMode);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const deleteCompletedItems = useMutation({
    mutationFn: deleteCompletedTodos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const flashRed = (e: SyntheticEvent) => {
    let element = e.target as HTMLElement;
    let currentColor = element.style.color;
    element.style.color = "red";
    setTimeout(() => {
      element.style.color = currentColor;
    }, 200);
  };

  function handleChangeFilter(e: any) {
    let filter = e.target.innerText.toLowerCase();
    if (filter) {
      dispatch(changeFilter(filter));
    }
    listChange(e);
  }

  const clickFunctions = (e: any) => {
    flashRed(e);
    deleteCompletedItems.mutate();
  };

  const handleItemsLeft = () => {
    if (listItems) {
      return listItems.filter((item: Todo) => !item.completed).length;
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

export default ListInfo;
