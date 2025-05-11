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
            <section className="border-2 border-red-500 flex min-h-screen flex-1 flex-col px-4 sm:px-14">
              <div className="mx-auto flex w-full max-w-5xl flex-col max-sm:px-4">
                <div className="flex h-16 items-center justify-between md:hidden">
                  MoblieNav
                </div>

                <div className="flex flex-col md:pb-14 ">
                  Toaster(notification popups)
                  {children}
                </div>
              </div>
            </section>
        </main>
    </div>
  );
}
