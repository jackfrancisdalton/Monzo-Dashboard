interface DisplayCardProps {
  title: string
  value: string
  colorClass?: string // tailwind text color
}

const DisplayCard: React.FC<DisplayCardProps> = ({ title, value, colorClass = 'text-blue-600' }) => {
  return (
    <div className="bg-white flex flex-col justify-between h-full">
      <div className="text-sm font-semibold text-gray-600 mb-2">{title}</div>
      <div className={`text-4xl font-bold ${colorClass} flex-1 flex items-center justify-center`}>
        {value}
      </div>
    </div>
  )
}

export default DisplayCard