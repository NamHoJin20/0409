/* 
  할 일 목록을 관리하고 렌더링하는 주요 컴포넌트입니다.
  상태 관리를 위해 `useState` 훅을 사용하여 할 일 목록과 입력값을 관리합니다.
  할 일 목록의 추가, 삭제, 완료 상태 변경 등의 기능을 구현하였습니다.
*/
"use client";

import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import TodoItem from "@/components/TodoItem";
import styles from "@/styles/TodoList.module.css";

// firebase 관련 모듈을 불러옵니다.
import { db } from "@/firebase";
import {
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
} from "firebase/firestore";

// DB의 todos 컬렉션 참조를 만듭니다. 컬렉션 사용시 잘못된 컬렉션 이름 사용을 방지합니다.
const todoCollection = collection(db, "todos");

// TodoList 컴포넌트를 정의합니다.
const TodoList = () => {
  // 상태를 관리하는 useState 훅을 사용하여 할 일 목록과 입력값을 초기화합니다.
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");

  const router = useRouter();
  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });

  useEffect(() => {
    console.log("data", data);
    getTodos();
  }, [data]);

  const getTodos = async () => {
    // Firestore 쿼리를 만듭니다.
    // const q = query(todoCollection);
    // const q = query(collection(db, "todos"), where("user", "==", user.uid));
    // const q = query(todoCollection, orderBy("datetime", "asc"));

    if (!data?.user?.name) return;

    const q = query(todoCollection, where("userName", "==", data?.user?.name));

    // Firestore 에서 할 일 목록을 조회합니다.
    const results = await getDocs(q);
    const newTodos = [];

    // 가져온 할 일 목록을 newTodos 배열에 담습니다.
    results.docs.forEach((doc) => {
      // console.log(doc.data());
      // id 값을 Firestore 에 저장한 값으로 지정하고, 나머지 데이터를 newTodos 배열에 담습니다.
      newTodos.push({ id: doc.id, ...doc.data() });
    });

    setTodos(newTodos);
  };

  // addTodo 함수는 입력값을 이용하여 새로운 할 일을 목록에 추가하는 함수입니다.
  const addTodo = async () => {
    // 입력값이 비어있는 경우 함수를 종료합니다.
    if (input.trim() === "" || dueDate.trim() === "") {
      alert("할 일과 만료일을 입력해주세요.");
      return;
    }
    
    // Firestore에 할 일을 추가합니다.
    const docRef = await addDoc(todoCollection, {
      userName: data?.user?.name, // 사용자의 닉네임을 해당 할 일의 데이터에 저장합니다.
      text: input,
      dueDate: dueDate,
      completed: false,
    });

    // 새로 추가한 할 일을 정의합니다.
    const newTodo = {
      id: docRef.id, // Firestore에서 할 일의 id를 가져와 설정합니다.
      userName: data?.user?.name, // 사용자의 닉네임을 할 일 데이터에 저장합니다.
      text: input,
      dueDate: dueDate,
      completed: false,
    };

    // 정렬된 할 일 목록을 만듭니다.
    const sortedTodos = [...todos, newTodo].sort((a, b) => {
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    // 정렬된 할 일 목록을 상태로 설정합니다.
    setTodos(sortedTodos);

    // 입력값 초기화
    setInput("");
    setDueDate("");
  };
  
  

  // toggleTodo 함수는 체크박스를 눌러 할 일의 완료 상태를 변경하는 함수입니다.
const toggleTodo = async (id) => {
  // 해당 id를 가진 할 일을 찾습니다.
  const todo = todos.find((todo) => todo.id === id);

  // 현재 로그인한 사용자의 닉네임과 할 일의 소유자 닉네임을 비교하여 같은 경우에만 수정합니다.
  if (data?.user?.name === todo.userName) {
    // 할 일 목록에서 해당 id를 가진 할 일의 완료 상태를 반전시킵니다.
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );

    // Firestore 에서 해당 id를 가진 할 일을 찾아 완료 상태를 업데이트합니다.
    const todoDoc = doc(todoCollection, id);
    await updateDoc(todoDoc, { completed: !todo.completed });
  } else {
    console.log("Permission denied: You can only modify your own todos.");
  }
};

// deleteTodo 함수는 할 일을 목록에서 삭제하는 함수입니다.
const deleteTodo = async (id) => {
  // 해당 id를 가진 할 일을 찾습니다.
  const todo = todos.find((todo) => todo.id === id);

  // 현재 로그인한 사용자의 닉네임과 할 일의 소유자 닉네임을 비교하여 같은 경우에만 삭제합니다.
  if (data?.user?.name === todo.userName) {
    // Firestore 에서 해당 id를 가진 할 일을 삭제합니다.
    const todoDoc = doc(todoCollection, id);
    await deleteDoc(todoDoc);

    // 해당 id를 가진 할 일을 제외한 나머지 목록을 새로운 상태로 저장합니다.
    setTodos(todos.filter((todo) => todo.id !== id));
  } else {
    console.log("Permission denied: You can only delete your own todos.");
  }
};

  // 컴포넌트를 렌더링합니다.
  return (
    <div className={styles.container}>
      <h1 className="text-xl mb-4 font-bold underline underline-offset-4 decoration-wavy">
        {data?.user?.name}'s Todo List
      </h1>
      {/* 할 일을 입력받는 텍스트 필드입니다. */}
      <input
        type="text"
        // className={styles.itemInput}
        className="w-full p-1 mb-4 border border-gray-300 rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className={styles.dateInput}
      />
      <button onClick={addTodo} className={styles.addButton}>
        추가
      </button>
      
      {/* 할 일 목록을 렌더링합니다. */}
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;