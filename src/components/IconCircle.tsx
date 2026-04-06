import { getIconComponent } from '../lib/icons'

interface Props {
  iconKey: string
  color: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const SIZES = {
  xs: { circle: 36, icon: 16 },
  sm: { circle: 48, icon: 22 },
  md: { circle: 58, icon: 26 },
  lg: { circle: 68, icon: 30 },
}

export default function IconCircle({ iconKey, color, size = 'md' }: Props) {
  const Icon = getIconComponent(iconKey)
  const { circle, icon } = SIZES[size]

  return (
    <div
      style={{
        width: circle,
        height: circle,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={icon} color="white" strokeWidth={1.8} />
    </div>
  )
}
