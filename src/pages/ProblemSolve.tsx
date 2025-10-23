import React, { useMemo, useRef, useState } from "react";
import ProblemSolveHeader from "../components/ProblemSolveHeader";
import { Card, Typography, Tag, Button, Tabs } from "antd";
import { useLocation, useParams } from "react-router-dom";

interface ProblemItem {
  id: number;
  title: string;
  difficulty: "简单" | "中等" | "困难";
  acceptance: number;
  submissions: number;
  tags: string[];
}

// 兜底：当没有通过路由 state 传入题目数据时，使用简化的 mock
const fallbackProblems: ProblemItem[] = [
  {
    id: 1,
    title: "两数之和",
    difficulty: "简单",
    acceptance: 52.3,
    submissions: 2800000,
    tags: ["数组", "哈希表"],
  },
  {
    id: 2,
    title: "二叉树的最大深度",
    difficulty: "简单",
    acceptance: 76.4,
    submissions: 1500000,
    tags: ["树", "DFS"],
  },
  {
    id: 3,
    title: "新增数字子序列",
    difficulty: "中等",
    acceptance: 35.2,
    submissions: 1200000,
    tags: ["双指针", "滑动窗口"],
  },
];

const ProblemSolve: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const stateProblem = location.state as ProblemItem | undefined;

  const problem = useMemo(() => {
    if (stateProblem) return stateProblem;
    const pid = Number(id);
    return fallbackProblems.find((p) => p.id === pid);
  }, [stateProblem, id]);

  // 分栏宽度与收起控制
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [leftWidth, setLeftWidth] = useState<number>(480);
  const draggingRef = useRef<boolean>(false);
  const rafPendingRef = useRef<boolean>(false);
  const lastXRef = useRef<number>(0);

  const minLeft = 280; // 左侧最小宽度
  const minRight = 360; // 右侧最小宽度，避免过度压缩

  const startResizePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const onMove = (ev: PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      lastXRef.current = ev.clientX - rect.left; // 相对容器的 X
      if (!rafPendingRef.current) {
        rafPendingRef.current = true;
        requestAnimationFrame(() => {
          const mouseX = lastXRef.current;
          const maxLeft = rect.width - minRight;
          const next = Math.max(minLeft, Math.min(mouseX, maxLeft));
          setLeftWidth(next);
          rafPendingRef.current = false;
        });
      }
    };
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };



  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <ProblemSolveHeader title={problem?.title || `题目 #${id}`} problemId={problem?.id || Number(id)} />
      <div className="pt-12 select-none no-select">
        {/* 顶部区域移除：折叠控制已迁移到左侧标题栏 */}

        {/* 主内容区：可拖拽分栏 */}
        <section className="py-4 bg-[#F9F9F9]">
          <div className="max-w-7xl mx-auto px-2">
            <div
              ref={containerRef}
              className="w-full bg-transparent rounded-xl border border-gray-200 overflow-hidden"
              style={{ height: 560 }}
            >
              <div className="flex h-full relative">
                {/* 左侧题目详情 */}
                <div
                  style={{ width: leftWidth, willChange: "width" }}
                  className={`shrink-0`}
                >
                  <Card className="h-full rounded-none">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 0 }}>
                            {problem ? problem.title : `题目 #${id}`}
                          </Typography.Title>
                          {problem && (
                            <Tag color={problem.difficulty === '简单' ? 'green' : problem.difficulty === '中等' ? 'orange' : 'red'}>
                              {problem.difficulty}
                            </Tag>
                          )}
                        </div>

                      </div>
                      <Tabs
                        defaultActiveKey="desc"
                        items={[
                          {
                            key: 'desc',
                            label: '题目描述',
                            children: (
                              <div className="text-gray-600 leading-relaxed">
                                <p>这里是题目详情内容区域，包括题目描述、输入输出说明、样例以及提示等。后续可与服务端对接，动态渲染题面。</p>
                              </div>
                            ),
                          },
                          {
                            key: 'solution',
                            label: '题解',
                            children: (
                              <div className="text-gray-600 leading-relaxed">
                                <p>这里展示题解与思路，支持 Markdown 渲染与代码高亮（待接入）。</p>
                              </div>
                            ),
                          },
                          {
                            key: 'submissions',
                            label: '提交记录',
                            children: (
                              <div className="text-gray-600 leading-relaxed">
                                <p>这里展示你对该题的提交历史、状态与耗时（待接入）。</p>
                              </div>
                            ),
                          },
                        ]}
                      />
                    </div>

                  </Card>
                </div>

                {/* 拖拽分隔条 */}
                <div
                  onPointerDown={startResizePointer}
                  className="cursor-col-resize bg-gray-200 hover:bg-gray-300 shrink-0"
                  style={{ width: 8 }}
                />

                {/* 右侧编译器占位 */}
                <div className="flex-1">
                  <Card className="h-full rounded-none">
                    <div className="h-full flex items-center justify-center text-gray-600">
                      <div>
                        <Typography.Title
                          level={4}
                          style={{ textAlign: "center" }}
                        >
                          编译器区域（待实现）
                        </Typography.Title>
                        <Typography.Paragraph style={{ textAlign: "center" }}>
                          后续将集成在线代码编辑器与运行评测功能。
                        </Typography.Paragraph>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProblemSolve;
