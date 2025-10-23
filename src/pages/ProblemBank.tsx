import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FilterBar from "../components/problems/FilterBar";
import { Table, Tag, Space, Button, Empty, Card, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface ProblemItem {
  id: number;
  title: string;
  difficulty: "简单" | "中等" | "困难";
  acceptance: number; // 0 - 100
  submissions: number; // raw number
  tags: string[];
}

const allTags = [
  "数组",
  "哈希表",
  "链表",
  "字符串",
  "排序",
  "双指针",
  "树",
  "DFS",
  "滑动窗口",
];

const mockProblems: ProblemItem[] = [
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
  {
    id: 4,
    title: "合并两个有序链表",
    difficulty: "困难",
    acceptance: 48.7,
    submissions: 664000,
    tags: ["链表", "递归"],
  },
  {
    id: 5,
    title: "有效的括号",
    difficulty: "简单",
    acceptance: 44.3,
    submissions: 2100000,
    tags: ["栈", "字符串"],
  },
  {
    id: 6,
    title: "三数之和",
    difficulty: "中等",
    acceptance: 31.7,
    submissions: 1800000,
    tags: ["排序", "双指针"],
  },
  {
    id: 7,
    title: "二分查找",
    difficulty: "简单",
    acceptance: 71.2,
    submissions: 980000,
    tags: ["数组", "排序"],
  },
  {
    id: 8,
    title: "最长回文子串",
    difficulty: "困难",
    acceptance: 28.4,
    submissions: 820000,
    tags: ["字符串"],
  },
  {
    id: 9,
    title: "岛屿数量",
    difficulty: "中等",
    acceptance: 56.1,
    submissions: 1430000,
    tags: ["DFS"],
  },
  {
    id: 10,
    title: "环形链表",
    difficulty: "简单",
    acceptance: 64.8,
    submissions: 600000,
    tags: ["链表"],
  },
  {
    id: 11,
    title: "最小覆盖子串",
    difficulty: "困难",
    acceptance: 32.5,
    submissions: 430000,
    tags: ["滑动窗口", "字符串"],
  },
  {
    id: 12,
    title: "颜色分类",
    difficulty: "中等",
    acceptance: 58.6,
    submissions: 770000,
    tags: ["排序"],
  },
];

const pageSize = 8;

const ProblemBank: React.FC = () => {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<
    "全部" | ProblemItem["difficulty"]
  >("全部");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"全部" | "未做" | "已做" | "收藏">(
    "全部"
  );
  const [sortBy, setSortBy] = useState<"默认" | "通过率" | "提交数" | "难度">(
    "默认"
  );
  const [page, setPage] = useState(1);

  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [solved, setSolved] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fav = localStorage.getItem("cj_favorites");
    const sol = localStorage.getItem("cj_solved");
    if (fav) setFavorites(JSON.parse(fav));
    if (sol) setSolved(JSON.parse(sol));
  }, []);

  useEffect(() => {
    localStorage.setItem("cj_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("cj_solved", JSON.stringify(solved));
  }, [solved]);

  const filtered = useMemo(() => {
    let list = mockProblems.filter((p) => {
      if (difficulty !== "全部" && p.difficulty !== difficulty) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (selectedTags.length && !selectedTags.every((t) => p.tags.includes(t)))
        return false;
      if (status === "收藏" && !favorites[p.id]) return false;
      if (status === "已做" && !solved[p.id]) return false;
      if (status === "未做" && solved[p.id]) return false;
      return true;
    });

    switch (sortBy) {
      case "通过率":
        list.sort((a, b) => b.acceptance - a.acceptance);
        break;
      case "提交数":
        list.sort((a, b) => b.submissions - a.submissions);
        break;
      case "难度":
        const weight = { 困难: 3, 中等: 2, 简单: 1 } as const;
        list.sort((a, b) => weight[b.difficulty] - weight[a.difficulty]);
        break;
      default:
        list.sort((a, b) => a.id - b.id);
    }
    return list;
  }, [difficulty, search, selectedTags, status, sortBy, favorites, solved]);

  useEffect(() => {
    // 改变筛选或排序时重置页码
    setPage(1);
  }, [difficulty, search, selectedTags, status, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 已去除“标记完成”交互，保留 solved 状态的展示与筛选
  // const toggleSolved = (id: number) => {
  //   setSolved((prev) => ({ ...prev, [id]: !prev[id] }));
  // };

  const formatSubmissions = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${n}`;
  };

  const columns: ColumnsType<ProblemItem> = [
    {
      title: "编号",
      dataIndex: "id",
      key: "id",
      width: 90,
      align: "center",
      render: (id: number) => (
        <Typography.Text type="secondary">#{id}</Typography.Text>
      ),
    },
    {
      title: "题目",
      dataIndex: "title",
      key: "title",
      width: 420,
      ellipsis: true,
      render: (_: unknown, p: ProblemItem) => (
        <div>
          <Space size="small">
            <Typography.Text
              className="cursor-pointer"
              style={{ fontSize: 16, color: "#111827", fontWeight: 500 }}
              onClick={() => navigate(`/problems/${p.id}`, { state: p })}
            >
              {p.title}
            </Typography.Text>
            <Tag
              color={
                p.difficulty === "简单"
                  ? "green"
                  : p.difficulty === "中等"
                  ? "orange"
                  : "red"
              }
            >
              {p.difficulty}
            </Tag>
          </Space>
          <div style={{ marginTop: 6 }}>
            <Space size={[4, 4]} wrap>
              {p.tags.map((t) => (
                <Tag key={t} color="blue">
                  {t}
                </Tag>
              ))}
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: "通过率",
      dataIndex: "acceptance",
      key: "acceptance",
      width: 120,
      align: "center",
      render: (val: number) => (
        <Typography.Text>{val.toFixed(1)}%</Typography.Text>
      ),
    },
    {
      title: "提交数",
      dataIndex: "submissions",
      key: "submissions",
      width: 120,
      align: "center",
      render: (n: number) => (
        <Typography.Text strong>{formatSubmissions(n)}</Typography.Text>
      ),
    },
    {
      title: "状态",
      key: "status",
      width: 120,
      align: "center",
      render: (_: unknown, p: ProblemItem) =>
        solved[p.id] ? (
          <Tag color="green">已通过</Tag>
        ) : (
          <Tag color="red">未通过</Tag>
        ),
    },
    {
      title: "操作",
      key: "actions",
      width: 160,
      align: "center",
      render: (_: unknown, p: ProblemItem) => (
        <Space size="small">
          <Button
            type={favorites[p.id] ? "primary" : "default"}
            icon={
              favorites[p.id] ? (
                <HeartFilled style={{ color: "#f5222d" }} />
              ) : (
                <HeartOutlined />
              )
            }
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(p.id);
            }}
            shape="round"
            size="small"
            className="hover:cursor-pointer"
          >
            {favorites[p.id] ? "已收藏" : "收藏"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <Header />
      <div className="pt-16">
        {/* 头部区域 */}
        <section className="bg-white py-10 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl !font-bold text-gray-900">题库</h1>
            </div>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              sortBy={sortBy}
              onSortByChange={(v) => setSortBy(v)}
              difficulty={difficulty}
              onDifficultyChange={(d) => setDifficulty(d)}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              status={status}
              onStatusChange={(s) => setStatus(s)}
              allTags={allTags}
            />
          </div>
        </section>

        {/* 列表区 */}
        <section className="py-8 bg-[#F9F9F9]">
          <div className="max-w-7xl mx-auto px-6">
            <Card className="rounded-xl">
              <Table<ProblemItem>
                columns={columns}
                dataSource={filtered}
                rowKey="id"
                tableLayout="fixed"
                scroll={{ x: "max-content" }}
                onRow={(record) => ({
                  className: "hover:cursor-pointer",
                  onClick: () =>
                    navigate(`/problems/${record.id}`, { state: record }),
                })}
                pagination={{
                  current: page,
                  total: filtered.length,
                  pageSize,
                  onChange: (p) => setPage(p),
                }}
                locale={{
                  emptyText: (
                    <Empty description="暂无符合条件的题目">
                      <Button
                        type="primary"
                        onClick={() => {
                          setSearch("");
                          setSortBy("默认");
                          setDifficulty("全部");
                          setSelectedTags([]);
                          setStatus("全部");
                        }}
                      >
                        清除筛选
                      </Button>
                    </Empty>
                  ),
                }}
              />
            </Card>
            {/* 使用 Table 自带分页，移除自定义分页 */}
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
};

export default ProblemBank;
