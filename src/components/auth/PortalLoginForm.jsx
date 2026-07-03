import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';

/** Shared email/password fields for portal login pages. */
const PortalLoginForm = ({
  email,
  password,
  showPassword,
  loading,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  submitLabel = 'Sign In',
  emailPlaceholder = 'you@rfincare.com',
}) => (
  <form className="space-y-6" onSubmit={onSubmit}>
    <div className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={onEmailChange}
          placeholder={emailPlaceholder}
          className="w-full"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={onPasswordChange}
            placeholder="Enter your password"
            className="w-full pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>

    <Button type="submit" className="w-full rf-btn-primary" size="lg" disabled={loading}>
      {loading ? 'Signing in…' : submitLabel}
    </Button>
  </form>
);

export default PortalLoginForm;
