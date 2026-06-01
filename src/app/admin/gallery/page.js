"use client";
import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Select, Switch, Card, Row, Col, message, Typography, Tag, Popconfirm, Image } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { adminApi } from "../../../lib/api";

const { Title } = Typography;
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CATEGORIES = ["Food", "Interior", "Team", "Event"];

export default function GalleryPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form]                = Form.useForm();

  const load = async () => {
    setLoading(true);
    try { setItems(await adminApi.getGallery() || []); }
    catch { message.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async e => {
    const file = e.target.files[0];
    if (!file || !CLOUD) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", PRESET || "nail_gallery");
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method:"POST", body:fd });
      const data = await res.json();
      form.setFieldValue("Image_URL", data.secure_url);
      message.success("Uploaded!");
    } catch { message.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ Category:"Food", Active:true });
    setModal(true);
  };

  const openEdit = item => {
    setEditing(item);
    form.setFieldsValue({ Image_URL:item.Image_URL, Caption:item.Caption, Category:item.Category, Active:item.Active !== false });
    setModal(true);
  };

  const handleSave = async () => {
    let v; try { v = await form.validateFields(); } catch { return; }
    setSaving(true);
    try {
      if (editing) { await adminApi.updateGallery({ _row:editing._row, ...v }); message.success("Updated!"); }
      else { await adminApi.addGallery(v); message.success("Added!"); }
      setModal(false); load();
    } catch { message.error("Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async item => {
    await adminApi.deleteGallery({ _row:item._row });
    message.success("Deleted!"); load();
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <Title level={4} style={{ margin:0 }}>Gallery</Title>
        <Button type="primary" icon={<PlusOutlined/>} onClick={openAdd}
          style={{ background:"#815500", borderColor:"#815500" }}>
          Add Photo
        </Button>
      </div>

      <Row gutter={[16,16]}>
        {items.map(item => (
          <Col key={item._row} xs={12} sm={8} md={6}>
            <Card
              hoverable size="small"
              cover={<Image src={item.Image_URL} alt={item.Caption} height={160} style={{ objectFit:"cover" }} preview/>}
              actions={[
                <EditOutlined key="edit" onClick={() => openEdit(item)}/>,
                <Popconfirm key="del" title="Delete this photo?" onConfirm={() => handleDelete(item)}>
                  <DeleteOutlined style={{ color:"#ff4d4f" }}/>
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={<span style={{ fontSize:13 }}>{item.Caption || "—"}</span>}
                description={
                  <Space>
                    <Tag>{item.Category}</Tag>
                    <Tag color={item.Active ? "green" : "default"}>{item.Active ? "On" : "Off"}</Tag>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {items.length === 0 && !loading && (
        <Card><div style={{ textAlign:"center", padding:40, color:"#888" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📸</div>
          <div>No photos yet. Add your first photo!</div>
        </div></Card>
      )}

      <Modal title={editing ? "Edit Photo" : "Add Photo"} open={modal}
        onCancel={() => setModal(false)} onOk={handleSave}
        okText="Save" confirmLoading={saving}
        okButtonProps={{ style:{ background:"#815500", borderColor:"#815500" } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop:16 }}>
          <Form.Item name="Image_URL" label="Image URL" rules={[{ required:true }]}>
            <Input placeholder="https://res.cloudinary.com/..."/>
          </Form.Item>
          <div style={{ marginBottom:16 }}>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading}/>
            {uploading && <span style={{ marginLeft:8, color:"#888" }}>Uploading...</span>}
          </div>
          <Form.Item name="Caption" label="Caption">
            <Input placeholder="Signature beef pho bowl"/>
          </Form.Item>
          <Form.Item name="Category" label="Category">
            <Select options={CATEGORIES.map(c => ({ value:c, label:c }))}/>
          </Form.Item>
          <Form.Item name="Active" label="Active" valuePropName="checked">
            <Switch defaultChecked/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
