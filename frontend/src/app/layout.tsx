import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import { MUIWrapper } from "../components/MUIWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Escola Sistema",
  description: "Escola Sistema",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  

  const theme = "light";

  return (
    <html lang="pt-BR">
      <body className={inter.className}>

        <ThemeProvider >
          <MUIWrapper>
            {children}
          </MUIWrapper>
        </ThemeProvider>

      </body>
    </html>
  );
}
