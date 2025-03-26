import { useDispatch, useSelector } from "react-redux";
import { selectColorMode } from "./features/colorMode/colorModeSlice";
import { addListItem, addTodo } from "./features/listItems/listItemsSlice";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function InputBar() {
  const dispatch = useDispatch();
  let mode = useSelector(selectColorMode);

  const handleEnterPress = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      let text = (event.target as HTMLInputElement).value;
      if (text === "") return;
      const newEntry = {
        text: text,
        completed: false,
      };

      const res = await addTodo(newEntry);
      console.log(res);
      dispatch(addListItem(res));
      (document.getElementById("input") as HTMLInputElement).value = "";
    }
  };

  return (
    <div
      id="input-component"
      className={`input-component-${mode}`}
      tabIndex={-1}
    >
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
      <div id="outer-circle">
        <div id="circle" className={`circle-${mode}`}></div>
      </div>
      <input
        id="input"
        className={`input-${mode}`}
        type="text"
        placeholder="Create a new todo..."
        onKeyDown={(e) => handleEnterPress(e)}
      />
    </div>
  );
}

export default InputBar;
