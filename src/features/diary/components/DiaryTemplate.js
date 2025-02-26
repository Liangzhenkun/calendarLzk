import React, { useState } from 'react';
import { Form, Input, Button, Select, Card, message } from 'antd';

const { TextArea } = Input;

const DiaryTemplate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('/api/diary/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('日记保存成功！');
        form.resetFields();
      } else {
        message.error('保存失败');
      }
    } catch (error) {
      message.error('保存失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="写日记" bordered={false}>
      <Form
        form={form}
        name="diary"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          label="心情"
          name="mood"
          rules={[{ required: true, message: '请选择心情！' }]}
        >
          <Select>
            <Select.Option value="happy">开心</Select.Option>
            <Select.Option value="normal">一般</Select.Option>
            <Select.Option value="sad">难过</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="内容"
          name="content"
          rules={[{ required: true, message: '请输入日记内容！' }]}
        >
          <TextArea rows={6} />
        </Form.Item>

        <Form.Item
          label="标签"
          name="tags"
        >
          <Input placeholder="用逗号分隔多个标签" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            保存
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DiaryTemplate; 