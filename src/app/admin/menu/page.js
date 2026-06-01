"use client";
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, Space, Tag, Card, message, Typography, Upload, Image } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { adminApi } from "../../../lib/api";

const { Title } = Typography;

const CATEGORIES = ["Small Bites & Rolls", "Signature Phở", "Beyond the Broth", "Drinks", "Desserts"];

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
    form.setFieldsValue({ Active: true, Featured: false, Category: CATEGORIES[0] });
    setModal(true);
  };

  const openEdit = item => {
    setEditing(item);
    form.setFieldsValue({
      Category: item.Category, Name: item.Name, Price: item.Price,
      Desc: item.Desc, Tags: item.Tags?.join(",") || "",
      Img: item.Img, Featured: item.Featured, Active: item.Active !== false,
    });
    setModal(true);
  };

  const handleSave = async () => {
    let v; try { v = await form.validateFields(); } catch { return; }
    setSaving(true);
    try {
      if (editing) {
        await adminApi.updateMenuItem({ _row: editing._row, ...v, Tags: v.Tags || "" });
        message.success("Updated!");
      } else {
        await adminApi.addMenuItem({ ...v, Tags: v.Tags || "" });
        message.success("Added!");
      }
      setModal(false); load();
    } catch { message.error("Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async item => {
    Modal.confirm({
      title: `Delete "${item.Name}"?`, okText: "Delete", okType: "danger",
      onOk: async () => {
        await adminApi.deleteMenuItem({ _row: item._row });
        message.success("Deleted!"); load();
      },
    });
  };

  // Group by category for display
  const grouped = CATEGORIES.map(cat => ({
    cat, items: items.filter(i => i.Category === cat)
  })).filter(g => g.items.length > 0);

  const columns = [
    { title: "Name", dataIndex: "Name", key: "name", render: (v, r) => <Space><span style={{ fontWeight:600 }}>{v}</span>{r.Featured && <Tag color="gold">Featured</Tag>}</Space> },
    { title: "Price", dataIndex: "Price", key: "price", width: 100 },
    { title: "Description", dataIndex: "Desc", key: "desc", ellipsis: true },
    { title: "Tags", dataIndex: "Tags", key: "tags", width: 180, render: tags => Array.isArray(tags) ? tags.map(t => <Tag key={t}>{t}</Tag>) : null },
    { title: "Active", dataIndex: "Active", key: "active", width: 80, render: v => <Tag color={v ? "green" : "default"}>{v ? "On" : "Off"}</Tag> },
    {
      title: "", key: "actions", width: 100,
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined/>}  onClick={() => openEdit(r)}/>
          <Button size="small" icon={<DeleteOutlined/>} danger onClick={() => handleDelete(r)}/>
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

      {grouped.map(({ cat, items: catItems }) => (
        <Card key={cat} title={<span style={{ color:"#815500", fontWeight:700 }}>{cat}</span>}
          style={{ marginBottom:16 }} size="small">
          <Table
            rowKey="_row" dataSource={catItems} columns={columns}
            loading={loading} size="small" pagination={false}
          />
        </Card>
      ))}

      {items.length === 0 && !loading && (
        <Card>
          <div style={{ textAlign:"center", padding:40, color:"#888" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🍜</div>
            <div>No menu items yet. Add your first item!</div>
          </div>
        </Card>
      )}

      <Modal
        title={editing ? "Edit Menu Item" : "Add Menu Item"}
        open={modal} onCancel={() => setModal(false)}
        onOk={handleSave} okText="Save" confirmLoading={saving}
        okButtonProps={{ style:{ background:"#815500", borderColor:"#815500" } }}
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop:16 }}>
          <Form.Item name="Category" label="Category" rules={[{ required:true }]}>
            <Select options={CATEGORIES.map(c => ({ value:c, label:c }))}/>
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
          <Form.Item name="Tags" label="Tags (comma separated)">
            <Input placeholder="Popular, Gluten Free, Vegan"/>
          </Form.Item>
          <Form.Item name="Img" label="Image URL (Cloudinary)">
            <Input placeholder="https://res.cloudinary.com/..."/>
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
