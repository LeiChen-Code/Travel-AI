import Header from "@/components/Header";
import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative h-screen w-full ">
        {children}
    </main>
  );
}
