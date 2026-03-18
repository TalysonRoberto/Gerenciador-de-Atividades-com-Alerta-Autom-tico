"use client"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function EvolucaoChart({ data }: { data: any[] }) {
  return (
    <div className="h-full w-full p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#4b5563', fontSize: 10, fontWeight: 'bold'}} 
          />
          <YAxis hide={true} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#161B26', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '10px' }}
            itemStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
            cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            name="Entrada"
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
          />
          <Area 
            type="monotone" 
            dataKey="resolvidos" 
            name="Resolvidos"
            stroke="#22c55e" 
            fill="transparent" 
            strokeWidth={2} 
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}