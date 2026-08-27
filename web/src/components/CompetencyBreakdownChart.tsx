import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts'

interface CompetencyBreakdownChartProps {
  data: any[]
  username: string
}

export default function CompetencyBreakdownChart({ data, username }: CompetencyBreakdownChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
        <Radar name={username} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
