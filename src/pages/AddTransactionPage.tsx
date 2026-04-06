import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import IconCircle from '../components/IconCircle'
import type { Category, Account, TransactionType } from '../types/database'

const TYPE_LABELS: Record<TransactionType, string> = {
  expense: 'Расход',
  income: 'Доход',
  transfer: 'Перевод',
}

export default function AddTransactionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('0')
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [selectedToAccount, setSelectedToAccount] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user, type])

  const loadData = async () => {
    if (type !== 'transfer') {
      const catType = type === 'expense' ? 'expense' : 'income'
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('type', catType)
        .eq('is_archived', false)
        .order('sort_order')
      if (data) setCategories(data as Category[])
    }

    const { data: accs } = await supabase
      .from('accounts')
      .select('*')
      .order('sort_order')
    if (accs) {
      setAccounts(accs as Account[])
      setSelectedAccount(prev => prev ?? accs[0]?.id ?? null)
    }
  }

  const handleKey = (key: string) => {
    if (key === 'C') {
      setAmount('0')
    } else if (key === '⌫') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0')
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount(prev => prev + '.')
    } else if (key === '=') {
      try {
        const result = Function('"use strict"; return (' + amount + ')')()
        setAmount(String(Math.round(result * 100) / 100))
      } catch { /* ignore */ }
    } else if (['+', '-', '×', '÷'].includes(key)) {
      const op = key === '×' ? '*' : key === '÷' ? '/' : key
      setAmount(prev => prev + op)
    } else {
      setAmount(prev => prev === '0' ? key : prev + key)
    }
  }

  const handleSave = async () => {
    setError(null)
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) { setError('Введите сумму больше нуля'); return }
    if (!selectedAccount) { setError('Выберите счёт'); return }
    if (type !== 'transfer' && !selectedCategory) { setError('Выберите категорию'); return }
    if (type === 'transfer' && !selectedToAccount) { setError('Выберите счёт получателя'); return }

    setSaving(true)
    const { error: dbError } = await supabase.from('transactions').insert({
      user_id: user!.id,
      amount: numAmount,
      type,
      category_id: type === 'transfer' ? null : selectedCategory,
      account_id: selectedAccount,
      to_account_id: type === 'transfer' ? selectedToAccount : null,
      date: new Date().toISOString(),
      note: note || null,
      is_recurring: false,
      recurring_rule: null,
    } as Record<string, unknown>)
    setSaving(false)

    if (dbError) {
      setError('Ошибка сохранения: ' + dbError.message)
      return
    }
    navigate('/')
  }

  const KEYS = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['.', '0', '⌫', '+'],
  ]

  return (
    <div className="page" style={{ paddingBottom: 320 }}>
      <div className="chip-row" style={{ marginBottom: 16 }}>
        {(['expense', 'income', 'transfer'] as TransactionType[]).map(t => (
          <button
            key={t}
            className={`chip ${type === t ? 'active' : ''}`}
            onClick={() => setType(t)}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Account selector */}
      <div className="card">
        <div className="card-title">{type === 'transfer' ? 'Откуда' : 'Счёт'}</div>
        <div className="chip-row">
          {accounts.map(acc => (
            <button
              key={acc.id}
              className={`chip ${selectedAccount === acc.id ? 'active' : ''}`}
              onClick={() => setSelectedAccount(acc.id)}
            >
              {acc.name}
            </button>
          ))}
        </div>
      </div>

      {type === 'transfer' && (
        <div className="card">
          <div className="card-title">Куда</div>
          <div className="chip-row">
            {accounts.filter(a => a.id !== selectedAccount).map(acc => (
              <button
                key={acc.id}
                className={`chip ${selectedToAccount === acc.id ? 'active' : ''}`}
                onClick={() => setSelectedToAccount(acc.id)}
              >
                {acc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category selector */}
      {type !== 'transfer' && (
        <div className="card">
          <div className="card-title">Категория</div>
          <div className="category-grid">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-item ${selectedCategory === cat.id ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <IconCircle
                  iconKey={cat.icon_name}
                  color={selectedCategory === cat.id ? cat.color_hex : cat.color_hex + '60'}
                  size="sm"
                />
                <span className="category-label">{cat.name}</span>
              </button>
            ))}
          </div>
          {categories.length === 0 && (
            <div className="empty-state">
              <p>Нет категорий. Добавьте в настройках.</p>
            </div>
          )}
        </div>
      )}

      {/* Note */}
      <input
        className="inline-input"
        placeholder="Заметка (необязательно)"
        value={note}
        onChange={e => setNote(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      {error && (
        <div style={{
          background: '#3a1a1a', border: '1px solid #ff3b30', borderRadius: 12,
          padding: '10px 14px', color: '#ff3b30', fontSize: 14, marginBottom: 12,
        }}>
          {error}
        </div>
      )}

      {/* Calculator */}
      <div className="calculator">
        <div className="calc-display">
          {amount} <span style={{ color: '#888', fontSize: 16 }}>KZT</span>
        </div>
        <div className="calc-grid">
          {KEYS.flat().map(key => (
            <button
              key={key}
              className={`calc-key ${['+', '-', '×', '÷'].includes(key) ? 'operator' : ''}`}
              onClick={() => handleKey(key)}
            >
              {key}
            </button>
          ))}
          <button className="calc-key" onClick={() => handleKey('C')}>C</button>
          <button className="calc-key" onClick={() => handleKey('00')}>00</button>
          <button className="calc-key" onClick={() => handleKey('=')}>{'='}</button>
          <button
            className="calc-key confirm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '...' : '✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
