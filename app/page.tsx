import Image from "next/image";
import SearchBar from './lib/components/searchBar';
import AddNotePage from "./lib/pages/AddNotePage";
import Sidebar from "./lib/components/Sidebar";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="">
        <Sidebar />
        <h1 className="text-blue-500 text-xl mb-4">Where's Religion?</h1>
        <SearchBar />
        <h1 className="text-blue-500 text-xl">Where's Religion?</h1>
        <AddNotePage />
      </div>
    </main>
  );
}