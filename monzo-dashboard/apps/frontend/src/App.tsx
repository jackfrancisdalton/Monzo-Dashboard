import './App.css';
import { useMonzoData } from './Hooks/useMonzoData';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveTreeMap } from '@nivo/treemap';
import CardWrapper from './DashboardCards/CardWrapper';
import CardLayout from './Layouts/CardLayout';
import AppLayout from './Layouts/AppLayout';
import DisplayCard from './DashboardCards/DisplayCard';
import { useState } from 'react';
import { ResponsivePie } from '@nivo/pie';

import TopEntitiesCard from './DashboardCards/TopEntitiesCard';
import { TimeRangePicker } from './UIComponents/TimeRangePicker';

function App() {
  const [dateRange, setDateRange] = useState<{ start: Date, end: Date }>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return { start: sevenDaysAgo, end: today };
  });

  const { dashboardSummary } = useMonzoData(dateRange);


  // useEffect(() => {
  //   fetch('/geo/world.json')
  //     .then((res) => res.json())
  //     .then((data) => setFeatures(data.features));
  // }, []);

  const generateHeader = () => {
    return (
      <TimeRangePicker
        onChange={(dateRange) => { setDateRange(dateRange); }}
      ></TimeRangePicker>
    );
  };

  return (
    <AppLayout headerComponent={generateHeader()}>
      <button onClick={() => {
        window.location.href = 'http://localhost:3000/auth/monzo/login';
      }}>
        Connect Monzo
      </button>
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
            data={dashboardSummary?.spendingByMerchantTreeMap ?? { name: 'root', children: [] }}
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

        <CardWrapper className="col-span-1 row-span-1">
          <DisplayCard title="Total Spend" value={`£1234.55`} colorClass="text-green-600"></DisplayCard>
        </CardWrapper>

        <CardWrapper className="col-span-1 row-span-1">
          <DisplayCard title="Target Spend" value={`£1820.00`} colorClass="text-red-600"></DisplayCard>
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

export default App;
