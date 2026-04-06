import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { formatMoney, formatMonthFull, getMonthRange } from '../lib/format'
import IconCircle from '../components/IconCircle'
import type { Transaction } from '../types/database'

type Tab = 'expense' | 'both' | 'income'

const TABS: { key: Tab; label: string }[] = [
  { key: 'expense', label: 'Расходы' },
  { key: 'both', label: 'Доходы и расходы' },
  { key: 'income', label: 'Доходы' },
]

const RADIAN = Math.PI / 180

interface LabelProps {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
}

function PieLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: LabelProps) {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${Math.round(percent * 100)}%`}
    </text>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('expense')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user, currentDate])

  const loadData = async () => {
    const { start, end } = getMonthRange(currentDate)
    const { data } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())
      .order('date', { ascending: false })
    if (data) setTransactions(data as Transaction[])
  }

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear()

  const expenses = transactions.filter(t => t.type === 'expense')
  const incomes = transactions.filter(t => t.type === 'income')
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0)
  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0)
  const saldo = totalIncome - totalExpense

  const source = tab === 'expense' ? expenses : tab === 'income' ? incomes : [...expenses, ...incomes]

  const categoryTotals = source.reduce<
    Record<string, { name: string; value: number; color: string; icon: string; type: string }>
  >((acc, t) => {
    const id = t.category_id ?? 'other'
    if (!acc[id]) {
      acc[id] = {
        name: t.category?.name ?? 'Другое',
        value: 0,
        color: t.category?.color_hex ?? '#888',
        icon: t.category?.icon_name ?? 'other',
        type: t.type,
      }
    }
    acc[id].value += Number(t.amount)
    return acc
  }, {})

  const pieData = Object.values(categoryTotals).sort((a, b) => b.value - a.value)

  return (
    <div className="page">
      {/* Tabs */}
      <div className="segment-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`seg-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Month navigation */}
      <div className="month-nav">
        <button className="month-nav-btn" onClick={prevMonth}>‹</button>
        <button className="month-nav-title">{formatMonthFull(currentDate)} ▾</button>
        <button className="month-nav-btn" onClick={nextMonth} disabled={isCurrentMonth}>›</button>
      </div>

      {/* Donut chart */}
      {pieData.length > 0 ? (
        <>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                  label={(props) => <PieLabel {...props} />}
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a28', border: 'none', borderRadius: 8, color: '#fff' }}
                  formatter={(v) => formatMoney(Number(v))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary row */}
          <div className="analytics-summary">
            <div className="analytics-summary-item">
              <div className="analytics-summary-label income">Доходы</div>
              <div className="analytics-summary-val income">{formatMoney(totalIncome)}</div>
            </div>
            <div className="analytics-summary-item">
              <div className="analytics-summary-label expense">Расходы</div>
              <div className="analytics-summary-val expense">{formatMoney(totalExpense)}</div>
            </div>
            <div className="analytics-summary-item">
              <div className="analytics-summary-label neutral">Итого</div>
              <div className={`analytics-summary-val ${saldo >= 0 ? 'income' : 'expense'}`}>
                {saldo >= 0 ? '+' : '−'}{formatMoney(Math.abs(saldo))}
              </div>
            </div>
          </div>

          {/* Category grid */}
          <div className="cat-breakdown-grid">
            {pieData.map((cat, i) => (
              <div key={i} className="cat-breakdown-item">
                <IconCircle iconKey={cat.icon} color={cat.color} size="sm" />
                <div className="cat-breakdown-name">{cat.name}</div>
                <div className="cat-breakdown-amount">{formatMoney(cat.value)}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">Нет данных за этот месяц</div>
      )}
    </div>
  )
}
