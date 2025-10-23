import React from "react";
import { Table, Typography } from "antd";

interface User {
  key: string;
  name: string;
  age: number;
  address: string;
}

const columns = [
  { title: "姓名", dataIndex: "name", key: "name" },
  { title: "年龄", dataIndex: "age", key: "age" },
  { title: "地址", dataIndex: "address", key: "address" },
];

const data: User[] = [
  { key: "1", name: "张三", age: 28, address: "北京" },
  { key: "2", name: "李四", age: 32, address: "上海" },
  { key: "3", name: "王五", age: 24, address: "广州" },
];

const TablePage: React.FC = () => {
  return (
    <div>
      <Typography.Title level={3}>表格示例（Ant Design）</Typography.Title>
      <Table<User> columns={columns} dataSource={data} pagination={false} />
    </div>
  );
};

export default TablePage;
