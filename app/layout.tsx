import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Add your metadata here */}
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
      {/* Add a link to a Font Awesome CSS for an icon */}
      <style>
        {`
          /* Custom styles for the search bar */
          .search-bar {
            display: flex;
            align-items: center;
            background-color: #f4f4f4;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 5px;
          }

          .search-bar input[type="text"] {
            flex: 1;
            border: none;
            padding: 10px;
            font-size: 16px;
            transition: border-color 0.3s, background-color 0.3s;
          }

          .search-bar input[type="text"]:focus {
            outline: none;
            border-color: #007bff; /* Highlight when in focus */
            background-color: #fff; /* Change background color */
          }

          .search-bar button {
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 10px 15px;
            cursor: pointer;
            display: flex; /* Make button a flex container */
            align-items: center; /* Center items vertically */
            transition: background-color 0.3s; /* Add hover effect */
          }

          .search-bar button:hover {
            background-color: #0056b3; /* Darker blue on hover */
          }

          /* Style for Font Awesome search icon */
          .search-bar i {
            margin-right: 5px;
          }
        `}
      </style>
      <body className={inter.className}>
        <header>
          {/* Enhanced search bar */}
          <div className="search-bar">
            <input type="text" placeholder="What are you looking for?" />
            <button>
              <i className="fas fa-search"></i> {/* Magnifying glass icon */}
            </button>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </>
  );
}





