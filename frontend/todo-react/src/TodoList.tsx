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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Todo } from "./types/types";

function TodoList() {
  const mode = useSelector(selectColorMode);

  // const dispatch = useDispatch();
  const dataFilterStore = useSelector(selectDataFilter);
  // const [filteredData, setFilteredData] = useState<Todo[]>([]);
  const [dataFilter, setDataFilter] = useState(dataFilterStore);

  const { isPending, isError, data, error } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const queryClient = useQueryClient();

  const saveTodoOrder = async (
  updatedOrder: { id: string; orderIndex: number }[],
) => {
  const response = await fetch("/todos/order", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedOrder),
  });
  if (!response.ok) {
    throw new Error("Failed to update order");
  }
  return response.json(); // <-- now works perfectly!
};


  const reorderTodosMutation = useMutation({
    mutationFn: saveTodoOrder,
    onError: (error, updatedOrder, context) => {
      // Roll back to the previous state if the mutation fails
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const filteredData =
    dataFilter === "all"
      ? data
      : data?.filter((todo: Todo) =>
          dataFilter === "active" ? !todo.completed : todo.completed,
        );

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination || !filteredData) return;

    const items = Array.from(filteredData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedOrder = items.map((todo, index) => ({
      id: todo.id,
      orderIndex: index,
    }));

    queryClient.setQueryData<Todo[]>(["todos"], (oldTodos) =>
      oldTodos
        ?.map((todo) => {
          const updated = updatedOrder.find((n) => n.id === todo.id);
          return updated ? { ...todo, orderIndex: updated.orderIndex } : todo;
        })
        .sort((a, b) => a.orderIndex - b.orderIndex),
    );

    reorderTodosMutation.mutate(updatedOrder);
  };

  // useEffect to run once the component mounts
  useEffect(() => {
    localStorage.setItem("mode", JSON.stringify({ colorMode: mode }));
  }, [mode]);

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
                          tabIndex={-1}
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
