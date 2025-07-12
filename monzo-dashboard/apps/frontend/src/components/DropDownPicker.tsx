
interface DropDownPickerProps<T> {
    options: T[];
    dropDownLabel: string;
    getValue: (item: T) => string | number;
    getLabel: (item: T) => string;
    onChange: (selected: T | undefined) => void;
    layoutClassName?: string;
}

const DropDownPicker = <T,>({
    options,
    dropDownLabel,
    getValue,
    getLabel,
    onChange,
    layoutClassName
}: DropDownPickerProps<T>) => {
    // TECHDEBT: will have to re-render this every render, if long list of options this sucks 
    const valueToObjectMap = new Map<string, T>();
    options.forEach(option => {
        valueToObjectMap.set(String(getValue(option)), option);
    });

    return (
        <div className={"flex items-center gap-2 " + (layoutClassName || "")}>
            <label htmlFor="drop-down-select" className="text-white">
                {dropDownLabel}
            </label>
            <select
                id="drop-down-select"
                className="border border-gray-300 rounded-md p-2 bg-gray-800 text-white"
                onChange={(e) => onChange(valueToObjectMap.get(e.target.value))}
            >
                {options.map((option, index) => (
                    <option key={index} value={getValue(option)}>
                        {getLabel(option)}
                    </option>  
                ))}

            </select>
        </div>
    )
}

export default DropDownPicker;