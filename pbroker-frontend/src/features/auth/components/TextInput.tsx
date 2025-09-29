import React from 'react';

interface Props {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}

const TextInput: React.FC<Props> = ({ label, type = 'text', value, onChange }) => (
  <div style={{ margin: '8px 0' }}>
    <label>{label}</label><br/>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ padding: '8px', width: '100%' }}
    />
  </div>
);

export default TextInput;
