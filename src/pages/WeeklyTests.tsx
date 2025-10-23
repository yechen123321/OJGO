import React, { useState } from "react";
import { Card, List, Tag, Button, Typography, Avatar, Pagination } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

interface WeeklyTestItem {
  id: number;
  title: string;
  startTime: string; // ISO
  durationMinutes: number;
  course?: string;
  description?: string;
}

const upcoming: WeeklyTestItem[] = [
  {
    id: 101,
    title: "第 473 场周赛",
    startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    durationMinutes: 90,
    course: "算法基础",
    description: "参与还差 1 小时 30 分钟的竞赛",
  },
  {
    id: 102,
    title: "第 168 场双周赛",
    startTime: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    durationMinutes: 120,
    course: "数据结构",
    description: "热门竞赛，建议提前做热身题",
  },
];

const featured = [
  { ...upcoming[0], gradient: "from-indigo-500/90 to-purple-600/90" },
  { ...upcoming[1], gradient: "from-green-600/90 to-teal-600/90" },
];

interface Leader {
  id: number;
  name: string;
  avatar?: string;
}

const leaderboard: Leader[] = [
  { id: 1, name: "小千同学" },
  { id: 2, name: "H 学姐" },
  { id: 3, name: "SSends" },
  { id: 4, name: "小洋同学" },
  { id: 5, name: "技巧牛" },
  { id: 6, name: "道可道非常道" },
  { id: 7, name: "im65536" },
  { id: 8, name: "ccc55236" },
  { id: 9, name: "wifill" },
  { id: 10, name: "Kai Wen Yang" },
];

const pastTests: WeeklyTestItem[] = Array.from({ length: 10 }).map((_, i) => ({
  id: 200 + i,
  title: `第 ${466 + i} 场周赛`,
  startTime: new Date(Date.now() - (i + 1) * 24 * 3600 * 1000).toISOString(),
  durationMinutes: 90,
  course: "算法",
}));

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const durationLabel = (mins: number) =>
  `${Math.floor(mins / 60)} 小时 ${mins % 60} 分钟`;

const WeeklyTests: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pagedPast = pastTests.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-[#F5F6F7] flex flex-col">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* 英雄横幅 */}
          <div className="rounded-3xl bg-gradient-to-b from-[#2b2b2f] to-[#1f1f23] text-white p-10 shadow-lg">
            <div className="flex items-center gap-4">
              <TrophyOutlined style={{ fontSize: 48, color: "#ffd666" }} />
              <div>
                <div className="text-2xl font-semibold">CodeJudge 竞赛</div>
                <div className="text-white/70 text-sm">
                  快速参加周测提升等级，提升你的世界排名
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {featured.map((f) => (
                <div
                  key={f.id}
                  className={`rounded-2xl p-6 bg-gradient-to-br ${f.gradient} text-white shadow-md`}
                >
                  <div className="text-lg font-semibold mb-2">{f.title}</div>
                  <div className="text-white/80 text-sm mb-2">
                    时间：{formatTime(f.startTime)}
                  </div>
                  <div className="text-white/80 text-sm mb-4">
                    时长：{durationLabel(f.durationMinutes)}
                  </div>
                  <Button
                    type="primary"
                    onClick={() =>
                      navigate(`/weekly-tests/${f.id}/signup`, { state: f })
                    }
                  >
                    填写信息
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* 主内容：左侧排行榜 + 右侧往届列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* 排行榜 */}
            <Card
              className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm lg:col-span-1"
              styles={{ body: { padding: 16 } }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-700 font-semibold">全国排名</span>
              </div>
              <List
                itemLayout="horizontal"
                dataSource={leaderboard}
                renderItem={(user, idx) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar>{idx + 1}</Avatar>}
                      title={<span className="text-gray-800">{user.name}</span>}
                      description={
                        <span className="text-gray-500">
                          已参赛次数：{10 - idx}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
              <div className="text-center">
                <Button type="link">显示更多</Button>
              </div>
            </Card>

            {/* 往届竞赛回顾 */}
            <Card
              className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm lg:col-span-2"
              styles={{ body: { padding: 16 } }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    往届竞赛回顾
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    以往竞赛记录，方便快速进入练习
                  </Typography.Text>
                </div>
              </div>
              <List
                dataSource={pagedPast}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        shape="round"
                        onClick={() =>
                          navigate(`/weekly-tests/${item.id}/signup`, {
                            state: item,
                          })
                        }
                      >
                        参赛
                      </Button>,
                    ]}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Tag color="purple">{item.course}</Tag>
                        <span className="font-medium text-gray-800">
                          {item.title}
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm">
                        {durationLabel(item.durationMinutes)}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              <div className="flex justify-end pt-2">
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={pastTests.length}
                  onChange={setPage}
                />
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default WeeklyTests;
