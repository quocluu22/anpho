import { AntdRegistry } from "@ant-design/nextjs-registry";
import SessionWrapper from "../components/SessionWrapper";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <SessionWrapper>
            {children}
          </SessionWrapper>
        </AntdRegistry>
      </body>
    </html>
  );
}