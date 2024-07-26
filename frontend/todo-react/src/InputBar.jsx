import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectColorMode } from "./features/colorMode/colorModeSlice";
import {addListItem, addTodo} from "./features/listItems/listItemsSlice";
import {ToastContainer, toast, Bounce} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function InputBar() {
  const dispatch = useDispatch();
  let mode = useSelector(selectColorMode);

  const handleClick = async () => {
    const input = document.getElementById("input");
    console.log(input)
    let text = input.value
    if (text === "") return;
    if (text.length > 140) {
      console.log("Error: Text must be 140 characters or less")
      toast.error('Text must be 140 characters or less!', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });




      return;
    }
    const newEntry = {
      text: text,
      completed: false,
    };

    const res = await addTodo(newEntry)
    console.log(res)
    dispatch(addListItem(res));
    document.getElementById("input").value = "";
  }

  const handleEnterPress = async (event) => {
    if (event.key === "Enter") {
      let text = event.target.value;
      if (text === "") return;
      const newEntry = {
        text: text,
        completed: false,
      };

      const res = await addTodo(newEntry)
      console.log(res)
      dispatch(addListItem(res));
      document.getElementById("input").value = "";
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
        <button id="send-button" className={`send-${mode}`} onClick={() => handleClick()}>Send</button>
      </div>
  );
}

export default InputBar;
