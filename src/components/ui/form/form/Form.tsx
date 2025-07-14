interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}

const FormComponent = ({
  onSubmit,
  children,
  className,
}: FormProps) => {
  return (
    <form 
      className={className} 
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
};

export default FormComponent; 