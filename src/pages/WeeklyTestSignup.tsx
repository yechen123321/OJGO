import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Typography,
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  message,
  Tag,
} from "antd";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface WeeklyTestItem {
  id: number;
  title: string;
  startTime: string;
  durationMinutes: number;
  course?: string;
}

const formatTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const WeeklyTestSignup: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const loc = useLocation();
  const test = loc.state as WeeklyTestItem | undefined;
  const [form] = Form.useForm();

  // 开放时间逻辑：仅在开始时间前 10 分钟至开始之间允许填写
  const startTs = useMemo(() => (test?.startTime ? new Date(test.startTime).getTime() : undefined), [test?.startTime]);
  const openTs = useMemo(() => (startTs ? startTs - 10 * 60 * 1000 : undefined), [startTs]);
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const canFill = useMemo(() => {
    if (!startTs || !openTs) return true; // 无开始时间则默认允许
    return now >= openTs && now < startTs;
  }, [now, startTs, openTs]);

  const countdown = useMemo(() => {
    if (!startTs || !openTs) return "";
    if (now < openTs) {
      const diff = openTs - now;
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return `距离开放还有 ${m} 分 ${s} 秒（开赛前 10 分钟开放）`;
    }
    if (now >= startTs) {
      return "已开赛，当前不可填写";
    }
    return "";
  }, [now, startTs, openTs]);

  const onFinish = async (values: any) => {
    if (!canFill) {
      message.warning("仅在开赛前 10 分钟内允许填写");
      return;
    }
    // 简单存储，真实项目可 POST 到后端
    try {
      const key = `weekly-signup-${id}`;
      localStorage.setItem(key, JSON.stringify({ ...values, testId: id }));
      message.success("提交成功，祝考试顺利！");
      navigate("/weekly-tests");
    } catch {
      message.error("提交失败，请稍后重试");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <Header />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            周测信息填写
          </Typography.Title>

          {/* Header Card */}
          <Card className="rounded-2xl mb-6 overflow-hidden border border-gray-100">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {test?.title || `周测 #${id}`}
                </Typography.Title>
                {test?.course && <Tag color="processing">{test.course}</Tag>}
              </div>
              <div className="mt-2 text-gray-600 text-sm flex flex-wrap gap-6">
                <span>
                  开始时间：
                  <Typography.Text strong>
                    {formatTime(test?.startTime)}
                  </Typography.Text>
                </span>
                <span>
                  时长：
                  <Typography.Text strong>
                    {test?.durationMinutes ?? "-"} 分钟
                  </Typography.Text>
                </span>
              </div>
            </div>
          </Card>

          {/* 信息填写表单 */}
          <Card className="rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-4">
              {/* 开放状态提示 */}
              {countdown && (
                <div className="mb-3">
                  <Tag color={now < (openTs ?? 0) ? "warning" : "error"}>{countdown}</Tag>
                </div>
              )}
               <Form
                 form={form}
                 layout="vertical"
                 onFinish={onFinish}
                 requiredMark
               >
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Form.Item
                     label="姓名"
                     name="name"
                     rules={[{ required: true, message: "请输入姓名" }]}
                   >
                    <Input placeholder="张三" disabled={!canFill} />
                   </Form.Item>

                   <Form.Item
                     label="学号"
                     name="studentId"
                     rules={[{ required: true, message: "请输入学号" }]}
                   >
                    <Input placeholder="20230001" disabled={!canFill} />
                   </Form.Item>

                   <Form.Item
                     label="班级"
                     name="className"
                     rules={[{ required: true, message: "请输入班级" }]}
                   >
                    <Input placeholder="软工 2201" disabled={!canFill} />
                   </Form.Item>

                   <Form.Item
                     label="邮箱"
                     name="email"
                     rules={[{ type: "email", message: "邮箱格式不正确" }]}
                   >
                    <Input placeholder="example@school.edu" disabled={!canFill} />
                   </Form.Item>

                   <Form.Item
                     label="手机号"
                     name="phone"
                     rules={[
                       { pattern: /^\d{11}$/, message: "请输入 11 位手机号" },
                     ]}
                   >
                    <Input placeholder="13800000000" disabled={!canFill} />
                   </Form.Item>
                 </div>

                 <Form.Item
                   name="agree"
                   valuePropName="checked"
                   rules={[
                     {
                       validator: (_, v) =>
                         v
                           ? Promise.resolve()
                           : Promise.reject(new Error("请勾选同意准考须知")),
                     },
                   ]}
                 >

                  <Checkbox disabled={!canFill}>我已阅读并同意准考须知</Checkbox>
                 </Form.Item>

                 <Form.Item>
                   <Button
                     type="primary"
                     htmlType="submit"
                     block
                     className="rounded-lg"
                     disabled={!canFill}
                   >
                     提交信息
                   </Button>
                 </Form.Item>
               </Form>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default WeeklyTestSignup;
