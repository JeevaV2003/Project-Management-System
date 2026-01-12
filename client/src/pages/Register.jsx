import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    const result = await registerUser(data);

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
        <div className="grid gap-10 rounded-[32px] border border-white/20 bg-white/5 p-8 shadow-glow backdrop-blur-xl lg:grid-cols-2 lg:p-12">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-secondary-500/80 via-primary-500/70 to-secondary-700/80 p-8 text-white shadow-inner">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">Create your space</p>
            <h2 className="text-4xl font-semibold leading-tight">Design a shared operating system for every project.</h2>
            <p className="text-white/70">From sprint rituals to company-wide reporting, bring structure and calm to the way your team delivers.</p>
            <div className="mt-10 grid gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 text-sm text-white/90">
              <div className="flex items-center justify-between">
                <span>Workspaces unlocked</span>
                <span className="text-base font-semibold">+143%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average sprint velocity</span>
                <span className="text-base font-semibold text-secondary-200">32 pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Team focus time</span>
                <span className="text-base font-semibold text-white">+18%</span>
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
                  <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">Get started</p>
                  <p className="text-2xl font-semibold text-neutral-900">Create your account</p>
                </div>
              </div>
            </div>

            <Card className="shadow-medium">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-danger-100 bg-danger-50/80 px-4 py-3 text-sm font-semibold text-danger-600">
                    {typeof error === 'string' ? error : JSON.stringify(error)}
                  </div>
                )}

                <Input
                  label="Username"
                  type="text"
                  icon={User}
                  placeholder="Choose a username"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                  })}
                  error={errors.username?.message}
                />

                <Input
                  label="Email"
                  type="email"
                  icon={Mail}
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  error={errors.email?.message}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="First name"
                    {...register('first_name', {
                      required: 'First name is required',
                    })}
                    error={errors.first_name?.message}
                  />

                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Last name"
                    {...register('last_name', {
                      required: 'Last name is required',
                    })}
                    error={errors.last_name?.message}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-600">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      className={`w-full rounded-2xl border border-neutral-200/80 bg-white/90 px-4 py-2.5 pl-10 pr-12 text-sm text-neutral-700 shadow-inner transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 ${
                        errors.password ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-100' : ''
                      }`}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
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

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-600">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className={`w-full rounded-2xl border border-neutral-200/80 bg-white/90 px-4 py-2.5 pl-10 pr-12 text-sm text-neutral-700 shadow-inner transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 ${
                        errors.password_confirm ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-100' : ''
                      }`}
                      {...register('password_confirm', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match',
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password_confirm && (
                    <p className="text-sm font-medium text-danger-600 animate-fade-in">
                      {errors.password_confirm.message}
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-neutral-100/80 bg-neutral-50/80 p-3 text-sm text-neutral-500">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-neutral-200"
                    {...register('terms', {
                      required: 'You must accept the terms and conditions',
                    })}
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className="font-semibold text-primary-600 hover:text-primary-500">
                      Terms and Conditions
                    </Link>
                  </span>
                </div>
                {errors.terms && (
                  <p className="text-sm font-medium text-danger-600 animate-fade-in">
                    {errors.terms.message}
                  </p>
                )}

                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full"
                  size="lg"
                >
                  Create account
                </Button>
              </form>

              <div className="mt-6 rounded-2xl border border-neutral-100/80 bg-neutral-50/80 p-4 text-center text-sm text-neutral-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
                  Sign in instead
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
