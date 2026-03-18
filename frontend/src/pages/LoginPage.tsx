import LoginForm from "@/components/auth/LoginForm"
import { useNavigate } from "react-router-dom"


const LoginPage = () => {
  const navigate = useNavigate();
  const handleLoginSuccess = () => {
    navigate("/")
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  )
}

export default LoginPage
