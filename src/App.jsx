import Head from "./Head";
import Content from "./Content";

function App() {
  return (
    <div className="h-screen w-screen bg-zinc-900 text-slate-200 flex flex-col">
      <Head />
      <Content />
    </div>
  );
}

export default App;
