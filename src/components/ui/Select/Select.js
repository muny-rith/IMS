import React from "react";
import "../Form.css";

const Select = ({ label, options = [], error, ...props }) => {
  return (
    <div className="form-group">
      <select className={`select ${error ? "error" : ""}`} required {...props}>
        <option value="" disabled hidden></option>
        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <label className="label">{label}</label>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Select;