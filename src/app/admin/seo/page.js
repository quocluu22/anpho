"use client";
import { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, Typography, Tabs, Divider, Row, Col } from "antd";
import { adminApi } from "../../../lib/api";

const { Title, Text } = Typography;

export default function SeoPage() {
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
      message.success("SEO & Social saved!");
    } catch { message.error("Failed"); }
    finally { setSaving(false); }
  };

  const preview = form.getFieldValue;

  const tabs = [
    {
      key: "meta", label: "SEO / Meta Tags",
      children: (
        <div>
          {/* Google Preview */}
          <Card style={{ marginBottom:24, background:"#f8f9fa", border:"1px solid #e8e8e8" }}>
            <Text type="secondary" style={{ fontSize:12 }}>🔍 Google Search Preview</Text>
            <div style={{ marginTop:8, padding:"12px 16px", background:"#fff", borderRadius:8, border:"1px solid #ddd" }}>
              <div style={{ color:"#1a0dab", fontSize:18, fontWeight:500 }}>{form.getFieldValue("salon_name") || "AN PHỞ"} - Authentic Vietnamese Restaurant</div>
              <div style={{ color:"#006621", fontSize:14 }}>{form.getFieldValue("site_url") || "https://your-restaurant.vercel.app"}</div>
              <div style={{ color:"#545454", fontSize:14 }}>{form.getFieldValue("meta_description") || "Authentic Vietnamese pho restaurant. Book a table online!"}</div>
            </div>
            <Text type="secondary" style={{ fontSize:11, marginTop:8, display:"block" }}>* Preview updates after save & reload</Text>
          </Card>

          <Form.Item name="meta_title" label="Meta Title" extra="Tối đa 60 ký tự. Quan trọng nhất cho SEO.">
            <Input placeholder="AN PHỞ - Authentic Vietnamese Restaurant | Elk Grove CA" showCount maxLength={60}/>
          </Form.Item>
          <Form.Item name="meta_description" label="Meta Description" extra="Tối đa 160 ký tự.">
            <Input.TextArea rows={3} placeholder="Authentic Vietnamese pho restaurant in Elk Grove, CA. 24-hour bone broth, fresh ingredients. Book a table online!" showCount maxLength={160}/>
          </Form.Item>
          <Form.Item name="keywords" label="Keywords">
            <Input placeholder="pho restaurant elk grove, vietnamese food sacramento, authentic pho"/>
          </Form.Item>
          <Form.Item name="og_image" label="OG Image URL (1200×630px — ảnh share Facebook/Zalo)">
            <Input placeholder="https://res.cloudinary.com/..."/>
          </Form.Item>
          <Form.Item name="site_url" label="Site URL">
            <Input placeholder="https://your-restaurant.vercel.app"/>
          </Form.Item>
          <Form.Item name="favicon_url" label="Favicon URL">
            <Input placeholder="https://res.cloudinary.com/..."/>
          </Form.Item>
        </div>
      ),
    },
    {
      key: "social", label: "Social Links",
      children: (
        <div>
          <Form.Item name="google_business_url" label="Google Business Profile URL">
            <Input placeholder="https://maps.google.com/..."/>
          </Form.Item>
          <Form.Item name="facebook_url" label="Facebook URL">
            <Input placeholder="https://facebook.com/anpho"/>
          </Form.Item>
          <Form.Item name="instagram_url" label="Instagram URL">
            <Input placeholder="https://instagram.com/anpho"/>
          </Form.Item>
          <Form.Item name="tiktok_url" label="TikTok URL">
            <Input placeholder="https://tiktok.com/@anpho"/>
          </Form.Item>
          <Form.Item name="yelp_url" label="Yelp URL">
            <Input placeholder="https://yelp.com/biz/an-pho"/>
          </Form.Item>
        </div>
      ),
    },
    {
      key: "geo", label: "Maps & GEO",
      children: (
        <div>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="geo_lat" label="Latitude" extra="Lấy từ Google Maps">
                <Input placeholder="38.4088"/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="geo_lng" label="Longitude">
                <Input placeholder="-121.3716"/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="contact_map_embed" label="Google Maps Embed Code" extra='Google Maps → Share → Embed a map → Copy HTML'>
            <Input.TextArea rows={4} placeholder='<iframe src="https://www.google.com/maps/embed?..."...'/>
          </Form.Item>
          <Form.Item name="ga4_id" label="Google Analytics 4 ID">
            <Input placeholder="G-XXXXXXXXXX"/>
          </Form.Item>
        </div>
      ),
    },
    {
      key: "faq", label: "FAQ",
      children: (
        <div>
          <Text type="secondary" style={{ display:"block", marginBottom:16 }}>
            FAQ được hiển thị trên landing page và tối ưu SEO (Google FAQ rich results).
          </Text>
          {[1,2,3,4,5,6,7].map(i => (
            <Card key={i} size="small" style={{ marginBottom:12 }} title={`FAQ ${i}`}>
              <Form.Item name={`faq_${i}_q`} label="Question">
                <Input placeholder="Do you accept reservations?"/>
              </Form.Item>
              <Form.Item name={`faq_${i}_a`} label="Answer" style={{ marginBottom:0 }}>
                <Input.TextArea rows={2} placeholder="Yes! Book online or call us directly."/>
              </Form.Item>
            </Card>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <Title level={4} style={{ margin:0 }}>SEO & Social</Title>
        <Button type="primary" loading={saving} onClick={handleSave}
          style={{ background:"#815500", borderColor:"#815500" }}>
          Save All
        </Button>
      </div>
      <Form form={form} layout="vertical">
        <Tabs items={tabs}/>
      </Form>
    </div>
  );
}
