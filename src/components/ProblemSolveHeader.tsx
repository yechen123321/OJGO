import React from "react";
import { Button, Tooltip } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Play,
  Upload,
  Settings,
  Grid2x2,
  Wand2,
} from "lucide-react";

interface Props {
  title?: string;
  problemId?: number;
}

const ProblemSolveHeader: React.FC<Props> = ({ title, problemId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 解析当前题目 ID（优先使用 props，其次从路径中解析）
  const match = location.pathname.match(/\/problems\/(\d+)/);
  const currentId = problemId ?? (match ? Number(match[1]) : undefined);

  const gotoBank = () => navigate("/problems");
  const gotoPrev = () => {
    if (currentId && currentId > 1) navigate(`/problems/${currentId - 1}`);
    else navigate("/problems");
  };
  const gotoNext = () => {
    if (currentId) navigate(`/problems/${currentId + 1}`);
    else navigate("/problems/1");
  };
  const gotoRandom = () => {
    const maxId = 12; // 与题库示例保持一致
    const rid = Math.floor(Math.random() * maxId) + 1;
    navigate(`/problems/${rid}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-[#F9F9F9]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-14">
        {/* Left: back + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center hover:cursor-pointer"
            aria-label="返回"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          {/* 题库按钮 */}
          <button
            onClick={gotoBank}
            className="px-2 h-8 rounded hover:bg-gray-100 text-gray-800 text-[15px] hover:cursor-pointer"
            aria-label="题库"
          >
            题库
          </button>
          {/* 左右切换按钮 */}
          <div className="flex items-center ml-2">
            <button
              onClick={gotoPrev}
              className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center hover:cursor-pointer"
              aria-label="上一题"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={gotoNext}
              className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center hover:cursor-pointer ml-1"
              aria-label="下一题"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </div>
          {/* 随机按钮 */}
          <button
            onClick={gotoRandom}
            className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center hover:cursor-pointer ml-3"
            aria-label="随机跳转"
          >
            <Shuffle className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Center: actions */}
        <div className="flex items-center gap-2">
          <Tooltip title="运行">
            <Button
              size="small"
              className="hover:cursor-pointer"
              icon={<Play className="w-4 h-4" />}
            >
              运行
            </Button>
          </Tooltip>
          <Tooltip title="提交评测">
            <Button
              size="small"
              type="primary"
              className="hover:cursor-pointer bg-green-500 !border-green-500 hover:bg-green-600"
            >
              <Upload className="w-4 h-4 mr-1" />
              提交
            </Button>
          </Tooltip>
          <Tooltip title="笔记">
            <Button
              size="small"
              className="hover:cursor-pointer"
              icon={<Wand2 className="w-4 h-4 text-purple-600" />}
            />
          </Tooltip>
        </div>

        {/* Right: tools */}
        <div className="flex items-center gap-2">
          <Tooltip title="布局">
            <button className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center hover:cursor-pointer">
              <Grid2x2 className="w-4 h-4 text-gray-700" />
            </button>
          </Tooltip>
          <Tooltip title="设置">
            <button className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center hover:cursor-pointer">
              <Settings className="w-4 h-4 text-gray-700" />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

export default ProblemSolveHeader;
