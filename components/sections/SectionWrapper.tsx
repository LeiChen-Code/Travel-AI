type SectionWrapperProps = {
  children: React.ReactNode;
  id: string;
};
export default function SectionWrapper({children, id}: SectionWrapperProps) {
  return (
    <article
      id={id}
      className="w-full scroll-mt-20 text-foreground border-b border-gray-1 p-5 bg-background/50 rounded-sm"
    >
      {children}
    </article>
  );
}