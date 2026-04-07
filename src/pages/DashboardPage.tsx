import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { formatMoney, formatMonthUpper, getMonthRange } from '../lib/format'
import IconCircle from '../components/IconCircle'
import type { Account, Category } from '../types/database'

function QuickIncomeSheet({
  category,
  accounts,
  userId,
  onClose,
  onSaved,
}: {
  category: Category
  accounts: Account[]
  userId: string
  onClose: () => void
  onSaved: () => void
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
      user_id: userId,
      amount: num,
      type: 'income',
      category_id: category.id,
      account_id: accountId,
      to_account_id: null,
      date: new Date().toISOString(),
      note: null,
      is_recurring: false,
      recurring_rule: null,
    } as Record<string, unknown>)
    setSaving(false)
    if (dbError) { setError(dbError.message); return }
    onSaved()
    onClose()
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
          className="inline-input"
          placeholder="Сумма"
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}
          autoFocus
        />

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>На счёт</div>
          <div className="chip-row">
            {accounts.map(acc => (
              <button
                key={acc.id}
                className={`chip ${accountId === acc.id ? 'active' : ''}`}
                onClick={() => setAccountId(acc.id)}
              >
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

interface TxnEntry {
  amount: number
  type: string
  category_id: string | null
  account_id: string | null
  to_account_id: string | null
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [monthTxns, setMonthTxns] = useState<TxnEntry[]>([])
  const [allTxns, setAllTxns] = useState<TxnEntry[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [quickIncomeCategory, setQuickIncomeCategory] = useState<Category | null>(null)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user, currentDate])

  const loadData = async () => {
    const { start, end } = getMonthRange(currentDate)

    const [accsRes, catsRes, monthRes, allRes] = await Promise.all([
      supabase.from('accounts').select('*').order('sort_order'),
      supabase.from('categories').select('*').eq('is_archived', false).order('sort_order'),
      supabase
        .from('transactions')
        .select('amount, type, category_id, account_id, to_account_id')
        .gte('date', start.toISOString())
        .lte('date', end.toISOString()),
      supabase
        .from('transactions')
        .select('amount, type, category_id, account_id, to_account_id'),
    ])

    if (accsRes.data) setAccounts(accsRes.data as Account[])
    if (catsRes.data) setCategories(catsRes.data as Category[])
    if (monthRes.data) setMonthTxns(monthRes.data as TxnEntry[])
    if (allRes.data) setAllTxns(allRes.data as TxnEntry[])
  }

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  // Category amount for current month (from transaction journal)
  const getCatAmount = (catId: string) =>
    monthTxns
      .filter(t => t.category_id === catId)
      .reduce((s, t) => s + Number(t.amount), 0)

  // Per-account current balance from transaction journal
  const getAccountBalance = (acc: Account): number => {
    const initial = Number(acc.initial_balance)
    const income = allTxns
      .filter(t => t.account_id === acc.id && t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0)
    const expense = allTxns
      .filter(t => t.account_id === acc.id && t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0)
    const transferOut = allTxns
      .filter(t => t.account_id === acc.id && t.type === 'transfer')
      .reduce((s, t) => s + Number(t.amount), 0)
    const transferIn = allTxns
      .filter(t => t.to_account_id === acc.id && t.type === 'transfer')
      .reduce((s, t) => s + Number(t.amount), 0)
    return initial + income - expense - transferOut + transferIn
  }

  // Total balance across all included accounts
  const totalBalance = accounts
    .filter(a => a.is_included_in_total)
    .reduce((s, a) => s + getAccountBalance(a), 0)

  const totalIncome = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear()

  return (
    <div className="page">
      <div className="dash-header">
        <div className="dash-avatar">{user?.email?.[0]?.toUpperCase() ?? 'U'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="month-nav-btn" onClick={prevMonth}>‹</button>
          <span className="dash-month-btn">{formatMonthUpper(currentDate)} ▾</span>
          <button className="month-nav-btn" onClick={nextMonth} disabled={isCurrentMonth}>›</button>
        </div>
        <div className="dash-more-btn">•••</div>
      </div>

      {/* Доходы */}
      {incomeCategories.length > 0 && (
        <>
          <div className="section-header">
            <span className="section-title">Доходы</span>
            <span className="section-total income">
              {totalIncome > 0 ? `+${formatMoney(totalIncome)}` : formatMoney(0)}
            </span>
          </div>
          <div className="h-scroll">
            {incomeCategories.map(cat => (
              <div key={cat.id} className="cat-scroll-item" onClick={() => setQuickIncomeCategory(cat)}>
                <IconCircle iconKey={cat.icon_name} color={cat.color_hex} size="md" />
                <div className="cat-scroll-name">{cat.name}</div>
                <div className="cat-scroll-amount">{formatMoney(getCatAmount(cat.id))}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Кошельки — текущий баланс из журнала транзакций */}
      {accounts.length > 0 && (
        <>
          <div className="section-header">
            <span className="section-title">Кошельки</span>
            <span className="section-total">{formatMoney(totalBalance)}</span>
          </div>
          <div className="h-scroll">
            {accounts.map(acc => (
              <div key={acc.id} className="acc-card">
                <IconCircle
                  iconKey={acc.type === 'cash' ? 'cash' : acc.type === 'savings' ? 'savings' : 'card'}
                  color={acc.color_hex}
                  size="sm"
                />
                <div className="acc-card-name">{acc.name}</div>
                <div className="acc-card-amount">{formatMoney(getAccountBalance(acc), acc.currency)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Расходы */}
      {expenseCategories.length > 0 && (
        <>
          <div className="section-header">
            <span className="section-title">Расходы</span>
            <span className="section-total expense">
              {totalExpense > 0 ? formatMoney(totalExpense) : formatMoney(0)}
            </span>
          </div>
          <div className="expense-grid">
            {expenseCategories.map(cat => (
              <div key={cat.id} className="expense-grid-item" onClick={() => navigate(`/category/${cat.id}`)}>
                <IconCircle iconKey={cat.icon_name} color={cat.color_hex} size="sm" />
                <div className="cat-scroll-name">{cat.name}</div>
                <div className="cat-scroll-amount">{formatMoney(getCatAmount(cat.id))}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {accounts.length === 0 && categories.length === 0 && (
        <div className="empty-state">
          <p>Добавьте счета и категории в Настройках</p>
        </div>
      )}

      {quickIncomeCategory && (
        <QuickIncomeSheet
          category={quickIncomeCategory}
          accounts={accounts}
          userId={user!.id}
          onClose={() => setQuickIncomeCategory(null)}
          onSaved={loadData}
        />
      )}
    </div>
  )
}
