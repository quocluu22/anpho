"use client";
import { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, Typography, Tabs, Row, Col, Divider, Spin, Image } from "antd";
import { UploadOutlined, LinkOutlined } from "@ant-design/icons";
import { adminApi } from "../../../lib/api";

const { Title, Text } = Typography;
const CLOUD  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "nail_gallery";

function ImageField({ name, label, hint }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e, onChange) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!CLOUD) { message.error("Chưa cài Cloudinary cloud name"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", PRESET);
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method:"POST", body:fd });
      const data = await res.json();
      if (data.secure_url) { onChange(data.secure_url); message.success("Upload thành công!"); }
      else message.error("Upload thất bại: " + (data.error?.message || "Unknown error"));
    } catch { message.error("Upload thất bại"); }
    finally { setUploading(false); }
  };

  return (
    <Form.Item name={name} label={label} extra={hint}>
      {({ value, onChange } = {}) => (
        <Form.Item name={name} noStyle>
          <Input.Group compact style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <Form.Item name={name} noStyle>
              <Input prefix={<LinkOutlined/>} placeholder="https://res.cloudinary.com/..." style={{ marginBottom:8 }}/>
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                const url = getFieldValue(name);
                return url ? <Image src={url} height={100} style={{ objectFit:"cover", borderRadius:6, marginBottom:8 }} preview/> : null;
              }}
            </Form.Item>
            <label style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:6, border:"1px dashed #d9d9d9", cursor: uploading ? "not-allowed" : "pointer", fontSize:13, color:"#555", background:"#fff", width:"fit-content" }}>
              <UploadOutlined/> {uploading ? "Đang upload..." : "Upload ảnh"}
              <input type="file" accept="image/*" disabled={uploading}
                onChange={e => {
                  // Cần lấy onChange từ Form.Item — dùng cách khác
                }} style={{ display:"none" }}/>
            </label>
          </Input.Group>
        </Form.Item>
      )}
    </Form.Item>
  );
}

// Simple image uploader dùng với Form.Item
function ImgUpload({ value, onChange, placeholder, uploading, setUploading }) {
  const doUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!CLOUD) { message.error("Thiếu NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME trong .env.local"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", PRESET);
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method:"POST", body:fd });
      const data = await res.json();
      if (data.secure_url) { onChange(data.secure_url); message.success("✅ Upload thành công!"); }
      else message.error("❌ " + (data.error?.message || "Upload thất bại"));
    } catch (err) { message.error("❌ Upload thất bại: " + err.message); }
    finally { setUploading(false); e.target.value = ""; }
  };
  return (
    <div>
      <Input value={value} onChange={e => onChange(e.target.value)} prefix={<LinkOutlined/>} placeholder={placeholder || "https://res.cloudinary.com/..."} style={{ marginBottom:8 }}/>
      {value && <Image src={value} height={100} style={{ objectFit:"cover", borderRadius:6, border:"1px solid #eee", marginBottom:8 }} preview/>}
      <label style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:6, border:"1px dashed #d9d9d9", cursor: uploading ? "not-allowed" : "pointer", fontSize:13, color:"#555" }}>
        <UploadOutlined/> {uploading ? "Đang upload..." : "Upload ảnh"}
        <input type="file" accept="image/*" disabled={uploading} onChange={doUpload} style={{ display:"none" }}/>
      </label>
    </div>
  );
}

