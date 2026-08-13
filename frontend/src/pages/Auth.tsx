import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

type Errors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function validate(): boolean {
    const newErrors: Errors = {};

    //Empty Email
    if (!email.trim()) {
      newErrors.email = "Email is required";
      // Email format check
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Empty password
    if (!password.trim()) {
      newErrors.password = "Password is required";
      // Min length
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password
    if (!isLogin && password !== confirmPassword) {
      newErrors.password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async () => {
    setErrors({});

    // run validation first
    if (!validate()) return; // stop if not validated

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate("/");
    } catch (e: any) {
      // display backend error
      const detail = e.response?.data?.detail;
      if (typeof detail === "string") {
        // map backend error to the right field
        if (detail.includes("Email already")) {
          setErrors({ email: "This email is already registered" });
        } else if (detail.includes("Invalid email or password")) {
          setErrors({ general: "Wrong email or password. Please try again." });
        } else {
          setErrors({ general: detail });
        }
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-white text-2xl font-bold text-center mb-6">
          {isLogin ? "Welcome back 👋" : "Join VibeCheck ✨"}
        </h1>

        <div className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={`w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 transition
              ${errors.email ? "ring-2 ring-red-500" : "focus:ring-purple-500"}`}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-4 ml-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 transition
              ${errors.password ? "ring-2 ring-red-500" : "focus:ring-purple-500"}`}
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-4 ml-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password for register only */}
          {!isLogin && (
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 transition
                ${errors.confirmPassword ? "ring-2 ring-red-500" : "focus:ring-purple-500"}`}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-4 ml-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* General error */}
          {errors.general && (
            <div className="text-red-400 text-xs ml-1">{errors.general}</div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition mt-2"
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Register"}
          </button>
        </div>

        {/* Switch */}
        <p className="text-gray-400 text-center mt-4 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={handleSwitch}
            className="text-purple-400 hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
