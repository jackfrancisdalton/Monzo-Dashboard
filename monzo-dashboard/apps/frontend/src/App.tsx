import type { MonzoTransaction } from '@repo/monzo-types';
import './App.css'
import { useMonzoData } from './Hooks/monzo-data.hook';
import { ResponsiveLine } from '@nivo/line'
import { ResponsiveTreeMap } from '@nivo/treemap';

function App() {
  const { balance, transactions } = useMonzoData();
  
  const computeCumulativeLineData = (transactions: MonzoTransaction[]): { id: string, data: { x: string, y: number }[] }[] => {
      const sorted = [...transactions].sort(
        (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
      )
    
      let runningTotal = 0
      const points = sorted.map(tx => {
        runningTotal += Math.abs(tx.amount)
        return {
          x: new Date(tx.created).toLocaleDateString(), // or keep as ISO string
          y: runningTotal
        }
      })
    
      return [
        {
          id: "Balance Over Time",
          data: points
        }
      ]
  }

  let data: { id: string, data: { x: string, y: number }[] }[] = [];
  data = computeCumulativeLineData(transactions || [])

  type TreemapNode = {
    name: string
    value: number
  }
  
  type TreemapData = {
    name: string
    children: TreemapNode[]
  }
  
  const buildTreemapData = (transactions: MonzoTransaction[]): TreemapData => {
    const totals = new Map<string, number>()
  
    for (const tx of transactions) {
      const name = tx.merchant?.name || "unknown";
      const current = totals.get(name) || 0
      totals.set(name, current + Math.abs(tx.amount)) // use absolute to show spending
    }
  
    const children = Array.from(totals.entries()).map(([name, total]) => ({
      name,
      value: total,
    }))
  
    return {
      name: "Transactions",
      children,
    }
  }

  const treemapData = buildTreemapData(transactions || []);

  return (
    <>
      <div style={{ height: '500px', width: '100%' }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', stacked: false, min: 'auto', max: 'auto' }}
          axisBottom={{ legend: 'Date', legendOffset: 36, legendPosition: 'middle' }}
          axisLeft={{ legend: 'Balance (£)', legendOffset: -40, legendPosition: 'middle' }}
          colors={{ scheme: 'category10' }}
          pointSize={8}
          pointBorderWidth={2}
          pointLabelYOffset={-12}
          useMesh={true}
        />
      </div>
      <div style={{ height: '500px', width: '100%' }}>
        <ResponsiveTreeMap
          data={treemapData}
          identity="name"
          value="value"
          innerPadding={3}
          outerPadding={3}
          labelSkipSize={12}
          label={(node) => `${node.id} (£${node.value.toFixed(0)})`}
          colors={{ scheme: 'nivo' }}
          borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
          animate
          motionConfig="gentle"
        />
      </div>
    </>
  )
}

export default App
