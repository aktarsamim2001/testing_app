// This is a wrapper for react-select to be used in the PartnerDialog for the Client field only.
import React from 'react';
import Select from 'react-select';

export interface OptionType {
  value: string;
  label: string;
}

interface ReactSelectProps {
  options: OptionType[];
  value: OptionType | null;
  onChange: (option: OptionType | null) => void;
  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
}

const ReactSelect: React.FC<ReactSelectProps> = ({ options, value, onChange, placeholder, isClearable, isDisabled }) => {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={isDisabled}
      classNamePrefix="react-select"
    />
  );
};

export default ReactSelect;
