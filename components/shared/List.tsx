// 此组件实现列表展示

export default function List({list}: {list: string[]}) {
  return list && list.length === 0 ? (
    // 列表长度为 0，展示 新增 按钮
    <div className="p-4 flex justify-center items-center">点击 + 号新增表项.</div>
  ) : (
    // 列表非空，展示有序列表项
    <ol className="max-w-[90%] space-y-1 text-gray-500 list-decimal list-inside ">
      {list.map((item) => (
        <li key={item}>
          <span className="font-normal text-gray-900 dark:text-white">{item}</span>
        </li>
      ))}
    </ol>
  );
}