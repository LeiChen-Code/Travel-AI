import LeftSidebar from "@/components/LeftSidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <main>
            <p className="text-black-2">Header</p>
            <LeftSidebar />
            {children}
        </main>
    </div>
  );
}
