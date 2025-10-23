import React from "react";
import { Form, Input, Select, Segmented, Space, Tag } from "antd";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  sortBy: "默认" | "通过率" | "提交数" | "难度";
  onSortByChange: (v: Props["sortBy"]) => void;
  difficulty: "全部" | "简单" | "中等" | "困难";
  onDifficultyChange: (v: Props["difficulty"]) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  status: "全部" | "未做" | "已做" | "收藏";
  onStatusChange: (v: Props["status"]) => void;
  allTags: string[];
}

const FilterBar: React.FC<Props> = ({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  difficulty,
  onDifficultyChange,
  selectedTags,
  onToggleTag,
  status,
  onStatusChange,
  allTags,
}) => {
  const sortOptions = [
    { label: "默认", value: "默认" },
    { label: "通过率", value: "通过率" },
    { label: "提交数", value: "提交数" },
    { label: "难度", value: "难度" },
  ];

  return (
    <Form layout="vertical">
      <Space
        wrap
        align="center"
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Input.Search
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜索题目..."
          allowClear
          size="middle"
          style={{ width: 380 }}
        />
        <Select
          value={sortBy}
          onChange={(v) => onSortByChange(v as Props["sortBy"])}
          options={sortOptions}
          style={{ width: 160 }}
        />
      </Space>

      <Space wrap size="small" style={{ marginBottom: 12 }}>
        <Segmented
          options={["全部", "简单", "中等", "困难"]}
          value={difficulty}
          onChange={(v) => onDifficultyChange(v as Props["difficulty"])}
        />
      </Space>

      {/* 标签选择：使用可选标签组而非下拉框 */}
      <div style={{ marginBottom: 12 }}>
        <Space size={[8, 8]} wrap>
          {allTags.map((t) => (
            <Tag.CheckableTag
              key={t}
              checked={selectedTags.includes(t)}
              onChange={() => onToggleTag(t)}
              className="hover:cursor-pointer"
            >
              {t}
            </Tag.CheckableTag>
          ))}
        </Space>
      </div>

      <Space wrap size="small">
        <Segmented
          options={["全部", "未做", "已做", "收藏"]}
          value={status}
          onChange={(v) => onStatusChange(v as Props["status"])}
        />
      </Space>
    </Form>
  );
};

export default FilterBar;
