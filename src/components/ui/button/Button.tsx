interface ButtonProps {
    type?: "button" | "submit";
    onClick?: () => void;
    className?: string;
    tabIndex?: number;
    disabled?: boolean;
    children: React.ReactNode;
  }
  
  const ButtonComponent = ({
    type = "button",
    onClick,
    className = "",
    tabIndex = 0,
    disabled = false,
    children,
  }: ButtonProps) => {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`rounded-md font-semibold ${className}`}
        tabIndex={tabIndex}
        disabled={disabled}
      >
        {children}
      </button>
    );
  };
  
  export default ButtonComponent;
  