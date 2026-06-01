"use client";
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Switch, Space, Card, message, Typography, Rate, Tag, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { adminApi } from "../../../lib/api";

const { Title } = Typography;

export default function ReviewsPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [form]                = Form.useForm();

  const load = async () => {
    setLoading(true);
    try { setItems(await adminApi.getReviews() || []); }
    catch { message.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ Stars:5, Active:true });
    setModal(true);
  };

  const openEdit = item => {
    setEditing(item);
    form.setFieldsValue({ Name:item.Name, Review:item.Review, Stars:Number(item.Stars)||5, Avatar_URL:item.Avatar_URL, Active:item.Active !== false });
    setModal(true);
  };

  const handleSave = async () => {
    let v; try { v = await form.validateFields(); } catch { return; }
    setSaving(true);
    try {
      if (editing) { await adminApi.updateReview({ _row:editing._row, ...v }); message.success("Updated!"); }
      else { await adminApi.addReview(v); message.success("Added!"); }
      setModal(false); load();
    } catch { message.error("Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async item => {
    await adminApi.deleteReview({ _row:item._row });
    message.success("Deleted!"); load();
  };

  const columns = [
    { title:"Guest", dataIndex:"Name", width:160 },
    { title:"Stars", dataIndex:"Stars", width:140, render: v => <Rate disabled defaultValue={Number(v)||5} style={{ fontSize:14 }}/> },
    { title:"Review", dataIndex:"Review", ellipsis:true },
    { title:"Active", dataIndex:"Active", width:80, render: v => <Tag color={v ? "green" : "default"}>{v ? "On" : "Off"}</Tag> },
    {
      title:"", width:100,
      render:(_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined/>}  onClick={() => openEdit(r)}/>
          <Popconfirm title="Delete this review?" onConfirm={() => handleDelete(r)}>
            <Button size="small" icon={<DeleteOutlined/>} danger/>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <Title level={4} style={{ margin:0 }}>Guest Reviews</Title>
        <Button type="primary" icon={<PlusOutlined/>} onClick={openAdd}
          style={{ background:"#815500", borderColor:"#815500" }}>
          Add Review
        </Button>
      </div>

      <Card>
        <Table rowKey="_row" dataSource={items} columns={columns} loading={loading} size="small"
          pagination={{ pageSize:20 }}/>
      </Card>

      <Modal title={editing ? "Edit Review" : "Add Review"} open={modal}
        onCancel={() => setModal(false)} onOk={handleSave}
        okText="Save" confirmLoading={saving}
        okButtonProps={{ style:{ background:"#815500", borderColor:"#815500" } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop:16 }}>
          <Form.Item name="Name" label="Guest Name" rules={[{ required:true }]}>
            <Input placeholder="Jennifer M."/>
          </Form.Item>
          <Form.Item name="Stars" label="Rating">
            <Rate/>
          </Form.Item>
          <Form.Item name="Review" label="Review" rules={[{ required:true }]}>
            <Input.TextArea rows={3} placeholder="The broth is extraordinary..."/>
          </Form.Item>
          <Form.Item name="Avatar_URL" label="Avatar URL (optional)">
            <Input placeholder="https://..."/>
          </Form.Item>
          <Form.Item name="Active" label="Show on website" valuePropName="checked">
            <Switch defaultChecked/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
