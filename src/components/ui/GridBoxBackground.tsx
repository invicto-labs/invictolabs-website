import type { CSSProperties } from 'react'
import './GridBoxBackground.css'

type GridBoxBackgroundProps = {
  cellCount?: number
  className?: string
}

type GridCellStyle = CSSProperties & {
  '--grid-cell-delay': string
}

export function GridBoxBackground({ cellCount = 180, className = '' }: GridBoxBackgroundProps) {
  return (
    <div className={`grid-box-background ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: cellCount }, (_, index) => {
        const isActive = index % 17 === 4 || index % 29 === 11 || index % 41 === 19
        const style: GridCellStyle = {
          '--grid-cell-delay': `${(index % 19) * -0.31}s`,
        }

        return <span className={isActive ? 'grid-box-background__cell is-active' : 'grid-box-background__cell'} style={style} key={index} />
      })}
    </div>
  )
}

export default GridBoxBackground
