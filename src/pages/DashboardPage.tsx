import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { formatMoney } from '../lib/format'
import IconCircle from '../components/IconCircle'
import type { Account, Category } from '../types/database'

type Period = 'all' | 'week' | 'month' | 'year'

const PERIOD_LABELS: Record<Period, string> = {
  all: 'ВЕСЬ ПЕРИОД',
  week: 'НЕДЕЛЯ',
  month: 'МЕСЯЦ',
  year: 'ГОД',
}

function getPeriodRange(period: Period, offset = 0): { start: Date | null; end: Date | null; label: string } {
  const now = new Date()

  if (period === 'all') return { start: null, end: null, label: 'ВЕСЬ ПЕРИОД' }

  if (period === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay() + 1 + offset * 7)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    const label = offset === 0 ? 'НЕДЕЛЯ' :
      `${start.getDate()} ${start.toLocaleDateString('ru-RU', { month: 'short' })} – ${end.getDate()} ${end.toLocaleDateString('ru-RU', { month: 'short' })}`
    return { start, end, label }
  }

  if (period === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
    const label = d.toLocaleDateString('ru-RU', { month: 'long' }).toUpperCase()
    return { start, end, label }
  }

  if (period === 'year') {
    const y = now.getFullYear() + offset
    const start = new Date(y, 0, 1)
    const end = new Date(y, 11, 31, 23, 59, 59, 999)
    return { start, end, label: String(y) }
  }

  return { start: null, end: null, label: 'ВЕСЬ ПЕРИОД' }
}

interface TxnEntry {
  amount: number
  type: string
  category_id: string | null
  account_id: string | null
  to_account_id: string | null
}

function QuickIncomeSheet({
  category, accounts, userId, onClose, onSaved,
}: {
  category: Category; accounts: Account[]; userId: string; onClose: () => void; onSaved: () => void
}) {
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    const num = parseFloat(amount)
    if (!num || num <= 0) { setError('Введите сумму'); return }
    if (!accountId) { setError('Выберите счёт'); return }
    setSaving(true)
    const { error: dbError } = await supabase.from('transactions').insert({
      user_id: userId, amount: num, type: 'income',
      category_id: category.id, account_id: accountId,
      to_account_id: null, date: new Date().toISOString(),
      note: null, is_recurring: false, recurring_rule: null,
    } as Record<string, unknown>)
    setSaving(false)
    if (dbError) { setError(dbError.message); return }
    onSaved(); onClose()
  }

  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet-content">
        <div className="sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <IconCircle iconKey={category.icon_name} color={category.color_hex} size="md" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{category.name}</div>
            <div style={{ fontSize: 13, color: '#888' }}>Доход</div>
          </div>
        </div>
        <input
          className="inline-input" placeholder="Сумма" type="number" inputMode="decimal"
          value={amount} onChange={e => setAmount(e.target.value)}
          style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }} autoFocus
        />
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>На счёт</div>
          <div className="chip-row">
            {accounts.map(acc => (
              <button key={acc.id} className={`chip ${accountId === acc.id ? 'active' : ''}`} onClick={() => setAccountId(acc.id)}>
                {acc.name}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <div style={{ background: '#3a1a1a', border: '1px solid #ff3b30', borderRadius: 12, padding: '10px 14px', color: '#ff3b30', fontSize: 14, marginBottom: 12 }}>
            {error}
          </div>
        )}
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение...' : 'Добавить доход'}
        </button>
      </div>
    </div>
  )
}

