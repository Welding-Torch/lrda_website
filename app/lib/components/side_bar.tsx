// components/Sidebar.tsx

import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 bottom-0 w-64 bg-gray-200 p-4 overflow-y-auto">
      <div className="mt-2 p-2 text-white bg-blue-500 hover:bg-blue-600 rounded">
        <Link href="/add-note">
          Add Note
        </Link>
      </div>
      {/* Add more buttons or content here */}
    </div>
  );
};

export default Sidebar;

