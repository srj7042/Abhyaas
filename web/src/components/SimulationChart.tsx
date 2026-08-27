import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface SimulationChartProps {
  data: any[]
}

export default function SimulationChart({ data }: SimulationChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="hours" stroke="#64748b" fontSize={12} tickLine={false} label={{ value: 'Weekly Hours', position: 'insideBottom', offset: -5, fill: '#64748b' }} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} label={{ value: 'Target Months', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b' }} />
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
        <Bar dataKey="months" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
