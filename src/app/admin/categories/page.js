"use client";
import { useEffect, useState } from "react";
import { Card, Button, List, Tag, Typography, Space, Input, Modal, message, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { adminApi } from "../../../lib/api";

const { Title, Text } = Typography;

const DEFAULT_CATEGORIES = [
  { name:"Small Bites & Rolls", icon:"🥢", layout:"stamp-cards"  },
  { name:"Signature Phở",       icon:"🍜", layout:"bento"        },
  { name:"Beyond the Broth",    icon:"🔥", layout:"dark-section" },
  { name:"Drinks",              icon:"🥤", layout:"stamp-cards"  },
  { name:"Desserts",            icon:"🍮", layout:"stamp-cards"  },
];

const LAYOUT_LABELS = {
  "stamp-cards":  { color:"purple", label:"Stamp Cards" },
  "bento":        { color:"blue",   label:"Bento Grid"  },
  "dark-section": { color:"green",  label:"Dark Section"},
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [adding,     setAdding]     = useState(false);
  const [newName,    setNewName]    = useState("");
  const [newIcon,    setNewIcon]    = useState("🍽️");

  // Load từ Settings Sheet
  useEffect(() => {
    adminApi.getSettings().then(s => {
      if (s?.menu_category_order) {
        try {
          const saved = JSON.parse(s.menu_category_order);
          if (Array.isArray(saved) && saved.length > 0) setCategories(saved);
        } catch (_) {}
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Lưu thứ tự vào Settings Sheet
  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings({ menu_category_order: JSON.stringify(categories) });
      message.success("✅ Đã lưu thứ tự danh mục!");
    } catch { message.error("❌ Lưu thất bại"); }
    finally { setSaving(false); }
  };

  const moveUp   = (i) => { if (i===0) return; const c=[...categories]; [c[i-1],c[i]]=[c[i],c[i-1]]; setCategories(c); };
  const moveDown = (i) => { if (i===categories.length-1) return; const c=[...categories]; [c[i],c[i+1]]=[c[i+1],c[i]]; setCategories(c); };

  const handleAdd = () => {
    if (!newName.trim()) { message.error("Nhập tên danh mục!"); return; }
    if (categories.find(c => c.name === newName.trim())) { message.error("Tên đã tồn tại!"); return; }
    setCategories([...categories, { name:newName.trim(), icon:newIcon, layout:"stamp-cards" }]);
    setNewName(""); setNewIcon("🍽️"); setAdding(false);
    message.info(`Đã thêm "${newName}" — nhớ bấm Lưu thứ tự!`);
  };

  const handleDelete = (cat, i) => {
    if (i < 3) { message.warning("Không thể xóa 3 danh mục mặc định!"); return; }
    Modal.confirm({
      title: `Xóa "${cat.name}"?`,
      content: "Món ăn trong danh mục này vẫn còn trong Sheet nhưng sẽ không hiển thị trên web.",
      okText:"Xóa", okType:"danger",
      onOk: () => { setCategories(categories.filter((_,ci) => ci !== i)); message.success("Đã xóa! Nhớ bấm Lưu."); },
    });
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <Title level={4} style={{ margin:0 }}>Menu Categories</Title>
        <Space>
          <Button icon={<PlusOutlined/>} onClick={() => setAdding(true)}>Add Category</Button>
          <Button type="primary" loading={saving} onClick={handleSave}
            style={{ background:"#815500", borderColor:"#815500" }}>
            💾 Lưu thứ tự
          </Button>
        </Space>
      </div>
      <Text type="secondary" style={{ display:"block", marginBottom:20, fontSize:13 }}>
        Dùng nút ↑ ↓ để sắp xếp thứ tự hiển thị trên web. Bấm <strong>Lưu thứ tự</strong> để áp dụng.
      </Text>

      {/* Add form */}
      {adding && (
        <Card style={{ marginBottom:16, background:"#fffbe6", border:"1px solid #ffe58f" }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>ICON</div>
              <Input value={newIcon} onChange={e=>setNewIcon(e.target.value)} style={{ width:64, textAlign:"center", fontSize:20 }}/>
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>TÊN DANH MỤC</div>
              <Input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="VD: Combos, Soups..." onPressEnter={handleAdd}/>
            </div>
            <Space>
              <Button type="primary" onClick={handleAdd} style={{ background:"#815500", borderColor:"#815500" }}>Add</Button>
              <Button onClick={()=>setAdding(false)}>Cancel</Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Category list với số thứ tự */}
      {categories.map((cat, i) => (
        <Card key={cat.name} size="small" style={{ marginBottom:10, border:"1px solid #f0ede5" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Space size={12}>
              {/* Số thứ tự */}
              <div style={{
                width:32, height:32, borderRadius:"50%",
                background: i<3 ? "#815500" : "#f0ede5",
                color: i<3 ? "#fff" : "#815500",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:800, fontSize:14, flexShrink:0,
              }}>{i+1}</div>
              <span style={{ fontSize:24 }}>{cat.icon}</span>
              <div>
                <div style={{ fontWeight:700, color:"#061b0e" }}>{cat.name}</div>
                <Tag color={LAYOUT_LABELS[cat.layout]?.color||"default"} style={{ marginTop:2 }}>
                  {LAYOUT_LABELS[cat.layout]?.label || cat.layout}
                </Tag>
              </div>
            </Space>
            <Space>
              {/* Nút lên/xuống */}
              <Button size="small" icon={<ArrowUpOutlined/>}   disabled={i===0}                     onClick={()=>moveUp(i)}/>
              <Button size="small" icon={<ArrowDownOutlined/>} disabled={i===categories.length-1}   onClick={()=>moveDown(i)}/>
              {i >= 3
                ? <Button size="small" danger icon={<DeleteOutlined/>} onClick={()=>handleDelete(cat,i)}/>
                : <Tooltip title="Danh mục mặc định — không thể xóa"><Button size="small" disabled icon={<DeleteOutlined/>}/></Tooltip>
              }
            </Space>
          </div>
        </Card>
      ))}

      {/* Info */}
      <Card style={{ marginTop:16, background:"#f6f3ea", border:"none" }}>
        <div style={{ display:"flex", gap:12 }}>
          <InfoCircleOutlined style={{ color:"#815500", fontSize:16, marginTop:2 }}/>
          <div style={{ fontSize:13, color:"#555", lineHeight:1.8 }}>
            <div><strong>Layout theo vị trí:</strong></div>
            <div>• <Tag color="blue" style={{margin:"2px 4px"}}>Bento Grid</Tag> — Signature Phở: click item → đổi ảnh, có herb circle + quote card</div>
            <div>• <Tag color="green" style={{margin:"2px 4px"}}>Dark Section</Tag> — Beyond the Broth: nền xanh đậm, ảnh lớn bên phải</div>
            <div>• <Tag color="purple" style={{margin:"2px 4px"}}>Stamp Cards</Tag> — Tất cả danh mục còn lại: 3 card có ảnh, stamp effect</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