export default function ContentPage() {
  const [saving,    setSaving]    = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [settingsForm] = Form.useForm();
  const [aboutForm]    = Form.useForm();

  useEffect(() => {
    Promise.all([adminApi.getSettings(), adminApi.getAbout()]).then(([s, a]) => {
      if (s && typeof s === "object") settingsForm.setFieldsValue(s);
      if (a && typeof a === "object") aboutForm.setFieldsValue(a);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const v = settingsForm.getFieldsValue(true);
      await adminApi.updateSettings(v);
      message.success("✅ Đã lưu!");
    } catch (e) { message.error("❌ Lỗi: " + e.message); }
    finally { setSaving(false); }
  };

  const saveAbout = async () => {
    setSaving(true);
    try {
      const v = aboutForm.getFieldsValue(true);
      await adminApi.updateAbout(v);
      message.success("✅ Đã lưu!");
    } catch (e) { message.error("❌ Lỗi: " + e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign:"center", padding:80 }}><Spin size="large"/></div>;

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <Title level={4} style={{ margin:0 }}>Page Content</Title>
        <Text type="secondary" style={{ fontSize:13 }}>Quản lý nội dung và hình ảnh hiển thị trên trang web</Text>
      </div>

      <Tabs type="card" items={[
        // ── HERO ──────────────────────────────────────────────
        {
          key:"hero", label:"🖼️ Hero Banner",
          forceRender: true,
          children: (
            <Form form={settingsForm} layout="vertical">
              <Card style={{ marginBottom:16 }}>
                <Form.Item name="hero_image_url" label="Ảnh Hero Banner" extra="Ảnh nền phía trên trang — khuyến nghị 1920×600px">
                  <ImgUpload uploading={uploading} setUploading={setUploading}/>
                </Form.Item>
                <Form.Item name="hero_title" label="Tiêu đề">
                  <Input placeholder="Our Menu"/>
                </Form.Item>
                <Form.Item name="hero_subtitle" label="Phụ đề">
                  <Input placeholder="A Taste of Family Heritage"/>
                </Form.Item>
              </Card>
              <Button type="primary" loading={saving} onClick={saveSettings} block
                style={{ background:"#815500", borderColor:"#815500", height:44, fontSize:15 }}>
                💾 Lưu Hero Banner
              </Button>
            </Form>
          ),
        },

        // ── PHỞ ───────────────────────────────────────────────
        {
          key:"pho", label:"🍜 Signature Phở",
          forceRender: true,
          children: (
            <Form form={settingsForm} layout="vertical">
              <Card style={{ marginBottom:16 }}>
                <Form.Item name="pho_title" label="Tiêu đề section">
                  <Input placeholder="Signature Phở"/>
                </Form.Item>
                <Form.Item name="pho_sub" label="Mô tả ngắn">
                  <Input.TextArea rows={2} placeholder="Our broth is simmered for 24 hours..."/>
                </Form.Item>
                <Divider/>
                <Form.Item name="pho_img_url" label='Ảnh tô phở "Bestseller"' extra="Ảnh card bên phải — khuyến nghị 500×400px">
                  <ImgUpload uploading={uploading} setUploading={setUploading}/>
                </Form.Item>
              </Card>
              <Button type="primary" loading={saving} onClick={saveSettings} block
                style={{ background:"#815500", borderColor:"#815500", height:44, fontSize:15 }}>
                💾 Lưu Signature Phở
              </Button>
            </Form>
          ),
        },

        // ── BEYOND ────────────────────────────────────────────
        {
          key:"beyond", label:"🔥 Beyond the Broth",
          forceRender: true,
          children: (
            <Form form={settingsForm} layout="vertical">
              <Card style={{ marginBottom:16 }}>
                <Form.Item name="beyond_title" label="Tiêu đề section">
                  <Input placeholder="Beyond the Broth"/>
                </Form.Item>
                <Form.Item name="beyond_sub" label="Mô tả ngắn">
                  <Input.TextArea rows={2} placeholder="Discover our selection..."/>
                </Form.Item>
                <Divider/>
                <Form.Item name="beyond_img_url" label="Ảnh section" extra="Ảnh bên phải section dark green — khuyến nghị 600×400px">
                  <ImgUpload uploading={uploading} setUploading={setUploading}/>
                </Form.Item>
              </Card>
              <Button type="primary" loading={saving} onClick={saveSettings} block
                style={{ background:"#815500", borderColor:"#815500", height:44, fontSize:15 }}>
                💾 Lưu Beyond the Broth
              </Button>
            </Form>
          ),
        },

        // ── OUR STORY ─────────────────────────────────────────
        {
          key:"story", label:"📖 Our Story",
          forceRender: true,
          children: (
            <Form form={aboutForm} layout="vertical">
              <Card title="Ảnh" style={{ marginBottom:16 }}>
                <Form.Item name="story_img" label="Ảnh chính Our Story" extra="Ảnh bên trái section — ảnh nhà hàng, gia đình, bếp">
                  <ImgUpload uploading={uploading} setUploading={setUploading}/>
                </Form.Item>
                <Form.Item name="circle_img_1" label="Ảnh tròn (Herb/Rau)" extra="Ảnh tròn trong Phở section — ảnh rau thơm">
                  <ImgUpload uploading={uploading} setUploading={setUploading}/>
                </Form.Item>
              </Card>
              <Card title="Nội dung" style={{ marginBottom:16 }}>
                <Form.Item name="story" label="Đoạn 1">
                  <Input.TextArea rows={4} placeholder="AN PHỞ was born from..."/>
                </Form.Item>
                <Form.Item name="story2" label="Đoạn 2">
                  <Input.TextArea rows={4} placeholder="When we opened..."/>
                </Form.Item>
                <Form.Item name="mission" label="Tag sứ mệnh">
                  <Input placeholder="Organic & Toxin-Free Ingredients"/>
                </Form.Item>
                <Form.Item name="est_year" label="Năm thành lập">
                  <Input placeholder="2010" style={{ width:120 }}/>
                </Form.Item>
              </Card>
              <Card title="Chef Quote" style={{ marginBottom:16 }}>
                <Form.Item name="chef_quote" label="Câu quote">
                  <Input.TextArea rows={3} placeholder="It's not just food..."/>
                </Form.Item>
                <Form.Item name="chef_name" label="Tên Chef">
                  <Input placeholder="Chef An"/>
                </Form.Item>
              </Card>
              <Card title="Thống kê" style={{ marginBottom:16 }}>
                <Row gutter={16}>
                  {[1,2,3].map(n => (
                    <Col key={n} span={8}>
                      <Form.Item name={`stat_${n}_number`} label={`Số ${n}`}><Input placeholder={["14+","2","24h"][n-1]}/></Form.Item>
                      <Form.Item name={`stat_${n}_label`}  label={`Label ${n}`}><Input placeholder={["Years Open","Locations","Broth Simmered"][n-1]}/></Form.Item>
                    </Col>
                  ))}
                </Row>
              </Card>
              <Button type="primary" loading={saving} onClick={saveAbout} block
                style={{ background:"#815500", borderColor:"#815500", height:44, fontSize:15 }}>
                💾 Lưu Our Story
              </Button>
            </Form>
          ),
        },

        // ── NHÀ HÀNG ──────────────────────────────────────────
        {
          key:"info", label:"🏪 Nhà hàng",
          forceRender: true,
          children: (
            <Form form={settingsForm} layout="vertical">
              <Card style={{ marginBottom:16 }}>
                <Form.Item name="salon_name" label="Tên nhà hàng"><Input placeholder="AN PHỞ"/></Form.Item>
                <Form.Item name="address" label="Địa chỉ"><Input placeholder="8250 Elk Grove Blvd..."/></Form.Item>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="phone" label="Điện thoại"><Input placeholder="(916) 555-0123"/></Form.Item></Col>
                  <Col span={12}><Form.Item name="email" label="Email"><Input placeholder="hello@anpho.com"/></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="hours_weekday" label="Giờ mở cửa (Mon–Sat)"><Input placeholder="Mon–Sat 11AM–9PM"/></Form.Item></Col>
                  <Col span={12}><Form.Item name="hours_weekend" label="Giờ mở cửa (Sunday)"><Input placeholder="Sun 11AM–8PM"/></Form.Item></Col>
                </Row>
                <Divider>Chi nhánh</Divider>
                <Form.Item name="location_1" label="Chi nhánh 1"><Input placeholder="Elk Grove (Main)"/></Form.Item>
                <Form.Item name="location_2" label="Chi nhánh 2"><Input placeholder="Sacramento (Downtown)"/></Form.Item>
                <Form.Item name="location_3" label="Chi nhánh 3"><Input/></Form.Item>
                <Divider>Logo</Divider>
                <Form.Item name="logo_url" label="Logo URL" extra="Để trống → hiện tên nhà hàng bằng chữ">
                  <ImgUpload uploading={uploading} setUploading={setUploading}/>
                </Form.Item>
              </Card>
              <Button type="primary" loading={saving} onClick={saveSettings} block
                style={{ background:"#815500", borderColor:"#815500", height:44, fontSize:15 }}>
                💾 Lưu thông tin nhà hàng
              </Button>
            </Form>
          ),
        },
      ]}/>
    </div>
  );
}
