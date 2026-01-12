import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    const result = await login(data);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="grid gap-8 rounded-[32px] border border-white/20 bg-white/5 p-8 shadow-glow backdrop-blur-xl lg:grid-cols-2 lg:p-12">
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-primary-500/80 via-secondary-500/70 to-primary-700/80 p-8 text-white shadow-inner">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Task Manager</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight">Run projects with clarity and calm.</h2>
              <p className="mt-3 text-white/70">Visualize workload, unlock insights, and collaborate with your team through a refined command center.</p>
            </div>
            <div className="mt-8 space-y-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span>Projects delivering</span>
                <span className="text-base font-semibold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avg. response</span>
                <span className="text-base font-semibold">1h 12m</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Team sentiment</span>
                <span className="text-base font-semibold text-secondary-200">97% positive</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="text-start">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-glow">
                  <span className="text-2xl font-bold">TM</span>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">Welcome back</p>
                  <p className="text-2xl font-semibold text-neutral-900">Sign in to continue</p>
                </div>
              </div>
            </div>

            <Card className="shadow-medium">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-danger-100 bg-danger-50/80 px-4 py-3 text-sm font-semibold text-danger-600">
                    {error}
                  </div>
                )}

                <Input
                  label="Email or Username"
                  type="text"
                  icon={Mail}
                  placeholder="Enter your email or username"
                  {...register('username', {
                    required: 'Email or username is required',
                  })}
                  error={errors.username?.message}
                />

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-600">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className={`w-full rounded-2xl border border-neutral-200/80 bg-white/90 px-4 py-2.5 pl-10 pr-12 text-sm text-neutral-700 shadow-inner transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 ${
                        errors.password ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-100' : ''
                      }`}
                      {...register('password', {
                        required: 'Password is required',
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm font-medium text-danger-600 animate-fade-in">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <label className="flex items-center gap-2 text-neutral-500">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-200"
                    />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-primary-600 hover:text-primary-500"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full"
                  size="lg"
                >
                  Sign in
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-neutral-100/80 bg-neutral-50/80 p-4 text-center text-sm text-neutral-500">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500">
                  Create one
                </Link>
              </div>
            </Card>

            <Card padding="sm" className="grid grid-cols-2 gap-4 text-sm shadow-inner">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">Admin demo</p>
                <p className="text-neutral-700">admin / admin123</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400">Member demo</p>
                <p className="text-neutral-700">member / member123</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
