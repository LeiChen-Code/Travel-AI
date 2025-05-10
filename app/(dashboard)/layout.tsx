import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col">
        <Header />
        <main className="relative flex bg-white-1">
            <LeftSidebar />
            {children}
        </main>
    </div>
  );
}
