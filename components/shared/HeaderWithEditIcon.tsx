import {Button} from "@/components/ui/button";
import {PencilIcon, PlusIcon} from "lucide-react";
import {ReactNode} from "react";

// 此组件实现带图标、标题和可编辑按钮的 header

type Props = {
  icon: ReactNode;  // 传入 icon
  shouldShowEditIcon: boolean;  // 是否显示编辑按钮
  handleToggleEditMode: () => void;  // 点击编辑时触发的回调函数
  title: string;  // 标题
  hasData: boolean;  // 显示添加按钮还是铅笔按钮，无数据显示添加，有数据显示铅笔
  isLoading?: boolean;  // 是否处于加载状态，加载时不显示编辑按钮
};

const HeaderWithEditIcon = ({
  icon,
  shouldShowEditIcon,
  handleToggleEditMode,
  title,
  hasData,
  isLoading = false,
}: Props) => {
  return (
    // justify-between 表示让 标题 和 编辑按钮分局两侧
    <div className="mb-2 flex justify-between items-center">
      {/* 标题 */}
      <h2
        className="text-lg font-medium
                tracking-wide flex items-center"
      >
        {icon} {title}
      </h2>

      {/* 编辑按钮 */}
      {shouldShowEditIcon && !isLoading && (
        <Button
          variant="ghost"
          size="icon"
          className="rounded-[8px] h-8 w-8"
          onClick={handleToggleEditMode}
        >
          {!hasData ? <PlusIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};

export default HeaderWithEditIcon;