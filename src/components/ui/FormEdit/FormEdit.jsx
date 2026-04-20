import React from "react";
import { useForm } from "react-hook-form";
import "./FormEdit.css";

const FormEdit = ({ onSubmit, children, defaultValues = {} }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues });

  return (
    <div className="form-wrapper">
      <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
        
        <div className="form-body">
          {children({ register, errors })}
        </div>

        <button type="submit" className="form-btn">
          Submit
        </button>

      </form>
    </div>
  );
};

export default FormEdit;