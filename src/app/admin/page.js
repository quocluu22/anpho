"use client";
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, Space, Card, message, Typography, Tag, Popconfirm, Image } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, LinkOutlined } from "@ant-design/icons";
import { adminApi } from "../../lib/api";

const { Title } = Typography;
const CLOUD  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "nail_gallery";

const CATEGORIES = ["Small Bites & Rolls", "Signature Phở", "Beyond the Broth", "Drinks", "Desserts"];

// ── Reusable image upload component ──────────────────────────
function ImgUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const doUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!CLOUD) { message.error("Thiếu NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", PRESET);
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method:"POST", body:fd });
      const data = await res.json();
      if (data.secure_url) { onChange(data.secure_url); message.success("✅ Upload thành công!"); }
      else message.error("❌ " + (data.error?.message || "Upload thất bại"));
    } catch { message.error("❌ Upload thất bại"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  return (
    <div>
      {/* URL input */}
      <Input
        value={value} onChange={e => onChange(e.target.value)}
        prefix={<LinkOutlined/>}
        placeholder="https://res.cloudinary.com/..."
        style={{ marginBottom:8 }}
      />
      {/* Preview */}
      {value && (
        <div style={{ marginBottom:8 }}>
          <Image src={value} height={80} style={{ objectFit:"cover", borderRadius:6, border:"1px solid #eee" }} preview/>
        </div>
      )}
      {/* Upload button */}
      <label style={{
        display:"inline-flex", alignItems:"center", gap:6,
        padding:"5px 12px", borderRadius:6,
        border:"1px dashed #d9d9d9", cursor: uploading ? "not-allowed" : "pointer",
        fontSize:13, color:"#555", background:"#fafafa",
      }}>
        <UploadOutlined/>
        {uploading ? "Đang upload..." : "Upload ảnh"}
        <input type="file" accept="image/*" disabled={uploading} onChange={doUpload} style={{ display:"none" }}/>
      </label>
    </div>
  );
}

export default function MenuPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [form]                = Form.useForm();

  const load = async () => {
    setLoading(true);
    try { setItems(await adminApi.getMenu() || []); }
    catch { message.error("Failed to load menu"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ Active:true, Featured:false, Category:CATEGORIES[0] });
    setModal(true);
  };

  const openEdit = item => {
    setEditing(item);
    form.setFieldsValue({
      Category: item.Category, Name: item.Name, Price: item.Price,
      Desc: item.Desc, Tags: Array.isArray(item.Tags) ? item.Tags.join(",") : (item.Tags || ""),
      Img: item.Img, Featured: item.Featured, Active: item.Active !== false,
    });
    setModal(true);
  };

  const handleSave = async () => {
    let v; try { v = await form.validateFields(); } catch { return; }
    setSaving(true);
    try {
      if (editing) {
        await adminApi.updateMenuItem({ _row:editing._row, ...v, Tags:v.Tags||"" });
        message.success("✅ Updated!");
      } else {
        await adminApi.addMenuItem({ ...v, Tags:v.Tags||"" });
        message.success("✅ Added!");
      }
      setModal(false); load();
    } catch { message.error("❌ Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = item => {
    Modal.confirm({
      title: `Delete "${item.Name}"?`, okText:"Delete", okType:"danger",
      onOk: async () => { await adminApi.deleteMenuItem({ _row:item._row }); message.success("Deleted!"); load(); },
    });
  };

  // Group by category
  const grouped = CATEGORIES.map(cat => ({
    cat, items: items.filter(i => i.Category === cat)
  })).filter(g => g.items.length > 0);

  const columns = [
    {
      title:"", dataIndex:"Img", width:60,
      render: v => v ? <Image src={v} width={40} height={40} style={{ objectFit:"cover", borderRadius:4 }} preview={false}/> : <div style={{ width:40, height:40, background:"#f5f5f5", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🍜</div>
    },
    {
      title:"Name", dataIndex:"Name",
      render:(v,r) => <Space><span style={{ fontWeight:600 }}>{v}</span>{r.Featured && <Tag color="gold">Featured</Tag>}</Space>
    },
    { title:"Price", dataIndex:"Price", width:100 },
    { title:"Description", dataIndex:"Desc", ellipsis:true },
    { title:"Tags", dataIndex:"Tags", width:180, render: tags => Array.isArray(tags) ? tags.map(t=><Tag key={t}>{t}</Tag>) : null },
    { title:"Active", dataIndex:"Active", width:80, render: v => <Tag color={v?"green":"default"}>{v?"On":"Off"}</Tag> },
    {
      title:"", width:90,
      render:(_,r) => (
        <Space>
          <Button size="small" icon={<EditOutlined/>}  onClick={()=>openEdit(r)}/>
          <Popconfirm title={`Delete "${r.Name}"?`} onConfirm={()=>handleDelete(r)}>
            <Button size="small" icon={<DeleteOutlined/>} danger/>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <Title level={4} style={{ margin:0 }}>Menu Items</Title>
        <Button type="primary" icon={<PlusOutlined/>} onClick={openAdd}
          style={{ background:"#815500", borderColor:"#815500" }}>
          Add Item
        </Button>
      </div>

      {grouped.length > 0 ? grouped.map(({ cat, items:catItems }) => (
        <Card key={cat} title={<span style={{ color:"#815500", fontWeight:700 }}>{cat}</span>}
          style={{ marginBottom:16 }} size="small">
          <Table rowKey="_row" dataSource={catItems} columns={columns} loading={loading} size="small" pagination={false}/>
        </Card>
      )) : (
        <Card>
          <div style={{ textAlign:"center", padding:40, color:"#888" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🍜</div>
            <div>No menu items yet.</div>
            <Button type="primary" icon={<PlusOutlined/>} onClick={openAdd} style={{ marginTop:16, background:"#815500", borderColor:"#815500" }}>Add First Item</Button>
          </div>
        </Card>
      )}

      <Modal
        title={editing ? "Edit Menu Item" : "Add Menu Item"}
        open={modal} onCancel={()=>setModal(false)}
        onOk={handleSave} okText="Save" confirmLoading={saving}
        okButtonProps={{ style:{ background:"#815500", borderColor:"#815500" } }}
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop:16 }}>
          <Form.Item name="Category" label="Category" rules={[{ required:true }]}>
            <Select options={CATEGORIES.map(c=>({ value:c, label:c }))}/>
          </Form.Item>
          <Form.Item name="Name" label="Item Name" rules={[{ required:true }]}>
            <Input placeholder="Classic Beef Phở"/>
          </Form.Item>
          <Form.Item name="Price" label="Price" rules={[{ required:true }]}>
            <Input placeholder="$18.50"/>
          </Form.Item>
          <Form.Item name="Desc" label="Description">
            <Input.TextArea rows={2} placeholder="Thinly sliced ribeye, brisket..."/>
          </Form.Item>
          <Form.Item name="Tags" label="Tags (phân cách bằng dấu phẩy)">
            <Input placeholder="Popular, Gluten Free, Vegan"/>
          </Form.Item>
          <Form.Item name="Img" label="Ảnh món ăn">
            <ImgUpload/>
          </Form.Item>
          <Space>
            <Form.Item name="Featured" label="Featured" valuePropName="checked">
              <Switch/>
            </Form.Item>
            <Form.Item name="Active" label="Active" valuePropName="checked">
              <Switch defaultChecked/>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
