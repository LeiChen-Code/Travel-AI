// 此组件定义行程内容的包装容器 

type SectionWrapperProps = {
  children: React.ReactNode;
  id: string;
};
export default function SectionWrapper({children, id}: SectionWrapperProps) {
  return (
    <article
      id={id}
      className="w-full scroll-mt-10 text-foreground border-b border-gray-1 p-5 bg-background/50 rounded-sm"
    >
      {children}
    </article>
  );
}