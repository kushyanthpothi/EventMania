'use client';

import { Input } from './Input';

export const DatePicker = ({
    label,
    name,
    value,
    onChange,
    error = '',
    required = false,
    min = '',
    max = '',
    showTime = false,
    className = ''
}) => {
    return (
        <Input
            label={label}
            type={showTime ? 'datetime-local' : 'date'}
            name={name}
            value={value}
            onChange={onChange}
            error={error}
            required={required}
            className={className}
            min={min}
            max={max}
        />
    );
};
