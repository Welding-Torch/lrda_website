// RootLayout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "./lib/components/navbar";
import { NextAppDirEmotionCacheProvider } from "tss-react/next/appDir";
import { Toaster } from "@/components/ui/sonner";
import { GoogleMapsProvider } from "./lib/utils/GoogleMapsContext";

const inter = Inter({ subsets: ["latin"] });

import { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head />
      <body>
     
        <Navbar /> 
        <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
          {children}
        </NextAppDirEmotionCacheProvider>
        <Toaster />
   
      </body>
    </html>
  );
}


export default RootLayout;