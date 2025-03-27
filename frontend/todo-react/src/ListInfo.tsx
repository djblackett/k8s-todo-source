import { useSelector, useDispatch } from "react-redux";
import { selectColorMode } from "./features/colorMode/colorModeSlice";
import { deleteCompletedTodos } from "./features/listItems/listUtils";
import { changeFilter } from "./features/dataFilter/dataFilterSlice";
import { Todo } from "./types/types";
import { SyntheticEvent, useMemo } from "react";
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
    e.preventDefault();
    e.stopPropagation();
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

  const itemsLeft = useMemo(() => handleItemsLeft(), [listItems]);

  return (
    <div
      id="list-info"
      className={`list-info-${mode}`}
      data-testid="list-info-component-test"
    >
      <p className="items-left-text" data-testid="items-left-test">
        {itemsLeft} item{itemsLeft !== 1 && "s"} left
      </p>
      <div id="completion-status">
        <button
          tabIndex={0}
          id="list-all"
          className="list-option list-option-selected"
          onClick={handleChangeFilter}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleChangeFilter(e);
            }
          }}
        >
          All
        </button>
        <button
          tabIndex={0}
          id="list-active"
          className={`list-option list-option-unselected-${mode}`}
          onClick={handleChangeFilter}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleChangeFilter(e);
            }
          }}
        >
          Active
        </button>
        <button
          tabIndex={0}
          id="list-completed"
          className={`list-option list-option-unselected-${mode}`}
          onClick={handleChangeFilter}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleChangeFilter(e);
            }
          }}
        >
          Completed
        </button>
      </div>
      <button
        tabIndex={0}
        id="clear-button"
        className={`clear-button-${mode}`}
        onClick={clickFunctions}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            clickFunctions(e);
          }
        }}
      >
        Clear Completed
      </button>
    </div>
  );
}

export default ListInfo;
