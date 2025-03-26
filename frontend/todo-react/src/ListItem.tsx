import React from "react";
// @ts-ignore-next-line
import Check from "./svg/icon-check.svg?react";
import { useSelector } from "react-redux";
import { selectColorMode } from "./features/colorMode/colorModeSlice";
import { completeTodo, deleteTodo } from "./features/listItems/listUtils";
import { Todo } from "./types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const crossIconD =
  "M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z";

function ListItem({ item }: { item: Todo }) {
  const mode = useSelector(selectColorMode);
  let completed = item.completed;
  let completeStatus = completed ? "complete" : "active";
  let circleVisible = completed ? "hidden" : "active";
  let checkVisible = completed ? "visible" : "hidden";

  const queryClient = useQueryClient();

  const completeTodoMutation = useMutation({
    mutationFn: completeTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <div id="list-item" className={`list-item-${mode}-${completeStatus}`}>
      <div
        tabIndex={0}
        id="outer-circle"
        onClick={() => completeTodoMutation.mutate(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            completeTodoMutation.mutate(item);
          }
        }}
      >
        <div
          tabIndex={-1}
          id="circle"
          className={`circle-${mode} circle-${circleVisible}`}
        >
          <Check id="check" className={`check-${checkVisible}`} />
        </div>
      </div>
      <p tabIndex={-1} id="list-item-text" className="dark">
        {item.text}
      </p>
      <svg
        tabIndex={0}
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        id="crossIcon"
        onClick={() => deleteTodoMutation.mutate(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            deleteTodoMutation.mutate(item);
          }
        }}
      >
        <path fill="#494C6B" fillRule="evenodd" d={crossIconD} />
      </svg>
    </div>
  );
}

export const MemoizedListItem = React.memo(ListItem);

export default ListItem;
