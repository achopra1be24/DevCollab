import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSignup(e) {
    e.preventDefault();
    setErrorMsg("");

    const { name, email, password } = formData;
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.text();

      if (!response.ok) {
        setErrorMsg(data || "Registration failed. Please try again.");
        return;
      }

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      setErrorMsg("Server error. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans">
      
      {/* Left Column - Branding Banner */}
      <div className="relative md:w-1/2 lg:w-[50%] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-8 lg:p-16 flex flex-col justify-between overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
              DC
            </div>
            <span className="font-black text-white tracking-tight text-3xl lg:text-4xl">
              DevCollab
            </span>
          </div>

          <div className="mt-12 lg:mt-16 space-y-4 max-w-xl">
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Manage your team projects in one place.
            </h1>
            <p className="text-lg lg:text-xl text-slate-200 font-medium">
              Organize tasks, track progress on Kanban boards, and collaborate smoothly with your engineering team.
            </p>
          </div>

          <div className="mt-6 space-y-4 border-t border-slate-700/40 pt-5 max-w-xl">
            {["Kanban board management", "Real-time team updates", "Sprint tracking & activity logs"].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-cyan-300 text-xl font-bold">✓</span>
                <span className="text-lg font-medium text-slate-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-400 pt-8">
          DevCollab © {new Date().getFullYear()}
        </p>
      </div>

      {/* Right Column - Larger Signup Box */}
      <div className="md:w-1/2 lg:w-[50%] bg-white p-8 lg:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-lg space-y-8">
          
          <div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Create an account
            </h2>
            <p className="text-base lg:text-lg text-slate-500 mt-2">
              Enter your details below to get started.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-base font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-600 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 text-base placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 text-base placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-600 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-900 text-base placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-bold text-lg transition shadow-lg shadow-indigo-600/20 mt-4"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-base text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Log in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Signup;