// app/layout.js

import "./globals.css";
import Providers from "@/components/Providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
    
        <title>GitGPT</title>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className={`antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
