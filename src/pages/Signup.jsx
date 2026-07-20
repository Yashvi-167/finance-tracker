import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight, User, Mail, Lock, Shield } from 'lucide-react';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('All fields are required');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 40%, #242742 100%)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-glow">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">BizManager</span>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-text-primary leading-tight">
            Start managing your<br />
            <span className="gradient-text">business today.</span>
          </h2>
          <p className="text-text-secondary text-lg">
            Join thousands of small business owners using BizManager to streamline their operations.
          </p>
          <div className="glass-card p-5 border border-border">
            <p className="text-text-secondary text-sm mb-3 font-medium">Trusted by businesses worldwide</p>
            <div className="flex -space-x-2">
              {['A', 'B', 'C', 'D', 'E'].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-600 border-2 border-background flex items-center justify-center text-white text-xs font-bold">{l}</div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-muted text-sm">© 2025 BizManager. Built for small businesses.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <Zap className="w-6 h-6 text-accent" />
              <span className="font-bold text-lg gradient-text">BizManager</span>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Create account</h1>
            <p className="text-text-secondary">Get started with BizManager for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input id="name-input" type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="John Smith" className="input-base pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input id="email-input" type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@company.com" className="input-base pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input id="password-input" type={showPass ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} placeholder="Min. 6 characters" className="input-base pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-secondary transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <select id="role-select" name="role" value={form.role} onChange={handleChange}
                  className="input-base pl-10 appearance-none cursor-pointer">
                  <option value="ADMIN">Admin — Full access</option>
                  <option value="STAFF">Staff — Limited access</option>
                </select>
              </div>
            </div>

            <button id="signup-btn" type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-light hover:text-accent font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
