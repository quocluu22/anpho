"use client";
import { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, Typography, Divider, Row, Col } from "antd";
import { adminApi } from "../../../lib/api";

const { Title, Text } = Typography;

export default function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [form]                = Form.useForm();

  useEffect(() => {
    adminApi.getAbout().then(data => {
      if (data) form.setFieldsValue(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const v = form.getFieldsValue();
    setSaving(true);
    try {
      await adminApi.updateAbout(v);
      message.success("Our Story updated!");
    } catch { message.error("Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <Title level={4} style={{ margin:0 }}>Our Story</Title>
        <Button type="primary" loading={saving} onClick={handleSave}
          style={{ background:"#815500", borderColor:"#815500" }}>
          Save Changes
        </Button>
      </div>

      <Form form={form} layout="vertical">
        {/* Story text */}
        <Card title="Story Content" style={{ marginBottom:16 }}>
          <Form.Item name="story" label="Story Paragraph 1">
            <Input.TextArea rows={4} placeholder="AN PHỞ was born from a simple belief..."/>
          </Form.Item>
          <Form.Item name="story2" label="Story Paragraph 2">
            <Input.TextArea rows={4} placeholder="When we opened our first location..."/>
          </Form.Item>
          <Form.Item name="mission" label="Mission Tag (shown below story)">
            <Input placeholder="Organic & Toxin-Free Ingredients"/>
          </Form.Item>
        </Card>

        {/* Chef / Quote */}
        <Card title="Chef Quote" style={{ marginBottom:16 }}>
          <Form.Item name="chef_quote" label="Quote">
            <Input.TextArea rows={3} placeholder="It's not just food, it's a hug in a bowl..."/>
          </Form.Item>
          <Form.Item name="chef_name" label="Chef Name">
            <Input placeholder="Chef An"/>
          </Form.Item>
        </Card>

        {/* Stats */}
        <Card title="Stats (shown in Our Story section)" style={{ marginBottom:16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="stat_1_number" label="Stat 1 Number"><Input placeholder="14+"/></Form.Item>
              <Form.Item name="stat_1_label"  label="Stat 1 Label"><Input placeholder="Years Open"/></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="stat_2_number" label="Stat 2 Number"><Input placeholder="2"/></Form.Item>
              <Form.Item name="stat_2_label"  label="Stat 2 Label"><Input placeholder="Locations"/></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="stat_3_number" label="Stat 3 Number"><Input placeholder="24h"/></Form.Item>
              <Form.Item name="stat_3_label"  label="Stat 3 Label"><Input placeholder="Broth Simmered"/></Form.Item>
            </Col>
          </Row>
          <Form.Item name="est_year" label="Established Year">
            <Input placeholder="2010" style={{ width:120 }}/>
          </Form.Item>
        </Card>

        {/* Images */}
        <Card title="Images">
          <Form.Item name="story_img" label="Our Story Main Image URL">
            <Input placeholder="https://res.cloudinary.com/..."/>
          </Form.Item>
          <Form.Item name="circle_img_1" label="Circle Herb Image URL (Phở section)">
            <Input placeholder="https://res.cloudinary.com/..."/>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
}
