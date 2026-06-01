"use client";
import { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, Typography, Row, Col, Divider } from "antd";
import { adminApi } from "../../../lib/api";

const { Title } = Typography;

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [form]              = Form.useForm();

  useEffect(() => {
    adminApi.getSettings().then(data => { if (data) form.setFieldsValue(data); });
  }, []);

  const handleSave = async () => {
    const v = form.getFieldsValue();
    setSaving(true);
    try {
      await adminApi.updateSettings(v);
      message.success("Settings saved!");
    } catch { message.error("Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <Title level={4} style={{ margin:0 }}>Restaurant Settings</Title>
        <Button type="primary" loading={saving} onClick={handleSave}
          style={{ background:"#815500", borderColor:"#815500" }}>
          Save All
        </Button>
      </div>

      <Form form={form} layout="vertical">
        {/* Basic Info */}
        <Card title="🍜 Restaurant Info" style={{ marginBottom:16 }}>
          <Form.Item name="salon_name" label="Restaurant Name">
            <Input placeholder="AN PHỞ"/>
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input placeholder="8250 Elk Grove Blvd, Elk Grove, CA 95758"/>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="(916) 555-0123"/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="hello@anpho.com"/>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hours_weekday" label="Hours (Mon–Sat)">
                <Input placeholder="Mon–Sat 11AM–9PM"/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hours_weekend" label="Hours (Sunday)">
                <Input placeholder="Sun 11AM–8PM"/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notify_email" label="Notification Email (nhận booking mới)">
            <Input placeholder="owner@anpho.com"/>
          </Form.Item>
        </Card>

        {/* Locations */}
        <Card title="📍 Locations" style={{ marginBottom:16 }}>
          <Form.Item name="location_1" label="Location 1">
            <Input placeholder="Elk Grove (Main)"/>
          </Form.Item>
          <Form.Item name="location_2" label="Location 2 (để trống nếu không có)">
            <Input placeholder="Sacramento (Downtown)"/>
          </Form.Item>
          <Form.Item name="location_3" label="Location 3 (để trống nếu không có)">
            <Input/>
          </Form.Item>
        </Card>

        {/* Hero */}
        <Card title="🖼️ Hero Banner" style={{ marginBottom:16 }}>
          <Form.Item name="hero_title" label="Hero Title">
            <Input placeholder="Our Menu"/>
          </Form.Item>
          <Form.Item name="hero_subtitle" label="Hero Subtitle">
            <Input placeholder="A Taste of Family Heritage"/>
          </Form.Item>
          <Form.Item name="hero_image_url" label="Hero Image URL (1920×600px)">
            <Input placeholder="https://res.cloudinary.com/..."/>
          </Form.Item>
        </Card>

        {/* Section Content */}
        <Card title="📝 Section Content" style={{ marginBottom:16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pho_title" label="Signature Phở — Title">
                <Input placeholder="Signature Phở"/>
              </Form.Item>
              <Form.Item name="pho_sub" label="Signature Phở — Subtitle">
                <Input placeholder="Our broth is simmered for 24 hours..."/>
              </Form.Item>
              <Form.Item name="pho_img_url" label="Signature Phở — Bowl Image URL">
                <Input placeholder="https://res.cloudinary.com/..."/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="beyond_title" label="Beyond the Broth — Title">
                <Input placeholder="Beyond the Broth"/>
              </Form.Item>
              <Form.Item name="beyond_sub" label="Beyond the Broth — Subtitle">
                <Input placeholder="Discover our selection of stir-fried specialties..."/>
              </Form.Item>
              <Form.Item name="beyond_img_url" label="Beyond the Broth — Image URL">
                <Input placeholder="https://res.cloudinary.com/..."/>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Cloudinary */}
        <Card title="☁️ Cloudinary (Upload ảnh)" style={{ marginBottom:16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cloudinary_cloud_name" label="Cloud Name">
                <Input placeholder="your-cloud-name"/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cloudinary_upload_preset" label="Upload Preset">
                <Input placeholder="nail_gallery"/>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Telegram */}
        <Card title="📱 Telegram Notifications" style={{ marginBottom:16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="telegram_bot_token" label="Bot Token">
                <Input.Password placeholder="1234567890:ABC..."/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="telegram_chat_id" label="Chat ID">
                <Input placeholder="-100123456789"/>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
}