function PeriodSelector({ period, offset, onSelect, onOffset }: {
  period: Period; offset: number
  onSelect: (p: Period) => void; onOffset: (d: number) => void
}) {
  const [open, setOpen] = useState(false)
  const { label } = getPeriodRange(period, offset)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
      {period !== 'all' && (
        <button className="month-nav-btn" onClick={() => onOffset(offset - 1)}>‹</button>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        {label} ▾
      </button>

      {period !== 'all' && (
        <button className="month-nav-btn" onClick={() => onOffset(offset + 1)} disabled={offset >= 0}>›</button>
      )}

      {open && (
        <div style={{
          position: 'absolute', top: 44, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a28', borderRadius: 14, overflow: 'hidden', zIndex: 50,
          minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => { onSelect(p); setOpen(false) }}
              style={{
                display: 'block', width: '100%', padding: '13px 20px',
                background: 'none', border: 'none', textAlign: 'left',
                color: period === p ? '#007AFF' : '#fff',
                fontWeight: period === p ? 700 : 400, fontSize: 15, cursor: 'pointer',
                borderBottom: p !== 'year' ? '1px solid #2a2a3a' : 'none',
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [periodTxns, setPeriodTxns] = useState<TxnEntry[]>([])
  const [allTxns, setAllTxns] = useState<TxnEntry[]>([])
  const [period, setPeriod] = useState<Period>('all')
  const [offset, setOffset] = useState(0)
  const [quickIncomeCategory, setQuickIncomeCategory] = useState<Category | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [hideAmounts, setHideAmounts] = useState(() => localStorage.getItem('hideAmounts') === '1')

  const toggleHide = () => {
    const next = !hideAmounts
    setHideAmounts(next)
    localStorage.setItem('hideAmounts', next ? '1' : '0')
  }

  const mask = (val: string) => hideAmounts ? '•••••' : val

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user, period, offset])

  // Reset offset when period changes
  const handlePeriodChange = (p: Period) => {
    setPeriod(p)
    setOffset(0)
  }

  const handleOffsetChange = (newOffset: number) => {
    if (newOffset > 0) return // can't go to future
    setOffset(newOffset)
  }

  const loadData = async () => {
    const { start, end } = getPeriodRange(period, offset)

    let periodQuery = supabase
      .from('transactions')
      .select('amount, type, category_id, account_id, to_account_id')

    if (start) periodQuery = periodQuery.gte('date', start.toISOString())
    if (end) periodQuery = periodQuery.lte('date', end.toISOString())

    const [accsRes, catsRes, periodRes, allRes] = await Promise.all([
      supabase.from('accounts').select('*').order('sort_order'),
      supabase.from('categories').select('*').eq('is_archived', false).order('sort_order'),
      periodQuery,
      supabase.from('transactions').select('amount, type, category_id, account_id, to_account_id'),
    ])

    if (accsRes.data) setAccounts(accsRes.data as Account[])
    if (catsRes.data) setCategories(catsRes.data as Category[])
    if (periodRes.data) setPeriodTxns(periodRes.data as TxnEntry[])
    if (allRes.data) setAllTxns(allRes.data as TxnEntry[])
  }

  const getCatAmount = (catId: string) =>
    periodTxns.filter(t => t.category_id === catId).reduce((s, t) => s + Number(t.amount), 0)

  const getAccountBalance = (acc: Account): number => {
    const initial = Number(acc.initial_balance)
    const income = allTxns.filter(t => t.account_id === acc.id && t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expense = allTxns.filter(t => t.account_id === acc.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    const transferOut = allTxns.filter(t => t.account_id === acc.id && t.type === 'transfer').reduce((s, t) => s + Number(t.amount), 0)
    const transferIn = allTxns.filter(t => t.to_account_id === acc.id && t.type === 'transfer').reduce((s, t) => s + Number(t.amount), 0)
    return initial + income - expense - transferOut + transferIn
  }

  const totalBalance = accounts.filter(a => a.is_included_in_total).reduce((s, a) => s + getAccountBalance(a), 0)
  const totalIncome = periodTxns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = periodTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <div className="page">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-avatar">{user?.email?.[0]?.toUpperCase() ?? 'U'}</div>
        <PeriodSelector period={period} offset={offset} onSelect={handlePeriodChange} onOffset={handleOffsetChange} />
        <div style={{ position: 'relative' }}>
          <button
            className="dash-more-btn"
            onClick={() => setShowMenu(o => !o)}
          >•••</button>
          {showMenu && (
            <div style={{
              position: 'absolute', top: 40, right: 0,
              background: '#1a1a28', borderRadius: 16, padding: '8px 0',
              minWidth: 220, zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}>
              <div
                onClick={toggleHide}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', cursor: 'pointer',
                  borderBottom: '1px solid #2a2a3a',
                }}
              >
                <span style={{ fontSize: 15 }}>Скрыть суммы</span>
                <div style={{
                  width: 44, height: 26, borderRadius: 13,
                  background: hideAmounts ? '#007AFF' : '#3a3a4a',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 3,
                    left: hideAmounts ? 21 : 3,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s',
                  }} />
                </div>
              </div>
              <div
                onClick={() => setShowMenu(false)}
                style={{ padding: '14px 18px', cursor: 'pointer', fontSize: 15, color: '#888' }}
              >
                Закрыть
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Доходы — фильтруются по периоду */}
      {incomeCategories.length > 0 && (
        <>
          <div className="section-header">
            <span className="section-title">Доходы</span>
            <span className="section-total income">
              {mask(totalIncome > 0 ? `+${formatMoney(totalIncome)}` : formatMoney(0))}
            </span>
          </div>
          <div className="h-scroll">
            {incomeCategories.map(cat => (
              <div key={cat.id} className="cat-scroll-item" onClick={() => setQuickIncomeCategory(cat)}>
                <IconCircle iconKey={cat.icon_name} color={cat.color_hex} size="md" />
                <div className="cat-scroll-name">{cat.name}</div>
                <div className="cat-scroll-amount">{mask(formatMoney(getCatAmount(cat.id)))}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Кошельки — ВСЕГДА текущий баланс, не фильтруются */}
      {accounts.length > 0 && (
        <>
          <div className="section-header">
            <span className="section-title">Кошельки</span>
            <span className="section-total">{mask(formatMoney(totalBalance))}</span>
          </div>
          <div className="h-scroll">
            {accounts.map(acc => (
              <div key={acc.id} className="acc-card">
                <IconCircle
                  iconKey={acc.type === 'cash' ? 'cash' : acc.type === 'savings' ? 'savings' : 'card'}
                  color={acc.color_hex} size="sm"
                />
                <div className="acc-card-name">{acc.name}</div>
                <div className="acc-card-amount">{mask(formatMoney(getAccountBalance(acc), acc.currency))}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Расходы — фильтруются по периоду */}
      {expenseCategories.length > 0 && (
        <>
          <div className="section-header">
            <span className="section-title">Расходы</span>
            <span className="section-total expense">
              {mask(totalExpense > 0 ? formatMoney(totalExpense) : formatMoney(0))}
            </span>
          </div>
          <div className="expense-grid">
            {expenseCategories.map(cat => (
              <div key={cat.id} className="expense-grid-item" onClick={() => navigate(`/category/${cat.id}`)}>
                <IconCircle iconKey={cat.icon_name} color={cat.color_hex} size="sm" />
                <div className="cat-scroll-name">{cat.name}</div>
                <div className="cat-scroll-amount">{mask(formatMoney(getCatAmount(cat.id)))}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {accounts.length === 0 && categories.length === 0 && (
        <div className="empty-state"><p>Добавьте счета и категории в Настройках</p></div>
      )}

      {quickIncomeCategory && (
        <QuickIncomeSheet
          category={quickIncomeCategory} accounts={accounts}
          userId={user!.id} onClose={() => setQuickIncomeCategory(null)} onSaved={loadData}
        />
      )}
    </div>
  )
}
