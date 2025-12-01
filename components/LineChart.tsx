import React from 'react';

const LineChart = ({ data }: { data: { name: string, Revenue: number }[] }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
    }

    const width = 500;
    const height = 300;
    const padding = 40;

    const maxValue = Math.max(...data.map(p => p.Revenue));
    const yAxisMax = Math.ceil(maxValue / 1000) * 1000;

    const getX = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
    const getY = (value: number) => height - padding - (value / yAxisMax) * (height - 2 * padding);

    const linePath = data.map((point, index) => {
        const x = getX(index);
        const y = getY(point.Revenue);
        return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = (yAxisMax / 4) * i;
        return {
            value: value,
            y: getY(value)
        };
    });

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Y-Axis Grid Lines and Labels */}
            {yAxisLabels.map(label => (
                <g key={label.value}>
                    <line
                        x1={padding}
                        y1={label.y}
                        x2={width - padding}
                        y2={label.y}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                    />
                    <text
                        x={padding - 10}
                        y={label.y + 3}
                        textAnchor="end"
                        fontSize="10"
                        fill="#6b7280"
                    >
                        ${(label.value / 1000)}k
                    </text>
                </g>
            ))}
            
            {/* X-Axis Labels */}
            {data.map((point, index) => (
                <text
                    key={index}
                    x={getX(index)}
                    y={height - padding + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                >
                    {point.name}
                </text>
            ))}

            {/* Data Line */}
            <path
                d={linePath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Data Points */}
            {data.map((point, index) => (
                <circle
                    key={index}
                    cx={getX(index)}
                    cy={getY(point.Revenue)}
                    r="3"
                    fill="#2563eb"
                    stroke="white"
                    strokeWidth="2"
                />
            ))}
        </svg>
    );
};

export default LineChart;