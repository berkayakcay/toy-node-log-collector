import React from "react";
import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  FileOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import ReportsPage from "./ReportsPage";
import AnalyticsPage from "./AnalyticsPage";
import { otelLogger } from "./logger";
import { context as otelContext, trace } from "@opentelemetry/api";

const { Header, Sider, Content } = Layout;

const mockOperation = async () => {
  // Simulate an async operation
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const handleMenuClick = (e: any) => {
 const tracerInstance = trace.getTracer('your-react-app-tracer');
    const span = tracerInstance.startSpan('button-click');

  otelContext.with(trace.setSpan(otelContext.active(), span), () => {
    
    otelLogger.info("User clicked the button", {
      component: "Button",
      action: "click",
      userId: "user123",
      pageUrl: window.location.href,
    });

    mockOperation().finally(() => {
      span.end();
    });
  });
};

const LayoutComponent: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={200} className="site-layout-background">
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          style={{ height: "100%", borderRight: 0 }}
        >
          <Menu.Item key="1" onClick={handleMenuClick} icon={<HomeOutlined />}>
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="2" onClick={handleMenuClick} icon={<FileOutlined />}>
            <Link to="/reports">Reports</Link>
          </Menu.Item>
          <Menu.Item
            key="3"
            onClick={handleMenuClick}
            icon={<BarChartOutlined />}
          >
            <Link to="/analytics">Analytics</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <div
            style={{ color: "white", fontSize: "24px", paddingLeft: "16px" }}
          >
            OpenTelemetry Demo
          </div>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;
