import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, AlertCircle, Loader } from "lucide-react";

const BASE_URL = import.meta.env.VITE_URL;

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/users/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json().catch(() => {
        throw new Error("Server returned an invalid response (not JSON).");
      });

      if (response.ok && data.token && data.username && data.role && data.department) {
        // Store all user data in localStorage
        const userData = {
          username: data.username,
          role: data.role,
          department: data.department,
          email: data.email || data.username,
          name: data.name || data.username
        };

        if (window.localStorage) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userData", JSON.stringify(userData));
          localStorage.setItem("username", data.username);
          localStorage.setItem("role", data.role);
          localStorage.setItem("department", data.department);
        }
        
        console.log("Login successful:", data);
        console.log("User role:", data.role);
        console.log("Role type:", typeof data.role);
        
        setSuccess(true);

        // Role-based routing - normalize role to lowercase for comparison
        const normalizedRole = data.role.toLowerCase().trim();
        console.log("Normalized role:", normalizedRole);
        
        const routes = {
          admin: "/dashboard/admin",
          manager: "/dashboard/manager",
          employee: "/dashboard/employee",
          supervisor: "/dashboard/teamlead",
          teamlead: "/dashboard/teamlead", // Add alias
          "team lead": "/dashboard/teamlead", // Add alias with space
        };

        const redirectPath = routes[normalizedRole] || "/dashboard";
        console.log("Redirecting to:", redirectPath);

        setTimeout(() => {
          window.location.href = redirectPath;
        }, 1500);
      } else {
        throw new Error(data.detail || data.message || "Login unsuccessful. Please check your credentials.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          fontFamily: "'Noto Sans', sans-serif",
          backgroundColor: "#F5F7FA",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#D1FAE5" }}
          >
            <div style={{ color: "#059669", fontSize: "32px" }}>✓</div>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#004A9F" }}>
            Login Successful!
          </h2>
          <p style={{ color: "#6B7280" }} className="mb-4">
            Welcome back, <strong>{credentials.username}</strong>
          </p>
          <p style={{ color: "#9CA3AF" }} className="text-sm">
            Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: "#F5F7FA", fontFamily: "'Noto Sans', sans-serif" }}>
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ backgroundColor: "#004A9F" }}></div>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000" style={{ backgroundColor: "#00A3C4" }}></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000" style={{ backgroundColor: "#FACC15" }}></div>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/metro-bg.jpg)',
            filter: 'brightness(0.7)'
          }}
        ></div>
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 74, 159, 0.1)' }}></div>
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent" style={{ background: 'linear-gradient(to right, transparent, #F5F7FA)' }}></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          <motion.h1 
            className="text-6xl font-bold mb-4 text-white" 
            style={{ 
              textShadow: '0 0 20px rgba(255,255,255,0.5)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              textShadow: [
                '0 0 20px rgba(255,255,255,0.5)',
                '0 0 30px rgba(255,255,255,0.8)',
                '0 0 20px rgba(255,255,255,0.5)'
              ]
            }}
            transition={{ 
              duration: 0.8, 
              delay: 0.3,
              textShadow: { duration: 3, repeat: Infinity }
            }}
          >
            Dashboard
          </motion.h1>
          <motion.p 
            className="text-xl mb-6 text-white" 
            style={{ 
              textShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0
            }}
            transition={{ 
              duration: 0.6, 
              delay: 0.6
            }}
          >
            Secure Access Portal
          </motion.p>
          
          <div className="flex justify-center">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <motion.div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#00A3C4" }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: 0,
                  ease: "easeInOut"
                }}
              ></motion.div>
              <motion.div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#FACC15" }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: 0.5,
                  ease: "easeInOut"
                }}
              ></motion.div>
              <motion.div 
                className="w-3 h-3 rounded-full bg-white"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: 1,
                  ease: "easeInOut"
                }}
              ></motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-md"
        >
          <div className="backdrop-blur-lg rounded-3xl shadow-2xl border p-8 sm:p-10" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold mb-2" style={{ color: "#004A9F" }}>
                Welcome Back
              </h2>
              <p style={{ color: "#1F2937" }}>Sign in to your account</p>
            </motion.div>

            <div onSubmit={handleLogin} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border px-4 py-3 rounded-xl text-sm flex items-start gap-3"
                  style={{ backgroundColor: "#FEE2E2", borderColor: "#EF4444" }}
                >
                  <AlertCircle size={20} style={{ color: "#DC2626", marginTop: "2px", flexShrink: 0 }} />
                  <p style={{ color: "#DC2626" }}>{error}</p>
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition"
                    style={{ 
                      backgroundColor: "#F5F7FA", 
                      borderColor: "#D1D5DB",
                      color: "#1F2937"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#004A9F";
                      e.target.style.boxShadow = "0 0 0 3px rgba(0, 74, 159, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#D1D5DB";
                      e.target.style.boxShadow = "none";
                    }}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={credentials.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition"
                      style={{ 
                        backgroundColor: "#F5F7FA", 
                        borderColor: "#D1D5DB",
                        color: "#1F2937"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#004A9F";
                        e.target.style.boxShadow = "0 0 0 3px rgba(0, 74, 159, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#D1D5DB";
                        e.target.style.boxShadow = "none";
                      }}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 transition"
                      style={{ color: "#6B7280", background: "none", border: "none", cursor: "pointer" }}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                style={{ 
                  backgroundColor: "#004A9F",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = "#003378")}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = "#004A9F")}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size={20} className="animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8 pt-8 border-t" style={{ borderColor: "#E5E7EB" }}>
              <p className="text-center text-sm" style={{ color: "#6B7280" }}>
                Demo credentials:
              </p>
              <p className="text-center text-xs mt-2" style={{ color: "#9CA3AF" }}>
                Username: <span style={{ color: "#004A9F", fontWeight: "bold" }}>sathwik</span>
                <br />
                Password: <span style={{ color: "#004A9F", fontWeight: "bold" }}>khush@123</span>
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div
            className="mt-6 p-4 rounded-lg text-center text-sm"
            style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
          >
            <p>
              This page uses role-based routing. After login, you'll be directed to your respective dashboard.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;