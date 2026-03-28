import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email });
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={(e) => setEmail(e.target.value)} />
      <button>Login</button>
    </form>
  );
};

export default Login;