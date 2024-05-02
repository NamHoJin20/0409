import React from "react";
import styles from "@/styles/TodoList.module.css";

function TodoItem({ todo, onDelete }) {
  return (
    <div>
      <span>
        {todo.text} - 만료일: {todo.dueDate}
      </span>
      <button onClick={() => onDelete(todo.id)} className={styles.deleteButton}>
        삭제
      </button>
    </div>
  );
}

export default TodoItem;
