import { useState, useEffect } from "react";
import ListInfo from "./ListInfo";
import { MemoizedListItem } from "./ListItem";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import { selectDataFilter } from "./features/dataFilter/dataFilterSlice";
import { fetchTodos } from "./features/listItems/listUtils";
import { selectColorMode } from "./features/colorMode/colorModeSlice";
import { useQuery } from "@tanstack/react-query";
import { Todo } from "./types/types";

function TodoList() {
  const mode = useSelector(selectColorMode);

  // const dispatch = useDispatch();
  const dataFilterStore = useSelector(selectDataFilter);
  const [filteredData, setFilteredData] = useState<Todo[]>([]);
  const [dataFilter, setDataFilter] = useState(dataFilterStore);

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const handleOnDragEnd = (result: DropResult) => {
    // If there's no destination (dropped outside the list), do nothing
    if (!result.destination) return;

    const items = Array.from(filteredData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    // dispatch(reorderItems(items));
    setFilteredData(() => {
      return items;
    });
  };

  // useEffect to run once the component mounts
  useEffect(() => {
    localStorage.setItem("mode", JSON.stringify({ colorMode: mode }));
  }, [mode]);

  useEffect(() => {
    // Every time the list or filter changes, the list gets refiltered to match the new filter/list
    if (dataFilter === "all") {
      setFilteredData(() => {
        return data;
      });
    } else if (dataFilter === "active") {
      setFilteredData(() => {
        return data.filter(
          (entry: { completed: boolean }) => entry.completed === false,
        );
      });
    } else if (dataFilter === "completed") {
      setFilteredData(() => {
        return data.filter(
          (entry: { completed: boolean }) => entry.completed === true,
        );
      });
    } else {
      return;
    }
  }, [data, dataFilter]);

  const handleListChange = (e: { target: any }) => {
    // Handles the style changes based on the selection in the info pane
    // Can likely be refactored to embed the dataFilter directly into the ListInfo's JSX elements

    let element = e.target;
    let all = document.getElementById("list-all");
    let active = document.getElementById("list-active");
    let completed = document.getElementById("list-completed");

    if (element === all) {
      element.setAttribute("class", "list-option list-option-selected");
      active?.setAttribute(
        "class",
        `list-option list-option-unselected-${mode}`,
      );
      completed?.setAttribute(
        "class",
        `list-option list-option-unselected-${mode}`,
      );
      setDataFilter(() => {
        return "all";
      });
    } else if (element === active) {
      element.setAttribute("class", "list-option list-option-selected");
      all?.setAttribute("class", `list-option list-option-unselected-${mode}`);
      completed?.setAttribute(
        "class",
        `list-option list-option-unselected-${mode}`,
      );
      setDataFilter(() => {
        return "active";
      });
    } else if (element === completed) {
      element.setAttribute("class", "list-option list-option-selected");
      active?.setAttribute(
        "class",
        `list-option list-option-unselected-${mode}`,
      );
      all?.setAttribute("class", `list-option list-option-unselected-${mode}`);
      setDataFilter(() => {
        return "completed";
      });
    }
  };

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div id="todo-list-container" className={`todo-list-container-${mode}`}>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="characters">
          {(provided) => (
            <ul
              className="characters"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {filteredData &&
                filteredData.map((item: Todo, i: number) => {
                  return (
                    <Draggable
                      key={item.id}
                      index={i}
                      draggableId={String(item.id)}
                    >
                      {(provided) => (
                        <li
                          key={"li-" + item.id}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          id="inner-list-container"
                        >
                          <MemoizedListItem
                            key={"list-item-" + item.id}
                            item={item}
                          />
                        </li>
                      )}
                    </Draggable>
                  );
                })}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <ListInfo listChange={handleListChange} listItems={data} />
    </div>
  );
}

export default TodoList;
