import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { COLORS as LEGACY_COLORS, accountTypeName } from '../lib/format'
import IconCircle from '../components/IconCircle'
import IconPickerSheet, { COLORS } from '../components/IconPickerSheet'
import type { Account, Category, AccountType, CategoryType } from '../types/database'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [catType, setCatType] = useState<CategoryType>('expense')

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    const [{ data: accs }, { data: cats }] = await Promise.all([
      supabase.from('accounts').select('*').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    if (accs) setAccounts(accs)
    if (cats) setCategories(cats)
  }

  return (
    <div className="page">
      <h1 className="page-title">Настройки</h1>

      {/* Accounts */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title">Счета</div>
          <button className="chip active" onClick={() => setShowAccountForm(true)}>+ Добавить</button>
        </div>
        {accounts.map(acc => (
          <div key={acc.id} className="account-row">
            <div className="account-info" style={{ cursor: 'pointer' }} onClick={() => setEditingAccount(acc)}>
              <IconCircle iconKey={acc.type === 'cash' ? 'cash' : acc.type === 'savings' ? 'savings' : 'card'} color={acc.color_hex} size="sm" />
              <div>
                <div className="account-name">{acc.name}</div>
                <div className="account-type">{accountTypeName(acc.type)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="chip" onClick={() => setEditingAccount(acc)}>Изменить</button>
              <button
                className="chip"
                onClick={async () => {
                  if (confirm(`Удалить счёт "${acc.name}"?`)) {
                    await supabase.from('accounts').delete().eq('id', acc.id)
                    setAccounts(prev => prev.filter(a => a.id !== acc.id))
                  }
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div className="card-title" style={{ margin: 0 }}>Категории</div>
          <button className="chip active" onClick={() => setShowCategoryForm(true)}>+ Добавить</button>
        </div>
        <div className="chip-row" style={{ marginBottom: 12 }}>
          <button className={`chip ${catType === 'expense' ? 'active' : ''}`} onClick={() => setCatType('expense')}>Расходы</button>
          <button className={`chip ${catType === 'income' ? 'active' : ''}`} onClick={() => setCatType('income')}>Доходы</button>
        </div>
        <div className="category-grid">
          {categories.filter(c => c.type === catType).map(cat => (
            <button
              key={cat.id}
              className="category-item"
              onClick={async () => {
                if (confirm(`Удалить категорию "${cat.name}"?`)) {
                  await supabase.from('categories').delete().eq('id', cat.id)
                  setCategories(prev => prev.filter(c => c.id !== cat.id))
                }
              }}
            >
              <IconCircle iconKey={cat.icon_name} color={cat.color_hex} size="sm" />
              <span className="category-label">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button className="btn-danger" onClick={signOut} style={{ marginTop: 20 }}>
        Выйти
      </button>

      {/* Add Account Sheet */}
      {showAccountForm && (
        <AddAccountSheet
          userId={user!.id}
          onClose={() => { setShowAccountForm(false); loadData() }}
        />
      )}

      {/* Edit Account Sheet */}
      {editingAccount && (
        <EditAccountSheet
          account={editingAccount}
          onClose={() => { setEditingAccount(null); loadData() }}
        />
      )}

      {/* Add Category Sheet */}
      {showCategoryForm && (
        <AddCategorySheet
          userId={user!.id}
          onClose={() => { setShowCategoryForm(false); loadData() }}
        />
      )}
    </div>
  )
}

function AddAccountSheet({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('debit')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState(LEGACY_COLORS[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('accounts').insert({
      user_id: userId,
      name,
      type,
      initial_balance: parseFloat(balance) || 0,
      color_hex: color,
      icon_name: type,
      currency: 'KZT',
      is_included_in_total: true,
      sort_order: 0,
    } as Record<string, unknown>)
    onClose()
  }

  const TYPES: { value: AccountType; label: string }[] = [
    { value: 'cash', label: 'Наличные' },
    { value: 'debit', label: 'Дебетовая' },
    { value: 'credit', label: 'Кредитная' },
    { value: 'savings', label: 'Накопительный' },
    { value: 'ewallet', label: 'Электронный' },
  ]

  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet-content">
        <div className="sheet-handle" />
        <h2 style={{ marginBottom: 16 }}>Новый счёт</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input className="inline-input" placeholder="Название" value={name} onChange={e => setName(e.target.value)} required />
          <div className="chip-row">
            {TYPES.map(t => (
              <button key={t.value} type="button" className={`chip ${type === t.value ? 'active' : ''}`} onClick={() => setType(t.value)}>
                {t.label}
              </button>
            ))}
          </div>
          <input className="inline-input" placeholder="Начальный баланс" type="number" value={balance} onChange={e => setBalance(e.target.value)} />
          <div className="chip-row">
            {LEGACY_COLORS.map(c => (
              <button key={c} type="button" style={{
                width: 32, height: 32, borderRadius: '50%', background: c, border: color === c ? '3px solid #fff' : '3px solid transparent',
                cursor: 'pointer', padding: 0, minWidth: 32,
              }} onClick={() => setColor(c)} />
            ))}
          </div>
          <button type="submit" className="btn-primary">Добавить</button>
        </form>
      </div>
    </div>
  )
}

function AddCategorySheet({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>('expense')
  const [icon, setIcon] = useState('food')
  const [color, setColor] = useState(COLORS[0])
  const [showIconPicker, setShowIconPicker] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('categories').insert({
      user_id: userId,
      name,
      type,
      icon_name: icon,
      color_hex: color,
      sort_order: 0,
      is_archived: false,
      parent_id: null,
    } as Record<string, unknown>)
    onClose()
  }

  if (showIconPicker) {
    return (
      <IconPickerSheet
        initialIcon={icon}
        initialColor={color}
        onConfirm={(newIcon, newColor) => { setIcon(newIcon); setColor(newColor) }}
        onClose={() => setShowIconPicker(false)}
      />
    )
  }

  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet-content">
        <div className="sheet-handle" />
        <h2 style={{ marginBottom: 16 }}>Новая категория</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input className="inline-input" placeholder="Название" value={name} onChange={e => setName(e.target.value)} required />
          <div className="chip-row">
            <button type="button" className={`chip ${type === 'expense' ? 'active' : ''}`} onClick={() => setType('expense')}>Расход</button>
            <button type="button" className={`chip ${type === 'income' ? 'active' : ''}`} onClick={() => setType('income')}>Доход</button>
          </div>
          <button
            type="button"
            onClick={() => setShowIconPicker(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#1e1e2e', border: 'none', borderRadius: 14, padding: '12px 16px', cursor: 'pointer', color: '#fff' }}
          >
            <IconCircle iconKey={icon} color={color} size="sm" />
            <span>Иконка и цвет</span>
          </button>
          <button type="submit" className="btn-primary">Добавить</button>
        </form>
      </div>
    </div>
  )
}

function EditAccountSheet({ account, onClose }: { account: Account; onClose: () => void }) {
  const [name, setName] = useState(account.name)
  const [balance, setBalance] = useState(String(account.initial_balance))
  const [color, setColor] = useState(account.color_hex)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('accounts').update({
      name,
      initial_balance: parseFloat(balance) || 0,
      color_hex: color,
    }).eq('id', account.id)
    onClose()
  }

  const handleDelete = async () => {
    if (confirm(`Удалить счёт "${account.name}"?`)) {
      await supabase.from('accounts').delete().eq('id', account.id)
      onClose()
    }
  }

  return (
    <div className="sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sheet-content">
        <div className="sheet-handle" />
        <h2 style={{ marginBottom: 16 }}>Изменить счёт</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input className="inline-input" placeholder="Название" value={name} onChange={e => setName(e.target.value)} required />
          <input className="inline-input" placeholder="Начальный баланс" type="number" value={balance} onChange={e => setBalance(e.target.value)} />
          <div className="chip-row">
            {LEGACY_COLORS.map(c => (
              <button key={c} type="button" style={{
                width: 32, height: 32, borderRadius: '50%', background: c,
                border: color === c ? '3px solid #fff' : '3px solid transparent',
                cursor: 'pointer', padding: 0, minWidth: 32,
              }} onClick={() => setColor(c)} />
            ))}
          </div>
          <button type="submit" className="btn-primary">Сохранить</button>
          <button type="button" className="btn-danger" onClick={handleDelete}>Удалить счёт</button>
        </form>
      </div>
    </div>
  )
}
