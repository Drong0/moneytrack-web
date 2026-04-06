import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { formatMoney, formatDayFull, groupByDate } from '../lib/format'
import IconCircle from '../components/IconCircle'
import type { Category, Transaction } from '../types/database'

type Period = 'all' | 'month' | 'year'

const PERIOD_LABELS: Record<Period, string> = {
  all: 'Весь период',
  month: 'Этот месяц',
  year: 'Этот год',
}

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [category, setCategory] = useState<Category | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [period, setPeriod] = useState<Period>('all')
  const [loading, setLoading] = useState(true)
  const [showPeriodMenu, setShowPeriodMenu] = useState(false)
  const [selected, setSelected] = useState<Transaction | null>(null)

  useEffect(() => {
    if (!user || !id) return
    loadData()
  }, [user, id, period])

  const loadData = async () => {
    setLoading(true)

    const { data: cat } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    if (cat) setCategory(cat as Category)

    let query = supabase
      .from('transactions')
      .select('*, category:categories(*), account:accounts!transactions_account_id_fkey(*)')
      .eq('category_id', id)
      .order('date', { ascending: false })

    if (period === 'month') {
      const start = new Date()
      start.setDate(1); start.setHours(0, 0, 0, 0)
      query = query.gte('date', start.toISOString())
    } else if (period === 'year') {
      const start = new Date(new Date().getFullYear(), 0, 1)
      query = query.gte('date', start.toISOString())
    }

    const { data: txns, error } = await query
    if (error) console.error('CategoryDetail txns error:', error)
    if (txns) setTransactions(txns as Transaction[])
    setLoading(false)
  }

  const handleDelete = async (txn: Transaction) => {
    if (!confirm('Отменить транзакцию?')) return
    await supabase.from('transactions').delete().eq('id', txn.id)
    setTransactions(prev => prev.filter(t => t.id !== txn.id))
    setSelected(null)
  }

  const total = transactions.reduce((s, t) => s + Number(t.amount), 0)
  const avgPerDay = (() => {
    if (!transactions.length) return 0
    const dates = new Set(transactions.map(t => t.date.slice(0, 10)))
    return total / dates.size
  })()
  const grouped = groupByDate(transactions)

  if (loading) return <div className="loading-screen">Загрузка...</div>
  if (!category) return <div className="loading-screen">Категория не найдена</div>

  return (
    <div className="page" style={{ paddingTop: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: '#1a1a28', border: 'none', color: '#fff', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronLeft size={22} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{category.name}</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Category icon + total */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <IconCircle iconKey={category.icon_name} color={category.color_hex} size="lg" />
        <div style={{ fontSize: 36, fontWeight: 700 }}>{formatMoney(total)}</div>

        {/* Period selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPeriodMenu(p => !p)}
            style={{ background: '#1a1a28', border: 'none', color: '#aaa', fontSize: 14, padding: '8px 16px', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {PERIOD_LABELS[period]} ▾
          </button>
          {showPeriodMenu && (
            <div style={{ position: 'absolute', top: 44, left: '50%', transform: 'translateX(-50%)', background: '#1a1a28', borderRadius: 14, overflow: 'hidden', zIndex: 10, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => { setPeriod(p); setShowPeriodMenu(false) }}
                  style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: period === p ? '#007AFF' : '#fff', fontSize: 14, textAlign: 'left', cursor: 'pointer', fontWeight: period === p ? 600 : 400 }}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="analytics-summary" style={{ marginBottom: 20 }}>
        <div className="analytics-summary-item">
          <div className="analytics-summary-label neutral">Операций</div>
          <div className="analytics-summary-val">{transactions.length}</div>
        </div>
        <div className="analytics-summary-item">
          <div className={`analytics-summary-label ${category.type === 'expense' ? 'expense' : 'income'}`}>
            {category.type === 'expense' ? 'Расход' : 'Доход'}
          </div>
          <div className={`analytics-summary-val ${category.type === 'expense' ? 'expense' : 'income'}`}>
            {formatMoney(total)}
          </div>
        </div>
        <div className="analytics-summary-item">
          <div className="analytics-summary-label neutral">В день</div>
          <div className="analytics-summary-val">{formatMoney(Math.round(avgPerDay))}</div>
        </div>
      </div>

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <div className="empty-state">Нет операций за выбранный период</div>
      ) : (
        <>
          <div className="txn-section-title">Список операций</div>
          {Object.entries(grouped).map(([dateKey, txns]) => {
            const daySum = txns.reduce((s, t) => s + Number(t.amount), 0)
            return (
              <div key={dateKey}>
                <div className="day-header-row">
                  <span>{formatDayFull(txns[0].date)}</span>
                  <span className={`day-header-sum ${category.type === 'income' ? 'income' : 'expense'}`}>
                    {category.type === 'income' ? '+' : '−'}{formatMoney(daySum)}
                  </span>
                </div>
                {txns.map(txn => (
                  <div key={txn.id} className="transaction-row" onClick={() => setSelected(txn)}>
                    <div className="transaction-left">
                      <IconCircle iconKey={category.icon_name} color={category.color_hex} size="sm" />
                      <div>
                        <div className="transaction-category">{category.name}</div>
                        <div className="transaction-note">
                          {txn.account?.name ?? ''}
                          {txn.note ? (txn.account ? ` / ${txn.note}` : txn.note) : ''}
                        </div>
                      </div>
                    </div>
                    <div className={`transaction-amount ${txn.type}`}>
                      {txn.type === 'income' ? '+' : '−'}{formatMoney(Number(txn.amount))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </>
      )}

      {/* Delete sheet */}
      {selected && (
        <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="sheet-content">
            <div className="sheet-handle" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <IconCircle iconKey={category.icon_name} color={category.color_hex} size="lg" />
              <div style={{ fontSize: 28, fontWeight: 700 }}>{formatMoney(Number(selected.amount))}</div>
              <div style={{ color: '#888', fontSize: 14 }}>
                {new Date(selected.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              {selected.note && <div style={{ color: '#ccc', fontSize: 14 }}>{selected.note}</div>}
            </div>
            <button className="btn-danger" onClick={() => handleDelete(selected)}>
              Отменить транзакцию
            </button>
            <button className="btn-secondary" onClick={() => setSelected(null)} style={{ marginTop: 10 }}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
