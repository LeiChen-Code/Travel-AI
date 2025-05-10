export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
        <p className="text-black-2">Header</p>
        {children}
    </main>
  );
}
