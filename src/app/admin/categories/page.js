"use client";
import { useState } from "react";
import { Card, Button, List, Tag, Typography, Space, Input, Modal, message, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined, DragOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

// Categories mặc định — thứ tự hiển thị trên web
const DEFAULT_CATEGORIES = [
  { name: "Small Bites & Rolls", icon: "🥢", layout: "stamp-cards",   desc: "3 cards with image, stamp effect" },
  { name: "Signature Phở",       icon: "🍜", layout: "bento",         desc: "Bento grid with herb circle + quote card" },
  { name: "Beyond the Broth",    icon: "🔥", layout: "dark-section",  desc: "Dark green section with large image" },
  { name: "Drinks",              icon: "🥤", layout: "simple-list",   desc: "Simple list with image thumbnail" },
  { name: "Desserts",            icon: "🍮", layout: "simple-list",   desc: "Simple list with image thumbnail" },
];

const LAYOUT_LABELS = {
  "stamp-cards":  { color: "purple",  label: "Stamp Cards" },
  "bento":        { color: "blue",    label: "Bento Grid" },
  "dark-section": { color: "green",   label: "Dark Section" },
  "simple-list":  { color: "default", label: "Simple List" },
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newName,    setNewName]    = useState("");
  const [newIcon,    setNewIcon]    = useState("🍽️");
  const [adding,     setAdding]     = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) { message.error("Nhập tên danh mục!"); return; }
    if (categories.find(c => c.name === newName.trim())) { message.error("Tên đã tồn tại!"); return; }
    setCategories([...categories, { name: newName.trim(), icon: newIcon, layout: "simple-list", desc: "Simple list" }]);
    setNewName("");
    setNewIcon("🍽️");
    setAdding(false);
    message.success(`✅ Đã thêm danh mục "${newName.trim()}" — vào Menu Items để thêm món!`);
  };

  const handleDelete = (cat) => {
    Modal.confirm({
      title: `Xóa danh mục "${cat.name}"?`,
      content: "Các món ăn trong danh mục này sẽ không hiển thị trên web (nhưng vẫn còn trong Sheet).",
      okText: "Xóa", okType: "danger",
      onOk: () => {
        setCategories(categories.filter(c => c.name !== cat.name));
        message.success("Đã xóa!");
      },
    });
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <Title level={4} style={{ margin:0 }}>Menu Categories</Title>
        <Button type="primary" icon={<PlusOutlined/>} onClick={() => setAdding(true)}
          style={{ background:"#815500", borderColor:"#815500" }}>
          Add Category
        </Button>
      </div>
      <Text type="secondary" style={{ display:"block", marginBottom:20, fontSize:13 }}>
        Thứ tự danh mục quyết định layout hiển thị trên landing page.
        Danh mục 1 → Stamp Cards · Danh mục 2 → Bento Grid · Danh mục 3 → Dark Section · Còn lại → Simple List
      </Text>

      {/* Add form */}
      {adding && (
        <Card style={{ marginBottom:20, background:"#fffbe6", border:"1px solid #ffe58f" }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:12, fontWeight:600, marginBottom:4, color:"#888" }}>ICON</div>
              <Input value={newIcon} onChange={e=>setNewIcon(e.target.value)} style={{ width:72, textAlign:"center", fontSize:20 }}/>
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:12, fontWeight:600, marginBottom:4, color:"#888" }}>TÊN DANH MỤC</div>
              <Input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="VD: Desserts, Drinks, Combos..." onPressEnter={handleAdd}/>
            </div>
            <Space>
              <Button type="primary" onClick={handleAdd} style={{ background:"#815500", borderColor:"#815500" }}>Add</Button>
              <Button onClick={() => setAdding(false)}>Cancel</Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Category list */}
      <List
        dataSource={categories}
        renderItem={(cat, index) => (
          <Card size="small" style={{ marginBottom:12, border:"1px solid #f0ede5" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <Space size={16}>
                <div style={{ fontSize:28, width:40, textAlign:"center" }}>{cat.icon}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:"#061b0e" }}>
                    {index + 1}. {cat.name}
                  </div>
                  <Space style={{ marginTop:4 }}>
                    <Tag color={LAYOUT_LABELS[cat.layout]?.color || "default"}>
                      {LAYOUT_LABELS[cat.layout]?.label || cat.layout}
                    </Tag>
                    <Text type="secondary" style={{ fontSize:12 }}>{cat.desc}</Text>
                  </Space>
                </div>
              </Space>
              <Space>
                {index < 3 && (
                  <Tooltip title="Danh mục này có layout cố định, không thể xóa">
                    <Tag color="orange">Fixed Layout</Tag>
                  </Tooltip>
                )}
                {index >= 3 && (
                  <Button size="small" danger icon={<DeleteOutlined/>} onClick={() => handleDelete(cat)}/>
                )}
              </Space>
            </div>
          </Card>
        )}
      />

      {/* Info */}
      <Card style={{ marginTop:20, background:"#f6f3ea", border:"none" }}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <InfoCircleOutlined style={{ color:"#815500", fontSize:16, marginTop:2 }}/>
          <div>
            <div style={{ fontWeight:600, marginBottom:8 }}>Cách thêm món vào danh mục:</div>
            <ol style={{ paddingLeft:16, fontSize:14, color:"#555", lineHeight:1.8 }}>
              <li>Vào <strong>Menu</strong> → <strong>Add Item</strong></li>
              <li>Chọn <strong>Category</strong> từ dropdown</li>
              <li>Điền thông tin món ăn → Save</li>
              <li>Món sẽ tự động hiển thị trong danh mục tương ứng trên web</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
