import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Skeleton from '../Skeleton/Skeleton';

export const LoanoutChartSkeleton = ({ height = 280, className = '' }) => {
    return (
        <div
            className={`loanout-chart-skeleton ${className}`.trim()}
            style={{
                width: '100%',
                height,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '16px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxSizing: 'border-box'
            }}
            role="status"
            aria-label="Loading chart"
        >
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '80%', gap: '12px', paddingBottom: '16px' }}>
                {[65, 40, 85, 50, 75, 45, 90].map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', flex: 1, height: '100%', justifyContent: 'center' }}>
                        <Skeleton variant="rounded" width="40%" height={`${h}%`} style={{ borderRadius: '6px 6px 0 0' }} />
                        <Skeleton variant="rounded" width="40%" height={`${Math.max(20, h - 25)}%`} style={{ borderRadius: '6px 6px 0 0', opacity: 0.6 }} />
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
                    <Skeleton key={i} variant="text" width={40} height={12} />
                ))}
            </div>
        </div>
    );
};

// #region Sample data
const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];
// #endregion

const LoanoutChart = ({ loading = false, height = 280 }) => {
    if (loading) {
        return <LoanoutChartSkeleton height={height} />;
    }

    return (
        <BarChart
            style={{ width: '100%', aspectRatio: 2.5 }}
            responsive
            data={data}
            margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis width="auto" />
            <Tooltip />
            <Legend />
            <Bar dataKey="pv" fill="#8884d8" activeBar={{ fill: '#6e6bad', stroke: '#39375c' }} radius={[10, 10, 0, 0]} />
            <Bar dataKey="uv" fill="#82ca9d" activeBar={{ fill: '#5c9472', stroke: '#284433' }} radius={[10, 10, 0, 0]} />
        </BarChart>
    );
};

LoanoutChart.Skeleton = LoanoutChartSkeleton;

export { LoanoutChartSkeleton };
export default LoanoutChart;