interface CardLayoutProps {
    children: React.ReactNode
}

const CardLayout: React.FC<CardLayoutProps> = ({ children }) => {
    return (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[300px]">
            {children}
        </div>
    )
}

export default CardLayout;