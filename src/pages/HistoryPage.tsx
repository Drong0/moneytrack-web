import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { formatMoney, formatMonthFull, formatDayFull, groupByDate, getMonthRange } from '../lib/format'
import IconCircle from '../components/IconCircle'
import type { Transaction } from '../types/database'

function TransactionSheet({
  txn,
  onClose,
  onDeleted,
}: {
  txn: Transaction
  onClose: () => void
  onDeleted: (id: string) => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    setDeleting(true)
    setError(null)
    const { error: dbError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', txn.id)
    setDeleting(false)
    if (dbError) { setError(dbError.message); return }
    onDeleted(txn.id)
    onClose()
  }

  const typeLabel = txn.type === 'income' ? 'Доход' : txn.type === 'expense' ? 'Расход' : 'Перевод'
  const amountColor = txn.type === 'income' ? '#4cd964' : txn.type === 'expense' ? '#ff3b30' : '#007AFF'
  const sign = txn.type === 'income' ? '+' : txn.type === 'expense' ? '−' : ''

  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet-content">
        <div className="sheet-handle" />

        {/* Icon + amount */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <IconCircle
            iconKey={txn.type === 'transfer' ? 'transfer' : (txn.category?.icon_name ?? 'other')}
            color={txn.category?.color_hex ?? '#444'}
            size="lg"
          />
          <div style={{ fontSize: 32, fontWeight: 700, color: amountColor }}>
            {sign}{formatMoney(Number(txn.amount))}
          </div>
          <div style={{ fontSize: 16, color: '#ccc' }}>
            {txn.type === 'transfer' ? 'Перевод' : txn.category?.name ?? 'Без категории'}
          </div>
        </div>

        {/* Details */}
        <div style={{ background: '#14141e', borderRadius: 14, marginBottom: 20 }}>
          <Row label="Тип" value={typeLabel} />
          <Row label="Счёт" value={txn.account?.name ?? '—'} />
          <Row label="Дата" value={new Date(txn.date).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })} last={!txn.note} />
          {txn.note && <Row label="Заметка" value={txn.note} last />}
        </div>

        {error && (
          <div style={{
            background: '#3a1a1a', border: '1px solid #ff3b30', borderRadius: 12,
            padding: '10px 14px', color: '#ff3b30', fontSize: 14, marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        <button className="btn-danger" onClick={handleCancel} disabled={deleting}>
          {deleting ? 'Отмена...' : 'Отменить транзакцию'}
        </button>
        <button className="btn-secondary" onClick={onClose} style={{ marginTop: 10 }}>
          Закрыть
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 16px',
      borderBottom: last ? 'none' : '1px solid #1e1e2e',
    }}>
      <span style={{ color: '#888', fontSize: 14 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Transaction | null>(null)

  useEffect(() => {
    if (!user) return
    loadTransactions()
  }, [user, currentDate])

  const loadTransactions = async () => {
    setLoading(true)
    const { start, end } = getMonthRange(currentDate)
    const { data } = await supabase
      .from('transactions')
      .select('*, category:categories(*), account:accounts!transactions_account_id_fkey(*)')
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())
      .order('date', { ascending: false })
    if (data) setTransactions(data as Transaction[])
    setLoading(false)
  }

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear()

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const saldo = totalIncome - totalExpense
  const grouped = groupByDate(transactions)

  if (loading) return <div className="loading-screen">Загрузка...</div>

  return (
    <div className="page">
      <div className="month-nav">
        <button className="month-nav-btn" onClick={prevMonth}>‹</button>
        <button className="month-nav-title">{formatMonthFull(currentDate)} ▾</button>
        <button className="month-nav-btn" onClick={nextMonth} disabled={isCurrentMonth}>›</button>
      </div>

      <div className="saldo-block">
        <div className="saldo-label">сальдо</div>
        <div className={`saldo-amount ${saldo > 0 ? 'income' : saldo < 0 ? 'expense' : 'neutral'}`}>
          {saldo >= 0 ? '' : '−'}{formatMoney(Math.abs(saldo))}
        </div>
      </div>

      <div className="summary-pair">
        <div className="summary-pair-card">
          <div className="sp-label">Поступления</div>
          <div className="sp-amount income">{formatMoney(totalIncome)}</div>
        </div>
        <div className="summary-pair-card">
          <div className="sp-label">Списания</div>
          <div className="sp-amount expense">{formatMoney(totalExpense)}</div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">Нет операций за этот месяц</div>
      ) : (
        <>
          <div className="txn-section-title">Список операций</div>
          {Object.entries(grouped).map(([dateKey, txns]) => {
            const daySum = txns.reduce(
              (s, t) => t.type === 'expense' ? s - Number(t.amount) : t.type === 'income' ? s + Number(t.amount) : s,
              0,
            )
            return (
              <div key={dateKey}>
                <div className="day-header-row">
                  <span>{formatDayFull(txns[0].date)}</span>
                  <span className={`day-header-sum ${daySum >= 0 ? 'income' : 'expense'}`}>
                    {daySum >= 0 ? '+' : '−'}{formatMoney(Math.abs(daySum))}
                  </span>
                </div>
                {txns.map(txn => (
                  <div key={txn.id} className="transaction-row" onClick={() => setSelected(txn)}>
                    <div className="transaction-left">
                      <IconCircle
                        iconKey={txn.type === 'transfer' ? 'transfer' : (txn.category?.icon_name ?? 'other')}
                        color={txn.category?.color_hex ?? '#444'}
                        size="sm"
                      />
                      <div>
                        <div className="transaction-category">
                          {txn.type === 'transfer' ? 'Перевод' : txn.category?.name ?? 'Без категории'}
                        </div>
                        <div className="transaction-note">
                          {txn.account?.name ?? ''}
                          {txn.note ? (txn.account ? ` / ${txn.note}` : txn.note) : ''}
                        </div>
                      </div>
                    </div>
                    <div className={`transaction-amount ${txn.type}`}>
                      {txn.type === 'income' ? '+' : txn.type === 'expense' ? '−' : ''}
                      {formatMoney(Number(txn.amount))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </>
      )}

      {selected && (
        <TransactionSheet
          txn={selected}
          onClose={() => setSelected(null)}
          onDeleted={id => setTransactions(prev => prev.filter(t => t.id !== id))}
        />
      )}
    </div>
  )
}
