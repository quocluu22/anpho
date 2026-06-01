"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Table, Tag, Select, Button, DatePicker, Space, Statistic,
  Row, Col, Card, message, Typography, Calendar, Drawer,
  Descriptions, Form, Input, Divider, Badge,
} from "antd";
import {
  ReloadOutlined, CalendarOutlined, UnorderedListOutlined,
  BellOutlined, EyeOutlined, EditOutlined,
} from "@ant-design/icons";
import { adminApi } from "../../lib/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const STATUS = {
  Pending:   { color: "orange",  label: "Pending" },
  Confirmed: { color: "blue",    label: "Confirmed" },
  Done:      { color: "green",   label: "Done" },
  Cancelled: { color: "red",     label: "Cancelled" },
};

const TIMES = [
  "11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM",
  "5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM",
];

const fmtDate = v => v ? dayjs(v).isValid() ? dayjs(v).format("MMM D, YYYY") : String(v) : "—";
const fmtTime = v => v ? String(v) : "—";

export default function ReservationsPage() {
  const [rows,    setRows]    = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState("list");
  const [fDate,   setFDate]   = useState(null);
  const [fStatus, setFStatus] = useState("all");
  const [newCnt,  setNewCnt]  = useState(0);
  const [drawer,  setDrawer]  = useState(false);
  const [sel,     setSel]     = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form]                = Form.useForm();
  const sinceRef = useRef(new Date().toISOString());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([adminApi.getReservations(), adminApi.getStats()]);
      setRows(Array.isArray(r) ? r : []);
      setStats(s);
    } catch { message.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  const poll = useCallback(async () => {
    try {
      const d = await adminApi.pollReservations(sinceRef.current);
      if (d.hasNew && d.bookings?.length > 0) {
        const existed = new Set(rows.map(r => r._row));
        const fresh = d.bookings.filter(r => !existed.has(r._row));
        if (fresh.length > 0) {
          setRows(prev => [...fresh, ...prev]);
          setNewCnt(c => c + fresh.length);
          message.info(`🍜 ${fresh.length} new reservation!`);
          sinceRef.current = new Date().toISOString();
        }
      }
    } catch (_) {}
  }, [rows]);

  useEffect(() => {
    load();
    const t = setInterval(poll, 30000);
    return () => clearInterval(t);
  }, [load]);

  const update = async (record, updates) => {
    setRows(prev => prev.map(r => r._row === record._row ? { ...r, ...updates } : r));
    if (sel?._row === record._row) setSel(s => ({ ...s, ...updates }));
    try {
      await adminApi.updateReservation({ _row: record._row, clientName: record.Name, service: record.Party || "", date: record.Date, time: record.Time, ...updates });
    } catch { message.error("Failed"); load(); }
  };

  const saveEdit = async () => {
    let v; try { v = await form.validateFields(); } catch { return; }
    setSaving(true);
    try {
      await update(sel, {
        date:   v.date   ? dayjs(v.date).format("YYYY-MM-DD") : sel.Date,
        time:   v.time   || sel.Time,
        status: v.status || sel.Status,
        location: v.location || sel.Location || "",
      });
      message.success("Updated!");
      setEditing(false);
    } finally { setSaving(false); }
  };

  const openDetail = r => { setSel(r); setEditing(false); setDrawer(true); };
  const openEdit   = r => {
    setSel(r);
    form.setFieldsValue({ date: r.Date ? dayjs(r.Date) : null, time: r.Time || "", status: r.Status || "Pending", location: r.Location || "" });
    setEditing(true); setDrawer(true);
  };

  const filtered = rows.filter(r => {
    const dOk = !fDate   || String(r.Date) === fDate.format("YYYY-MM-DD");
    const sOk = fStatus === "all" || r.Status === fStatus;
    return dOk && sOk;
  });

  const columns = [
    {
      title: "Date & Time", width: 160,
      render: (_, r) => <div><div style={{ fontWeight:600 }}>{fmtDate(r.Date)}</div><div style={{ color:"#888", fontSize:12 }}>{fmtTime(r.Time)}</div></div>,
      sorter: (a, b) => String(a.Date).localeCompare(String(b.Date)),
    },
    {
      title: "Guest", width: 180,
      render: (_, r) => <div><div style={{ fontWeight:600 }}>{r.Name}</div><div style={{ color:"#888", fontSize:12 }}>{r.Phone}</div></div>,
    },
    { title: "Party",    dataIndex: "Party",    width: 130 },
    { title: "Location", dataIndex: "Location", width: 160 },
    {
      title: "Status", width: 160,
      render: (_, r) => (
        <Select size="small" style={{ width:140 }} value={r.Status || "Pending"}
          options={Object.keys(STATUS).map(s => ({ value:s, label:<Tag color={STATUS[s].color}>{s}</Tag> }))}
          onChange={v => update(r, { status:v })}
          onClick={e => e.stopPropagation()}
        />
      ),
    },
    {
      title: "", width: 80, fixed: "right",
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EyeOutlined/>}  onClick={() => openDetail(r)}/>
          <Button size="small" icon={<EditOutlined/>}  onClick={() => openEdit(r)}/>
        </Space>
      ),
    },
  ];

  const cellRender = date => {
    const ds = date.format("YYYY-MM-DD");
    const items = rows.filter(r => String(r.Date) === ds || dayjs(String(r.Date)).format("YYYY-MM-DD") === ds);
    if (!items.length) return null;
    return (
      <ul style={{ listStyle:"none", padding:0, margin:0 }}>
        {items.slice(0,3).map((r,i) => (
          <li key={i} style={{ cursor:"pointer" }} onClick={() => openDetail(r)}>
            <Tag color={STATUS[r.Status]?.color||"default"} style={{ fontSize:10, padding:"0 4px", maxWidth:"100%", overflow:"hidden", textOverflow:"ellipsis" }}>
              {fmtTime(r.Time)} {r.Name}
            </Tag>
          </li>
        ))}
        {items.length > 3 && <li><Text type="secondary" style={{ fontSize:10 }}>+{items.length-3}</Text></li>}
      </ul>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <Space>
          <Title level={4} style={{ margin:0 }}>Reservations</Title>
          {newCnt > 0 && (
            <Badge count={newCnt} onClick={() => setNewCnt(0)} style={{ cursor:"pointer" }}>
              <BellOutlined style={{ fontSize:20, color:"#815500" }}/>
            </Badge>
          )}
          <Text type="secondary" style={{ fontSize:12 }}>Auto-refresh 30s</Text>
        </Space>
        <Space>
          <Button icon={view==="list" ? <CalendarOutlined/> : <UnorderedListOutlined/>}
            onClick={() => setView(v => v==="list" ? "calendar" : "list")}>
            {view==="list" ? "Calendar" : "List"}
          </Button>
          <Button icon={<ReloadOutlined/>} onClick={load}>Refresh</Button>
        </Space>
      </div>

      {/* Stats */}
      {stats && (
        <Row gutter={[12,12]} style={{ marginBottom:20 }}>
          {[
            ["Today",      stats.today,     ""],
            ["This Week",  stats.thisWeek,  ""],
            ["This Month", stats.thisMonth, ""],
            ["Total",      stats.total,     ""],
            ["Pending",    stats.pending,   "#d46b08"],
            ["Confirmed",  stats.confirmed, "#1677ff"],
            ["Done",       stats.done||0,   "#389e0d"],
            ["Revenue",    stats.revenueMonth, "#815500"],
          ].map(([title, value, color]) => (
            <Col key={title} xs={12} sm={6} md={3}>
              <Card size="small">
                <Statistic title={title} value={value}
                  prefix={title==="Revenue" ? "$" : undefined}
                  valueStyle={color ? { color, fontSize:20 } : { fontSize:20 }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Table / Calendar */}
      {view === "list" ? (
        <Card>
          <Space style={{ marginBottom:16 }} wrap>
            <DatePicker placeholder="Filter by date" onChange={setFDate} allowClear/>
            <Select value={fStatus} onChange={setFStatus} style={{ width:150 }}
              options={[{ value:"all", label:"All status" }, ...Object.keys(STATUS).map(s => ({ value:s, label:<Tag color={STATUS[s].color}>{s}</Tag> }))]}
            />
          </Space>
          <Table
            rowKey="_row" columns={columns} dataSource={filtered} loading={loading}
            size="small" scroll={{ x:900 }}
            pagination={{ pageSize:20, showTotal: t => `${t} reservations` }}
            rowClassName={r => r.Status === "Pending" ? "pending-row" : ""}
            onRow={r => ({ onClick: () => openDetail(r) })}
          />
        </Card>
      ) : (
        <Card><Calendar cellRender={cellRender}/></Card>
      )}

      {/* Drawer */}
      <Drawer
        title={editing ? "Edit Reservation" : "Reservation Detail"}
        placement="right" width={420} open={drawer}
        onClose={() => { setDrawer(false); setEditing(false); }}
      >
        {sel && !editing && (
          <>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <Tag color={STATUS[sel.Status]?.color||"default"} style={{ fontSize:16, padding:"6px 20px", borderRadius:20 }}>
                {sel.Status || "Pending"}
              </Tag>
            </div>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="👤 Guest">{sel.Name}</Descriptions.Item>
              <Descriptions.Item label="📞 Phone">{sel.Phone}</Descriptions.Item>
              <Descriptions.Item label="✉️ Email">{sel.Email || "—"}</Descriptions.Item>
              <Descriptions.Item label="👥 Party">{sel.Party || "—"}</Descriptions.Item>
              <Descriptions.Item label="📍 Location">{sel.Location || "—"}</Descriptions.Item>
              <Descriptions.Item label="📅 Date">{fmtDate(sel.Date)}</Descriptions.Item>
              <Descriptions.Item label="🕐 Time">{fmtTime(sel.Time)}</Descriptions.Item>
              <Descriptions.Item label="📝 Notes">{sel.Notes || "—"}</Descriptions.Item>
            </Descriptions>
            <Divider>Actions</Divider>
            <Space direction="vertical" style={{ width:"100%" }}>
              <Button block icon={<EditOutlined/>} onClick={() => {
                form.setFieldsValue({ date: sel.Date ? dayjs(sel.Date) : null, time: sel.Time, status: sel.Status, location: sel.Location || "" });
                setEditing(true);
              }}>Edit Details</Button>
              {Object.keys(STATUS).filter(s => s !== sel.Status).map(s => (
                <Button key={s} block
                  type={s==="Done" ? "primary" : "default"}
                  danger={s==="Cancelled"}
                  style={s==="Confirmed" ? { borderColor:"#1677ff", color:"#1677ff" } : {}}
                  onClick={() => { update(sel, { status:s }); message.success(`Marked as ${s}`); }}
                >
                  Mark as {s}
                </Button>
              ))}
            </Space>
          </>
        )}
        {sel && editing && (
          <Form form={form} layout="vertical">
            <Form.Item name="status" label="Status">
              <Select options={Object.keys(STATUS).map(s => ({ value:s, label:<Tag color={STATUS[s].color}>{s}</Tag> }))}/>
            </Form.Item>
            <Form.Item name="date" label="Date">
              <DatePicker style={{ width:"100%" }}/>
            </Form.Item>
            <Form.Item name="time" label="Time">
              <Select options={TIMES.map(t => ({ value:t, label:t }))}/>
            </Form.Item>
            <Form.Item name="location" label="Location">
              <Input placeholder="Elk Grove (Main)"/>
            </Form.Item>
            <Space style={{ width:"100%", justifyContent:"flex-end" }}>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="primary" loading={saving} onClick={saveEdit}
                style={{ background:"#815500", borderColor:"#815500" }}>
                Save
              </Button>
            </Space>
          </Form>
        )}
      </Drawer>

      <style>{`
        .pending-row { background: #fffbe6 !important; }
        .ant-table-row { cursor: pointer; }
        .ant-table-row:hover td { background: #fdf9f0 !important; }
      `}</style>
    </div>
  );
}
