import { branchStockBarChartRequest } from "@/apis/statistics/stocksStatistics/stocksStatistics";
import { BranchStockBarCharSearchParams } from "@/dtos/statistics/stocksStatistics/repuest/BranchStockBarCharSearchParams";
import { BranchStockBarChartResponseDto } from "@/dtos/statistics/stocksStatistics/response/BranchStockBarChart.response.dto";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { NavLink } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function BranchStockStatistics() {
  const [cookies] = useCookies(["accessToken"]);
  const token = cookies.accessToken;
  const [searchForm, setSearchForm] = useState<BranchStockBarCharSearchParams>({
    year: 0,
    month: 0,
  });
  const [form, setForm] = useState<BranchStockBarChartResponseDto[]>([]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month] = e.target.value.split("-");
    setSearchForm({
      year: parseInt(year),
      month: parseInt(month),
    });
  };

  const onSearchClick = async () => {
    if (!token) {
      alert("인증 토큰이 없습니다.");
    }

    const response = await branchStockBarChartRequest(searchForm, token);
    const { code, message, data } = response;

    if (code == "SU" && data) {
      setForm(data);
    } else {
      console.error(message);
    }
  };

  return (
    <div>
      <div>
        <h2>재고 통계</h2>
        <div>
          {[
            { to: "/statistics/stocks/branch", label: "지점별" },
            { to: "/statistics/stocks/category", label: "카테고리별" },
            {
              to: "/statistics/stocks/time",
              label: "월별",
            },
            { to: "/statistics/stocks/zero", label: "재고 개수별" },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#265185" : "#f0f0f0",
                color: isActive ? "white" : "#333",
                padding: "10px 20px",
                borderRadius: 6,
                textDecoration: "none",
                fontWeight: isActive ? "bold" : "normal",
                transition: "background-color 0.3s",
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
      <div>
        <h3>지점별 입고량 및 출고량</h3>
        <div className="filters">
          <div className="filter-left">
            <input
              type="month"
              value={`${searchForm.year}-${searchForm.month
                .toString()
                .padStart(2, "0")}`}
              onChange={onInputChange}
              className="input-search"
            />
            <button onClick={onSearchClick} className="searchBtn">
              검색
            </button>
          </div>
        </div>
      </div>

      <div>
        <div style={{ height: 700 }}>
          <ResponsiveContainer>
            <BarChart data={form}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="branchName"
                interval={0}
                angle={-25}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="inAmount"
                stackId="a"
                fill="#4CAF50"
                name="입고량"
              />
              <Bar
                dataKey="outAmount"
                stackId="b"
                fill="#FF9800"
                name="출고량"
              />
              <Bar
                dataKey="lossAmount"
                stackId="c"
                fill="#9E9E9E"
                name="손실량"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default BranchStockStatistics;
