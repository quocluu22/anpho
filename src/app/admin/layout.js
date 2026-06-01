"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Typography, Badge } from "antd";
import {
  CalendarOutlined, FileImageOutlined, StarOutlined,
  InfoCircleOutlined, SearchOutlined, SettingOutlined,
  LogoutOutlined, UserOutlined, AppstoreOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, FileTextOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const NAV = [
  { key: "/admin",               icon: <CalendarOutlined/>,       label: "Reservations" },
  { key: "/admin/categories",     icon: <UnorderedListOutlined/>,  label: "Categories" },
  { key: "/admin/menu",           icon: <AppstoreOutlined/>,       label: "Menu Items" },
  { key: "/admin/gallery",       icon: <FileImageOutlined/>,   label: "Gallery" },
  { key: "/admin/reviews",       icon: <StarOutlined/>,        label: "Reviews" },
  { key: "/admin/content",       icon: <FileTextOutlined/>,    label: "Page Content" },
  { key: "/admin/about",         icon: <InfoCircleOutlined/>,  label: "Our Story" },
  { key: "/admin/seo",           icon: <SearchOutlined/>,      label: "SEO & Social" },
  { key: "/admin/settings",      icon: <SettingOutlined/>,     label: "Settings" },
];

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (status === "loading") {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#fdf9f0" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"Georgia,serif", fontSize:40, fontStyle:"italic", color:"#815500", marginBottom:8 }}>AN PHỞ</div>
          <div style={{ color:"#888", fontSize:13 }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") router.replace("/login");
    return null;
  }

  const currentPage = NAV.find(n => n.key === pathname)?.label || "Dashboard";

  const userMenu = {
    items: [
      { key:"email", label: <span style={{ fontSize:12, color:"#888" }}>{session?.user?.email}</span>, disabled: true },
      { type:"divider" },
      {
        key:"logout", icon: <LogoutOutlined/>, label: "Sign out",
        onClick: () => signOut({ callbackUrl: "/login" }),
        danger: true,
      },
    ],
  };

  return (
    <Layout style={{ minHeight:"100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        collapsedWidth={64}
        trigger={null}
        style={{
          background: "#061b0e",
          position: "fixed", left: 0, top: 0, bottom: 0,
          zIndex: 100, overflow: "auto",
          boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
        }}
      >
        {/* Logo */}
        <div style={{
          padding: collapsed ? "20px 8px" : "24px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          textAlign: collapsed ? "center" : "left",
          transition: "all 0.2s",
        }}>
          <div style={{
            fontFamily: "Georgia,serif", fontWeight: 700,
            fontSize: collapsed ? 18 : 24, fontStyle: "italic",
            color: "#ffb22e", letterSpacing: "-0.01em",
            whiteSpace: "nowrap", overflow: "hidden",
          }}>
            {collapsed ? "A" : "AN PHỞ"}
          </div>
          {!collapsed && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>
              Admin Dashboard
            </div>
          )}
        </div>

        {/* Nav */}
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          onClick={({ key }) => router.push(key)}
          items={NAV}
          style={{ background: "transparent", border: "none", marginTop: 8 }}
          theme="dark"
        />

        {/* Collapse button */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute", bottom: 20, left: 0, right: 0,
            display: "flex", justifyContent: "center",
            color: "rgba(255,255,255,0.4)", fontSize: 16, cursor: "pointer",
            padding: "8px",
          }}
        >
          {collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
        </div>
      </Sider>

      {/* Main */}
      <Layout style={{ marginLeft: collapsed ? 64 : 220, transition: "margin 0.2s" }}>
        {/* Top bar */}
        <Header style={{
          background: "#fff", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid #f0ede5", height: 56,
          position: "sticky", top: 0, zIndex: 99,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <Text style={{ fontSize: 15, fontWeight: 600, color: "#061b0e" }}>
            {currentPage}
          </Text>
          <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
            <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"4px 8px", borderRadius:6, transition:"background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f5f0e8"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Avatar
                src={session?.user?.image}
                icon={!session?.user?.image && <UserOutlined/>}
                size={32}
                style={{ background: "#815500" }}
              />
              <Text style={{ fontSize: 13, fontWeight: 500 }}>
                {session?.user?.name?.split(" ")[0]}
              </Text>
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content style={{ padding: 24, background: "#fafaf8", minHeight: "calc(100vh - 56px)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
