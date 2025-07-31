import { LucideProps } from "lucide-react";

export const InfinitePageLoader = ({ size = 24, ...props }: LucideProps) => (
  <div
    id="loader"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100vw",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: -9999,
      backgroundColor: "transparent",
    }}
  >
    <svg
      style={{
        width: size,
        height: size,
        fill: "none",
        stroke: "#ffffff50",
        strokeWidth: 10,
        strokeDasharray: "205.271142578125 51.317785644531256",
        strokeLinecap: "round",
        transform: "scale(0.8)",
        transformOrigin: "50px 50px",
        animation: "infinite-spinner-rotate 2s linear infinite",
      }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      {...props}
    >
      <title>Loading...</title>
      <path
        className="infinite-spinner-path"
        d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
      />
    </svg>
  </div>
);
