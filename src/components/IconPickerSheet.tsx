import { useState } from 'react'
import { X } from 'lucide-react'
import { ICON_GROUPS } from '../lib/icons'
import IconCircle from './IconCircle'

const COLORS = [
  // Row 1
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800',
  '#FF5722', '#607D8B', '#2196F3', '#1565C0',
  // Row 2
  '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#00BCD4',
  '#009688', '#795548', '#9E9E9E', '#F44336',
  // Row 3
  '#76FF03', '#FFD740', '#FF6D00', '#DD2C00', '#304FFE',
  '#00B0FF', '#1DE9B6', '#C6FF00', '#E040FB',
]

interface Props {
  initialIcon?: string
  initialColor?: string
  onConfirm: (icon: string, color: string) => void
  onClose: () => void
}

export default function IconPickerSheet({ initialIcon = 'other', initialColor = COLORS[0], onConfirm, onClose }: Props) {
  const [selectedIcon, setSelectedIcon] = useState(initialIcon)
  const [selectedColor, setSelectedColor] = useState(initialColor)

  return (
    <div className="icon-picker-fullscreen">
      <div style={{ display: 'contents' }}>
        {/* Handle + close */}
        <div className="icon-picker-topbar">
          <div className="sheet-handle" style={{ margin: '0 auto 0' }} />
          <span className="icon-picker-title">Выбор иконки</span>
          <button className="icon-picker-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="icon-picker-preview">
          <IconCircle iconKey={selectedIcon} color={selectedColor} size="lg" />
        </div>

        <div className="icon-picker-scroll">
          {/* Colors */}
          <div className="icon-picker-section-label">Цвет</div>
          <div className="color-grid">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-dot ${selectedColor === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setSelectedColor(c)}
              />
            ))}
          </div>

          {/* Icons by group */}
          {ICON_GROUPS.map(group => (
            <div key={group.label}>
              <div className="icon-picker-section-label">{group.label}</div>
              <div className="icon-picker-grid">
                {group.icons.map(({ key, Icon, label }) => (
                  <button
                    key={key}
                    className={`icon-picker-item ${selectedIcon === key ? 'selected' : ''}`}
                    onClick={() => setSelectedIcon(key)}
                    title={label}
                  >
                    <div
                      className="icon-picker-circle"
                      style={{ background: selectedIcon === key ? selectedColor : '#2a2a3a' }}
                    >
                      <Icon size={22} color="white" strokeWidth={1.8} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Confirm button */}
        <div className="icon-picker-footer">
          <button
            className="btn-primary"
            style={{ letterSpacing: 1 }}
            onClick={() => { onConfirm(selectedIcon, selectedColor); onClose() }}
          >
            ГОТОВО
          </button>
        </div>
      </div>
    </div>
  )
}

export { COLORS }

