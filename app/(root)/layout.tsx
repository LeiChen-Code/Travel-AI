import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <main>
            <Header />
            {children}
        </main>
    </div>
  );
}
