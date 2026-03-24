import React, { useId } from 'react';
import PropTypes from 'prop-types';
import './FormField.css';

/**
 * FormField Component - Accesible form input wrapper
 *
 * Componente reutilizable para campos de formulario con soporte completo de accesibilidad
 * WCAG 2.1 AA: labels asociados, aria-invalid, aria-describedby para errores
 *
 * @component
 * @example
 * <FormField
 *   id="email"
 *   label="Correo Electrónico"
 *   type="email"
 *   value={email}
 *   onChange={handleChange}
 *   error={errors.email}
 *   required
 *   placeholder="usuario@example.com"
 * />
 */
const FormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  required = false,
  disabled = false,
  placeholder,
  autoComplete,
  className = '',
  inputClassName = '',
  containerClassName = '',
  icon: IconComponent,
  children,
  helperText,
  ariaLabel,
  maxLength,
  min,
  max,
  step,
  pattern,
  ...restProps
}) => {
  // Generate unique IDs for error message and helper text
  const generatedId = useId();
  const errorId = `${id}-error-${generatedId}`;
  const helperId = `${id}-helper-${generatedId}`;

  // Build aria-describedby dynamically
  const ariaDescribedBy = [];
  if (error) ariaDescribedBy.push(errorId);
  if (helperText) ariaDescribedBy.push(helperId);
  const describedBy = ariaDescribedBy.length > 0 ? ariaDescribedBy.join(' ') : undefined;

  return (
    <div className={`form-field-container ${containerClassName}`.trim()}>
      {label && (
        <label
          htmlFor={id}
          className="form-field-label"
          aria-required={required}
        >
          {label}
          {required && <span className="required-indicator" aria-label="requerido">*</span>}
        </label>
      )}

      <div className={`form-field-input-wrapper ${className}`.trim()}>
        {IconComponent && (
          <span className="form-field-icon" aria-hidden="true">
            {typeof IconComponent === 'function' ? <IconComponent /> : IconComponent}
          </span>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-label={ariaLabel || label}
          className={`form-field-input ${inputClassName} ${error ? 'form-field-input--error' : ''}`.trim()}
          {...restProps}
        />

        {children}
      </div>

      {error && (
        <div
          id={errorId}
          role="alert"
          className="form-field-error"
        >
          {error}
        </div>
      )}

      {helperText && !error && (
        <div
          id={helperId}
          className="form-field-helper-text"
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.oneOf([
    'text',
    'email',
    'password',
    'number',
    'date',
    'time',
    'tel',
    'url',
    'search',
  ]),
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  autoComplete: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  containerClassName: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  children: PropTypes.node,
  helperText: PropTypes.string,
  ariaLabel: PropTypes.string,
  maxLength: PropTypes.number,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pattern: PropTypes.string,
};

export default FormField;
