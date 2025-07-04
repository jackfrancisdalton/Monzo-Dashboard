interface TopEntitiesCardProps<T> {
  items: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  getPercent: (item: T) => number;
}
const TopEntitiesCard = <T,>({
    items,
    getLabel,
    getValue,
    getPercent
}: TopEntitiesCardProps<T>) => (
    <div className="flex flex-col divide-y divide-gray-200">
        {items.map((item, idx) => (
            <div key={idx} className="flex justify-between py-2">
                <div className="flex-1 font-medium">{getLabel(item)}</div>
                <div className="flex-1 text-center text-sm text-gray-500">{getValue(item)}</div>
                <div className="flex-1 text-right text-sm">{getPercent(item).toFixed(1)}%</div>
            </div>
        ))}
    </div>
);

export default TopEntitiesCard;
