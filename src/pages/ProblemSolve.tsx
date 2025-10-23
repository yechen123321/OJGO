// cSpell:ignore nums
import React, { useMemo, useRef, useState } from "react";
import ProblemSolveHeader from "../components/ProblemSolveHeader";
import { Card, Tabs } from "antd";
import { useLocation, useParams } from "react-router-dom";
import ProblemDescription from "../components/ProblemDescription";
import EditorPanel from "../components/EditorPanel";

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
  const [leftWidth, setLeftWidth] = useState<number>(560);
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
    } catch (_err) {
      void _err;
      /* noop: pointer capture may not be supported */
    }
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
      } catch (_err) {
         void _err;
         /* noop: pointer capture may not be supported */
       }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <ProblemSolveHeader
        title={problem?.title || `题目 #${id}`}
        problemId={problem?.id || Number(id)}
      />
      <div className="pt-14 md:pt-16 select-none no-select flex-1 min-h-0">
        {/* 主内容区：可拖拽分栏 */}
        <section className="py-2 sm:py-3 bg-[#F9F9F9] h-full">
          <div className="mx-auto max-w-[1600px] xl:max-w-[1800px] px-2 sm:px-4 md:px-6 h-full">
             <div
               ref={containerRef}
               className="w-full h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] bg-transparent rounded-xl border border-gray-200 overflow-hidden"
             >
              <div className="flex h-full relative">
                {/* 左侧题目详情 */}
                <div
                  style={{ width: leftWidth, willChange: "width" }}
                  className={`shrink-0`}
                >
                  <Card className="h-full overflow-y-auto rounded-none" styles={{ body: { padding: 8 } }}>
                    <div className="flex flex-col gap-3 h-full">
                      {/* 左侧头部可选区域省略 */}
                      <Tabs
                        defaultActiveKey="desc"
                        size="small"
                        tabBarStyle={{ marginBottom: 8 }}
                        items={[
                           {
                             key: "desc",
                             label: "题目描述",
                             children: (
                               <ProblemDescription
                                 title={problem ? problem.title : `题目 #${id}`}
                                 meta={{
                                   difficulty: problem?.difficulty,
                                   acceptance: problem?.acceptance,
                                   submissions: problem?.submissions,
                                   tags: problem?.tags,
                                 }}
                                 markdown={`给定一个整数数组 \`nums\` 和一个整数目标值 \`target\`，请你在该数组中找出和为目标值 \`target\` 的那两个整数，并返回它们的数组下标。\n\n你可以假设每种输入只会对应一个答案，且你不能使用两次相同的元素。\n\n你可以按任意顺序返回答案。\n\n## 示例\n**示例 1**\n\`\`\`text\n输入: nums = [2,7,11,15], target = 9\n\n输出: [0,1]\n\`\`\`\n\n**示例 2**\n\`\`\`text\n输入: nums = [3,2,4], target = 6\n\n输出: [1,2]\n\`\`\`\n\n**示例 3**\n\`\`\`text\n输入: nums = [3,3], target = 6\n\n输出: [0,1]\n\`\`\`\n\n## 提示\n- 2 ≤ \`nums.length\` ≤ 10^4\n- -10^9 ≤ \`nums[i]\` ≤ 10^9\n- -10^9 ≤ \`target\` ≤ 10^9\n- 只会存在一个有效答案\n\n## 进阶\n你可以想出一个时间复杂度小于 \`O(n^2)\` 的算法吗？`}
                               />
                             ),
                           },
                           {
                             key: "solution",
                             label: "题解",
                             children: (
                               <div className="text-gray-600 leading-relaxed select-text">
                                 <p>
                                   这里展示题解与思路，支持 Markdown
                                   渲染与代码高亮（待接入）。
                                 </p>
                               </div>
                             ),
                           },
                           {
                             key: "submissions",
                             label: "提交记录",
                             children: (
                               <div className="text-gray-600 leading-relaxed select-text">
                                 <p>
                                   这里展示你对该题的提交历史、状态与耗时（待接入）。
                                 </p>
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

                {/* 右侧编译器区域 */}
                <div className="flex-1">
                  <Card
                    className="h-full rounded-none"
                    styles={{ body: { height: "100%", padding: 0 } }}
                  >
                    <div className="h-full">
                      <EditorPanel />
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