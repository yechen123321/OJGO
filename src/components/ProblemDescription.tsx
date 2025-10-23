import React from "react";
import { Card, Typography, Tag, Divider } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import 'highlight.js/styles/github.css';

interface Meta {
  acceptance?: number;
  submissions?: number;
  difficulty?: "简单" | "中等" | "困难";
  tags?: string[];
}

interface Example {
  title: string;
  input: string;
  output: string;
  explanation?: string;
}

interface Props {
  title: string;
  meta?: Meta;
  markdown: string;
}

const formatSubmissions = (n?: number) => {
  if (!n && n !== 0) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const SectionTitle: React.FC<{ text: string }> = ({ text }) => (
  <Typography.Title level={5} style={{ marginTop: 0 }}>
    {text}
  </Typography.Title>
);

const MonoBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <pre className="bg-gray-50 rounded border border-gray-200 px-3 py-2 text-[13px] overflow-x-auto">
    {children}
  </pre>
);

const ProblemDescription: React.FC<Props> = ({
  title,
  meta,
  markdown,
}) => {
  const difficultyColor = meta?.difficulty === "简单" ? "green" : meta?.difficulty === "中等" ? "orange" : "red";

  return (
    <div className="select-text">
      {/* 标题与元信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 0 }}>
            {title}
          </Typography.Title>
          {meta?.difficulty && (
            <Tag color={difficultyColor}>{meta.difficulty}</Tag>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
          {typeof meta?.acceptance === "number" && (
            <span>
              通过率 <Typography.Text strong>{meta.acceptance!.toFixed(1)}%</Typography.Text>
            </span>
          )}
          {typeof meta?.submissions === "number" && (
            <span>
              提交数 <Typography.Text strong>{formatSubmissions(meta.submissions)}</Typography.Text>
            </span>
          )}
        </div>
      </div>

      {meta?.tags && meta.tags.length > 0 && (
        <div className="mt-1 mb-2 flex flex-wrap gap-2">
          {meta.tags.map((t) => (
            <Tag key={t} className="m-0">{t}</Tag>
          ))}
        </div>
      )}

      <Card className="rounded-md">
        <div className="prose max-w-none select-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {markdown}
          </ReactMarkdown>
        </div>

        
      </Card>
    </div>
  );
};

export default ProblemDescription;