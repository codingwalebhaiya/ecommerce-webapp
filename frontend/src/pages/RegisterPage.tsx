
import RegisterForm from "@/components/auth/RegisterForm";
import { useNavigate } from "react-router-dom"


const RegisterPage = () => {
  const navigate = useNavigate();
  const handleLoginSuccess = () => {
    navigate("/login")
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <RegisterForm onSuccess={handleLoginSuccess} />
    </div>
  )
}

export default RegisterPage
