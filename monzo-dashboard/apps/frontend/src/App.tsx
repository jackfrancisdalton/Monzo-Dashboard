import type { MonzoTransaction } from '@repo/monzo-types';
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
import { ResponsiveGeoMap } from '@nivo/geo';

function App() {
  const { balance, transactions } = useMonzoData();
  const [features, setFeatures] = useState<any[]>([]);
  
  const lineData = useMemo(() => computeCumulativeLineData(transactions), [transactions]);
  const treeMapData = useMemo(() => computeTreeMapData(transactions), [transactions]);
  

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
        <CardWrapper title="Spending over time" className="col-span-2">
          <ResponsiveLine
            data={lineData}
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear' }}
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


        {(features && features.length > 0) && (
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
        )}


      </CardLayout>
    </AppLayout>
  )
}

export default App
