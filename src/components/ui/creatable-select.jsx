import React from 'react';
import CreatableSelect from 'react-select/creatable';

const CreatableSelectComponent = ({ options, value, onChange, placeholder, ...props }) => {
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '0.375rem',
      minHeight: '40px',
      color: 'white',
      boxShadow: state.isFocused ? '0 0 0 2px #3b82f6' : 'none',
      '&:hover': {
        borderColor: 'rgba(255, 255, 255, 0.4)',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 8px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
    }),
    input: (provided) => ({
      ...provided,
      color: 'white',
      margin: '0px',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '40px',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        color: '#9ca3af',
        '&:hover': {
            color: 'white',
        },
    }),
    clearIndicator: (provided) => ({
        ...provided,
        color: '#9ca3af',
        '&:hover': {
            color: 'white',
        },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#0b0b0b',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      backdropFilter: 'blur(10px)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      color: 'white',
      padding: '10px 12px',
      cursor: 'pointer',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
    noOptionsMessage: (provided) => ({
        ...provided,
        color: '#9ca3af',
    }),
  };

  return (
    <CreatableSelect
      isClearable
      options={options}
      value={options.find(option => option.value === value)}
      onChange={onChange}
      placeholder={placeholder}
      styles={selectStyles}
      {...props}
    />
  );
};

export default CreatableSelectComponent;