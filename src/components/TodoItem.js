import React from "react";
import styles from "@/styles/TodoList.module.css";

function TodoItem({ todo, onToggle, onDelete }) {
  // 할 일이 완료되었는지 여부에 따라 클래스를 동적으로 추가합니다.
  const todoClassName = todo.completed ? styles.completedTodo : "";

  return (
    <div className={`${styles.todoItem} ${todoClassName}`}>
      {/* 체크 박스를 렌더링합니다. */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={onToggle} // 체크 박스의 변경 이벤트를 토글 함수로 연결합니다.
      />
      {/* 할 일 내용과 만료일을 표시합니다. */}
      <span>{todo.text} - 만료일: {todo.dueDate}</span>
      {/* 삭제 버튼을 렌더링합니다. */}
      <button onClick={onDelete} className={styles.deleteButton}>
        삭제
      </button>
    </div>
  );
}

export default TodoItem;
