type CardWrapperProps = {
  title?: string
  className?: string // use to control col-span, row-span
  children: React.ReactNode
}

const CardWrapper: React.FC<CardWrapperProps> = ({ title, className, children }) => {
  return (
    <div className={`bg-red rounded-lg shadow p-4 flex flex-col overflow-auto ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
      <div className="flex-1 w-full h-full">{children}</div>
    </div>
  )
}

export default CardWrapper;