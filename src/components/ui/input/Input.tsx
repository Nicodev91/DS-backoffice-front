import ButtonComponent from '../button/Button';
import showPasswordSvg from '../../../assets/showPassword.svg';
import hidePasswordSvg from '../../../assets/hidePassword.svg';

interface InputProps {
  type?: "text" | "email" | "password" | "tel";
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  maxLength?: number;
  showPasswordToggle?: boolean;
  onPasswordToggle?: () => void;
  showPassword?: boolean;
}

const InputComponent = ({
  type = "text",
  id,
  value,
  onChange,
  placeholder,
  label,
  required = false,
  maxLength,
  showPasswordToggle = false,
  onPasswordToggle,
  showPassword = false,
}: InputProps) => {
  const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base";
  const passwordClasses = showPasswordToggle ? "pr-10" : "";
  const inputClasses = `${baseClasses} ${passwordClasses}`;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block mb-1 text-sm font-semibold">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          type={showPasswordToggle && showPassword ? "text" : type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className={inputClasses}
        />
        
        {showPasswordToggle && (
          <ButtonComponent
            type="button"
            onClick={onPasswordToggle}
            className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none no-outline"
          >
            {showPassword ? (
              <img
              src={showPasswordSvg}
              alt="Show password"
              className="w-5 h-5"
              />
            ) : (
              <img
              src={hidePasswordSvg}
              alt="Hide password"
              className="w-5 h-5"
              />
            )}
          </ButtonComponent>
        )}
      </div>
    </div>
  );
};

export default InputComponent;