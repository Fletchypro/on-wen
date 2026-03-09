import React from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { usCities } from '@/data/index.js';

const filterCities = (search, loadedOptions) => {
  const lowercasedSearch = search.toLowerCase();
  const filtered = usCities.filter(city => 
    city.name.toLowerCase().startsWith(lowercasedSearch)
  );

  const options = filtered.slice(loadedOptions.length, loadedOptions.length + 25).map(city => ({
    value: `${city.name}, ${city.state}`,
    label: `${city.name}, ${city.state}`,
  }));

  return {
    options,
    hasMore: filtered.length > loadedOptions.length + 25,
  };
};

const loadOptions = async (search, loadedOptions) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(filterCities(search, loadedOptions));
    }, 300);
  });
};

const LocationSearch = ({ value, onChange, disabled }) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '0.75rem',
      padding: '0.5rem',
      minHeight: 'auto',
      boxShadow: state.isFocused ? '0 0 0 2px #a855f7' : 'none',
      '&:hover': {
        borderColor: 'rgba(255, 255, 255, 0.4)',
      },
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 0.5rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
    }),
    input: (provided) => ({
      ...provided,
      color: 'white',
      margin: '0',
      padding: '0',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.5)',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1f2937',
      border: '1px solid rgba(168, 85, 247, 0.5)',
      borderRadius: '0.75rem',
      overflow: 'hidden',
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '0.5rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#581c87' : 'transparent',
      color: 'white',
      borderRadius: '0.5rem',
      '&:active': {
        backgroundColor: '#4c1d95',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.5)',
      '&:hover': {
        color: 'white',
      },
    }),
  };

  const selectedValue = value ? { value, label: value } : null;

  return (
    <AsyncPaginate
      value={selectedValue}
      loadOptions={loadOptions}
      onChange={(option) => onChange(option ? option.value : '')}
      isDisabled={disabled}
      placeholder="Search for a city..."
      debounceTimeout={300}
      styles={customStyles}
      classNamePrefix="react-select"
    />
  );
};

export default LocationSearch;