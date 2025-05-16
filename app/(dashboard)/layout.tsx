import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col">
        <Header />
        {/* 页面内容 */}
        <main className="relative flex bg-white-1">
            <LeftSidebar />
            <section className="border-2 border-red-500 flex w-full min-h-screen flex-col ">
              {/* <div className="flex w-full max-w-6xl flex-col max-sm:px-4"> */}
                {/* <div className="flex h-16 items-center justify-between md:hidden">
                  MoblieNav
                </div> */}

                <div className="flex flex-col ">
                  <Toaster/>
                  {children}
                </div>
              {/* </div> */}
            </section>
        </main>
    </div>
  );
}
