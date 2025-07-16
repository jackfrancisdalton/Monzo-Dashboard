import { useEffect, useState } from "react";
import { useMonzoData } from "../hooks/useMonzoData";
import AppLayout from "../layouts/AppLayout";
import CardLayout from "../layouts/CardLayout";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { ResponsivePie } from "@nivo/pie";
import { useSearchParams } from "react-router-dom";
import {
  CardWrapper,
  DisplayCard,
  DropDownPicker,
  TimeRangePicker,
  TopEntitiesCard,
} from "../components";
import React from "react";
import { differenceInDays, differenceInMonths } from "date-fns";

const MemoLineChart = React.memo(ResponsiveLine);
const MemoPieChart = React.memo(ResponsivePie);
const MemoTreeMap = React.memo(ResponsiveTreeMap);

function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return { start: sevenDaysAgo, end: today };
  });

  const {
    accounts,
    selectedAccount,
    setSelectedAccount,
    dashboardSummary,
    loadingData,
  } = useMonzoData({ start: dateRange.start, end: dateRange.end });

  // On initial load, check URL params for account and date range
  useEffect(() => {
    const accountFromUrl = searchParams.get("account"); // TODO: change to CONSTS
    const startFromUrl = searchParams.get("start");
    const endFromUrl = searchParams.get("end");

    if (accountFromUrl) {
      setSelectedAccount(accountFromUrl);
    }

    if (startFromUrl && endFromUrl) {
      setDateRange({ start: new Date(startFromUrl), end: new Date(endFromUrl) });
    }
  }, []);

  // Sync param changes to URL
  useEffect(() => {
    if (!selectedAccount || !dateRange) return;

    setSearchParams({
      account: selectedAccount,
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    });
  }, [selectedAccount, dateRange]);

  const calculateTickValues = () => {
    const daysDiff = differenceInDays(dateRange.end, dateRange.start);
    if (daysDiff <= 14) {
      return "every 1 day";
    } else if (daysDiff <= 32) {
      return "every 2 days";
    } else if (daysDiff <= 365) {
      return "every 1 month";
    } else {
      return "every 2 months";
    }
  };

  const generateHeader = () => {
    return (
      <>
        <TimeRangePicker
          onChange={(dateRange) => {
            setDateRange(dateRange);
          }}
          disabled={loadingData}
        />
        <DropDownPicker
          options={accounts}
          dropDownLabel="Select Account"
          getValue={(account) => account.id}
          getLabel={(account) => account.description}
          onChange={(account) => {
            setSelectedAccount(account?.id ?? null);
          }}
          layoutClassName="float-right"
          disabled={loadingData}
        ></DropDownPicker>
      </>
    );
  };

  return (
    <AppLayout
      headerComponent={generateHeader()}
      showLoadingOverlay={loadingData}
    >
      {/* Display Cards */}
      <CardLayout>
        <CardWrapper
          title="Credit/Debit over time"
          className="col-span-4 row-span-2"
        >
          <MemoLineChart
            data={dashboardSummary?.creditAndDebitOverTimeLineData ?? []}
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            colors={["#ff4d4f", "#52c41a"]} // Updated to brighter and more modern red and green
            xScale={{
              type: "time",
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              precision: "day",
              min: "auto",
              max: "auto",
            }}
            xFormat="time:%d/%m/%Y"
            yScale={{ type: "linear" }}
            axisBottom={{
              format: "%d/%m/%Y",
              tickValues: calculateTickValues(),
            }}
            legends={[
              {
                anchor: "top-left",
                direction: "column",
                translateX: 20,
                translateY: 12,
                itemWidth: 80,
                itemHeight: 22,
                symbolShape: "circle",
              },
            ]}
          />
        </CardWrapper>

        <CardWrapper className="col-span-1 row-span-1">
          <DisplayCard
            title="Total In"
            value={`£${dashboardSummary?.totalCredit ?? 0}`}
            colorClass="text-green-600"
          />
        </CardWrapper>

        {/* Top Entity Cards */}
        <CardWrapper title="Top Credits" className="col-span-1 row-span-1">
          <TopEntitiesCard
            items={dashboardSummary?.topCredits ?? []}
            getLabel={(tx) => tx.label}
            getValue={(tx) => `£${tx.amount}`}
            getDate={(tx) => new Date(tx.date)}
          />
        </CardWrapper>
        <CardWrapper className="col-span-1 row-span-1">
          <DisplayCard
            title="Total Out"
            value={`£${dashboardSummary?.totalDebit ?? 0}`}
            colorClass="text-red-600"
          />
        </CardWrapper>
        <CardWrapper title="Top Debits" className="col-span-1 row-span-1">
          <TopEntitiesCard
            items={dashboardSummary?.topDebits ?? []}
            getLabel={(tx) => tx.label}
            getValue={(tx) => `£${tx.amount}`}
            getDate={(tx) => new Date(tx.date)}
          />
        </CardWrapper>

        {/* Pie Diagrams */}
        <CardWrapper
          title="Credit by category"
          className="col-span-2 row-span-2"
        >
          <MemoPieChart
            data={dashboardSummary?.creditsByCategoryPieData ?? []}
            margin={{ top: 20, right: 40, bottom: 60, left: 40 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={{ scheme: "nivo" }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            arcLabel={(d) => `£${d.value.toFixed(2)}`} // TODO: move to backend
          />
        </CardWrapper>
        <CardWrapper
          title="Debit by category"
          className="col-span-2 row-span-2"
        >
          <MemoPieChart
            data={dashboardSummary?.debitsByCategoryPieData ?? []}
            margin={{ top: 20, right: 40, bottom: 60, left: 40 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={{ scheme: "nivo" }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            arcLabel={(d) => `£${d.value.toFixed(2)}`} // TODO: move to backend
          />
        </CardWrapper>

        {/* Tree Diagrams */}
        <CardWrapper title="Credits Tree" className="col-span-2 row-span-2">
          <MemoTreeMap
            data={
              dashboardSummary?.creditsByDescriptionTreeMap ?? {
                name: "root",
                children: [],
              }
            }
            identity="name"
            value="value"
            innerPadding={3}
            outerPadding={3}
            labelSkipSize={12}
            label={(node) => `${node.id} (£${node.value.toFixed(0)})`}
            colors={{ scheme: "nivo" }}
            borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
          />
        </CardWrapper>
        <CardWrapper title="Debits Tree" className="col-span-2 row-span-2">
          <MemoTreeMap
            data={
              dashboardSummary?.debitsByDescriptionTreeMap ?? {
                name: "root",
                children: [],
              }
            }
            identity="name"
            value="value"
            innerPadding={3}
            outerPadding={3}
            labelSkipSize={12}
            label={(node) => `${node.id} (£${node.value.toFixed(0)})`}
            colors={{ scheme: "nivo" }}
            borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
          />
        </CardWrapper>
      </CardLayout>
    </AppLayout>
  );
}

export default DashboardPage;
