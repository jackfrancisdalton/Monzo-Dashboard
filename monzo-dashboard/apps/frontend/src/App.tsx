import './App.css'
import { useMonzoData } from './Hooks/monzo-data.hook';
import { ResponsiveLine } from '@nivo/line'
import { ResponsiveTreeMap } from '@nivo/treemap';
import CardWrapper from './DashboardCards/CardWrapper';
import CardLayout from './Layouts/CardLayout';
import AppLayout from './Layouts/AppLayout';
import DisplayCard from './DashboardCards/DisplayCard';
import { computeCumulativeLineData } from './Mappers';
import { computeTreeMapData } from './Mappers/transactions-to-tree-map';
import { useEffect, useMemo, useState } from 'react';
import { ResponsivePie } from '@nivo/pie';

import TopEntitiesCard from './DashboardCards/TopEntitiesCard';
import { computePieData } from './Mappers/transactions-to-pie-map';


function App() {
  const { balance, transactions } = useMonzoData();
  const [features, setFeatures] = useState<any[]>([]);
  
  const lineData = useMemo(() => computeCumulativeLineData(transactions), [transactions]);
  const treeMapData = useMemo(() => computeTreeMapData(transactions), [transactions]);
  const pieChart = useMemo(() => computePieData(transactions) ,[transactions])

  const totalSpending = useMemo(() => transactions.reduce((acc, tx) => acc + Math.abs(tx.amount), 0), [transactions]);
  const topTenTransactions = useMemo(() => [...transactions]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 10), [transactions]);

  useEffect(() => {
    fetch('/geo/world.json')
        .then(res => res.json())
        .then(data => setFeatures(data.features))
  }, [])

  // const points = transactions
  //   .filter(tx => tx.merchant?.address)
  //   .map(tx => ({
  //       id: tx.id,
  //       coordinates: [
  //           tx.merchant?.address?.longitude ?? 0,
  //           tx.merchant?.address?.latitude ?? 0
  //       ],
    // }));

  return (
    <AppLayout>
      <CardLayout>
        <CardWrapper title="Spending over time" className="col-span-3 row-span-2">
          <ResponsiveLine
            data={lineData}
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear' }}
          />
        </CardWrapper>

        <CardWrapper title="Spending by category" className="col-span-1 row-span-2">
          <ResponsivePie
            data={pieChart}
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
            // tooltip={({ datum }) => (
            //   <div className="p-2 text-sm">
            //     <strong>{datum.label}</strong>: £{(datum.value / 100).toFixed(2)}
            //     <br />
            //     {((datum.value / total) * 100).toFixed(1)}% of total
            //   </div>
            // )}
          />
        </CardWrapper>

        <CardWrapper title="Merchant Spending" className="col-span-2 row-span-2">
          <ResponsiveTreeMap
            data={treeMapData}
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
          <DisplayCard
            title='Total Spend'
            value={`£1234.55`}
            colorClass="text-green-600"
          ></DisplayCard>
        </CardWrapper>

        <CardWrapper className="col-span-1 row-span-1">
          <DisplayCard
            title='Target Spend'
            value={`£1820.00`}
            colorClass="text-red-600"
          ></DisplayCard>
        </CardWrapper>

        <CardWrapper title="Top Items" className="col-span-2 row-span-1">  
          <TopEntitiesCard
            items={topTenTransactions}
            getLabel={(tx) => tx.merchant?.name ?? tx.description}
            getValue={(tx) => new Date(tx.created).toLocaleDateString()}
            getPercent={(tx) => (Math.abs(tx.amount) / totalSpending * 100)}
          />
        </CardWrapper>

        {/* {(features && features.length > 0) && (
          <CardWrapper title="spending by location" className="col-span-4 row-span-2">
            <ResponsiveGeoMap
                features={features}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                fillColor="#eeeeee"
                borderWidth={0.5}
                borderColor="#333333"
                enableGraticule={true}
                graticuleLineColor="#666666"
            />
          </CardWrapper>
        )} */}

      </CardLayout>
    </AppLayout>
  )
}

export default App
