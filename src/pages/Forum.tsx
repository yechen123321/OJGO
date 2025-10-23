import React, { useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, List, Tag, Input, Button, Space, Avatar, Typography, Divider, Drawer } from 'antd';

const { Title, Text } = Typography;
const { Search } = Input;

// Thread data model
type Thread = {
  id: string;
  title: string;
  author: string;
  avatar?: string;
  createdAt: string; // ISO string
  replies: number;
  likes: number;
  tags: string[];
  content: string;
};

const mockThreads: Thread[] = [
  {
    id: '1',
    title: '两数之和题解与多种优化思路',
    author: 'Alice',
    createdAt: new Date().toISOString(),
    replies: 12,
    likes: 35,
    tags: ['算法', '哈希', 'LeetCode'],
    content:
      '本帖整理两数之和的多种解法：暴力、哈希、排序双指针，并比较时间复杂度与空间复杂度，欢迎补充与讨论。',
  },
  {
    id: '2',
    title: 'Go 后端接口如何高效分页？',
    author: 'Bob',
    createdAt: new Date().toISOString(),
    replies: 5,
    likes: 20,
    tags: ['Golang', '后端', '分页'],
    content:
      '分享几种常用的分页策略与注意事项，包括游标分页、offset/limit、以及和数据库索引的配合。',
  },
  {
    id: '3',
    title: 'TypeScript 类型体操学习资源推荐',
    author: 'Cathy',
    createdAt: new Date().toISOString(),
    replies: 18,
    likes: 42,
    tags: ['TypeScript', '前端', '类型系统'],
    content:
      '收集了一些优秀的类型体操题与讲解视频，适合希望深入理解 TS 类型系统的同学。',
  },
];

const allTags = Array.from(
  mockThreads.reduce((set, t) => {
    t.tags.forEach(tag => set.add(tag));
    return set;
  }, new Set<string>())
);

function Forum() {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockThreads.filter(t => {
      const matchText =
        !q || t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q);
      const matchTag = !activeTag || t.tags.includes(activeTag);
      return matchText && matchTag;
    });
  }, [query, activeTag]);

  const openThread = (id: string) => setOpenId(id);
  const closeThread = () => setOpenId(null);
  const current = useMemo(() => filtered.find(t => t.id === openId) || null, [openId, filtered]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header 保持项目统一 */}
      <Header />

      {/* 主体内容区：统一容器与间距 */}
      <section className="flex-1 pt-14 md:pt-16 pb-8">
        <div className="mx-auto max-w-[1600px] xl:max-w-[1800px] px-2 sm:px-4 md:px-6">
          {/* 页面标题与操作区 */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <Title level={3} style={{ margin: 0 }}>讨论论坛</Title>
            <Space>
              <Button type="primary" size="small">发起讨论</Button>
            </Space>
          </div>

          {/* 搜索与标签筛选 */}
          <Card hoverable className="rounded-md shadow-sm" styles={{ body: { padding: 8 } }}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Search
                size="small"
                placeholder="搜索帖子标题或内容…"
                allowClear
                onSearch={(value) => setQuery(value)}
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                enterButton
              />

              <div className="flex flex-wrap gap-2">
                <Tag
                  color={!activeTag ? 'blue' : undefined}
                  onClick={() => setActiveTag(null)}
                  bordered={false}
                  className="cursor-pointer px-1.5 py-0.5 text-[12px]"
                >全部</Tag>
                {allTags.map(tag => (
                  <Tag
                    key={tag}
                    color={activeTag === tag ? 'blue' : undefined}
                    onClick={() => setActiveTag(tag)}
                    bordered={false}
                    className="cursor-pointer px-1.5 py-0.5 text-[12px]"
                  >{tag}</Tag>
                ))}
              </div>
            </Space>
          </Card>

          <Divider style={{ margin: '12px 0' }} />

          {/* 线程列表 */}
          <Card styles={{ body: { padding: 8 } }}>
            <List
              size="small"
              split
               itemLayout="horizontal"
               dataSource={filtered}
               renderItem={(item) => (
                <List.Item className="py-2 px-2 rounded-md hover:bg-gray-50"
                   actions={[
                     <Button key="view" size="small" type="link" onClick={() => openThread(item.id)}>查看</Button>,
                     <Text key="stats" type="secondary">{item.replies} 回复 · {item.likes} 赞</Text>
                   ]}
                 >
                   <List.Item.Meta
                    avatar={<Avatar size={28} src={item.avatar}>
                       {item.avatar ? null : item.author[0]}
                     </Avatar>}
                     title={
                      <Space size={8} wrap>
                        <a className="text-[14px] font-medium" onClick={() => openThread(item.id)}>{item.title}</a>
                        {item.tags.map(tag => (
                          <Tag key={tag} bordered={false} className="px-1.5 py-0.5 text-[12px]">{tag}</Tag>
                        ))}
                      </Space>
                     }
                     description={
                      <Space direction="vertical" size={4}>
                        <Text type="secondary" className="text-[12px]">由 {item.author} · {new Date(item.createdAt).toLocaleString()}</Text>
                        <Text className="line-clamp-2 text-[13px]">{item.content}</Text>
                      </Space>
                     }
                   />
                 </List.Item>
               )}
            />
          </Card>
        </div>
      </section>

      {/* 页脚统一 */}
      <Footer />

      {/* 线程详情抽屉 */}
      <Drawer
        open={!!current}
        onClose={closeThread}
        width={720}
        title={current?.title}
      >
        {current && (
          <Space direction="vertical" style={{ width: '100%' }} size={10}>
            <Space size={8} wrap>
              <Avatar size={28} src={current.avatar}>{current.avatar ? null : current.author[0]}</Avatar>
               <Text type="secondary">{current.author} · {new Date(current.createdAt).toLocaleString()}</Text>
             </Space>
             <div className="flex flex-wrap gap-2">
              {current.tags.map(tag => (<Tag key={tag} bordered={false} className="px-1.5 py-0.5 text-[12px]">{tag}</Tag>))}
             </div>
            <Card styles={{ body: { padding: 10 } }}>
              <Text>{current.content}</Text>
            </Card>
            <Divider style={{ margin: '8px 0' }} />
            <Text type="secondary">评论功能暂为占位，可接入后端或本地存储。</Text>
            <Space style={{ width: '100%' }}>
              <Input.TextArea rows={3} placeholder="写下你的看法…" className="flex-1" />
              <Button type="primary" size="small">提交</Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </div>
  );
}

export default Forum;