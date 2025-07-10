import { useState } from "react";
import { useMonzoData } from "../hooks/useMonzoData";
import { TimeRangePicker } from "../components/TimeRangePicker";
import AppLayout from "../layouts/AppLayout";
import CardLayout from "../layouts/CardLayout";
import CardWrapper from "../components/CardWrapper";
import { ResponsiveLine } from "@nivo/line";
import TopEntitiesCard from "../components/TopEntitiesCard";
import DisplayCard from "../components/DisplayCard";
import { ResponsiveTreeMap } from "@nivo/treemap";
import { ResponsivePie } from "@nivo/pie";

function DashboardPage() {
  const [dateRange, setDateRange] = useState<{ start: Date, end: Date }>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return { start: sevenDaysAgo, end: today };
  });

  const { dashboardSummary } = useMonzoData(dateRange);

  // TODO: review if geo card is worth while, likely not that useful in retrospect, remove json too if case
  // useEffect(() => {
  //   fetch('/geo/world.json')
  //     .then((res) => res.json())
  //     .then((data) => setFeatures(data.features));
  // }, []);

  const generateHeader = () => {
    return (
      // Add an account picker here so that user can select the account they are viewing
      // Add in small cards for todays spend, and current balance
      <TimeRangePicker
        onChange={(dateRange) => { setDateRange(dateRange); }}
      ></TimeRangePicker>
    );
  };

  return (
    <AppLayout headerComponent={generateHeader()}>
      <CardLayout>
        <CardWrapper title="Spending over time" className="col-span-3 row-span-2">
          <ResponsiveLine
            data={dashboardSummary?.spendingOverTimeLineData ?? []}
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear' }}
          />
        </CardWrapper>

        <CardWrapper title="Spending by category" className="col-span-1 row-span-2">
          <ResponsivePie
            data={dashboardSummary?.spendingByCategoryPieData ?? []}
            margin={{ top: 20, right: 40, bottom: 60, left: 40 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={{ scheme: 'nivo' }}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          />
        </CardWrapper>

        <CardWrapper title="Merchant Spending" className="col-span-2 row-span-2">
          <ResponsiveTreeMap
            data={dashboardSummary?.spendingByDescriptionTreeMap ?? { name: 'root', children: [] }}
            identity="name"
            value="value"
            innerPadding={3}
            outerPadding={3}
            labelSkipSize={12}
            label={(node) => `${node.id} (£${node.value.toFixed(0)})`}
            colors={{ scheme: 'nivo' }}
            borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
          />
        </CardWrapper>

        {/* TODO: add card for known (ignore unknown) biggest spends by merchant */}

        {/* Potentially remove these or move them to header as they are confusing as they are not time relevant*/}
        <CardWrapper className="col-span-1 row-span-1">
          <DisplayCard title="Total Spend" value={dashboardSummary?.balance.balance ?? "N/A"} colorClass="text-green-600"></DisplayCard>
        </CardWrapper>
        <CardWrapper className="col-span-1 row-span-1">
          <DisplayCard title="Spend Today" value={dashboardSummary?.balance.spend_today ?? "N/A"} colorClass="text-red-600"></DisplayCard>
        </CardWrapper>

        <CardWrapper title="Top Items" className="col-span-2 row-span-1">
          <TopEntitiesCard
            items={dashboardSummary?.topTransactions ?? []}
            getLabel={(tx) => tx.merchantName ?? tx.description}
            getValue={(tx) => new Date(tx.created).toLocaleDateString()}
            getPercent={(tx) => (Math.abs(tx.amount) / (dashboardSummary?.totalSpending ?? 1)) * 100}
          />
        </CardWrapper>
      </CardLayout>
    </AppLayout>
  );
}

export default DashboardPage;
