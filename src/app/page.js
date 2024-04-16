import TodoList from "@/components/TodoList";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Todo List</h1>
      <h1 className="text-3xl font-bold mb-4">Hello world!</h1>
      <h2 className="text-3xl font-bold mb-4">My name is hojin</h2>
      <TodoList />
    </div>
  );
}

