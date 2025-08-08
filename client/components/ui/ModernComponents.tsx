import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon
}) => {

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: `btn-primary`,
    secondary: `btn-secondary`,
    outline: `btn-outline`,
    ghost: `text-muted hover:text-primary hover:bg-elevated focus:ring-blue-500`,
    danger: `bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-red-500`
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed transform-none' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  padding = 'md'
}) => {
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : '';

  return (
    <div className={`bg-tertiary border-primary rounded-xl shadow-consistent-md ${paddingClasses[padding]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  step?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = 'text',
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  icon,
  step
}) => {
  
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium text-secondary`}>
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-muted">{icon}</span>
          </div>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          step={step}
          className={`
            w-full px-4 py-3 rounded-lg transition-colors duration-200
            bg-secondary border-primary text-primary placeholder:text-muted
            focus:border-accent focus:ring-2 focus:ring-blue-500/20
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/20' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  color,
  size = 'md',
  className = ''
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  };

  const variants = {
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-green-100 text-green-800 border-green-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  };

  const colorClass = color ? colorClasses[color] : variants[variant];

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary'
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colors = {
    primary: 'text-blue-600',
    secondary: 'text-green-600',
    white: 'text-white'
  };

  return (
    <div className="flex items-center justify-center">
      <svg className={`animate-spin ${sizes[size]} ${colors[color]}`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
};

interface HealthMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  change?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'purple';
}

export const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  change,
  icon,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500 text-blue-700',
    green: 'from-green-500 to-emerald-500 text-green-700',
    yellow: 'from-yellow-500 to-orange-500 text-yellow-700',
    red: 'from-red-500 to-pink-500 text-red-700',
    orange: 'from-orange-500 to-red-500 text-orange-700',
    purple: 'from-purple-500 to-pink-500 text-purple-700'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card hover className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -mr-10 -mt-10`}></div>
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
            </div>
            {(trend && trendValue) || change ? (
              <div className={`flex items-center mt-2 text-sm ${trend ? trendColors[trend] : 'text-gray-600'}`}>
                {trend && <span className="mr-1">{trendIcons[trend]}</span>}
                <span>{trendValue || change}</span>
              </div>
            ) : null}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
};
