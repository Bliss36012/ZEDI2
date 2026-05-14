import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, User, Lock, AlertCircle, CheckCircle2, Hospital } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface LoginProps {
  onLogin: (userData: { fullName: string; username: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateFullName = (name: string) => {
    // Each word must start with a capital letter
    const regex = /^[A-Z][a-z]*(?: [A-Z][a-z]*)*$/;
    return regex.test(name);
  };

  const validatePassword = (pass: string) => {
    // At least 8 chars, one uppercase, one lowercase, one number, one special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  const validateUsername = (user: string) => {
    // Alphanumeric, 4-15 chars
    const regex = /^[a-zA-Z0-9_]{4,15}$/;
    return regex.test(user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateFullName(fullName)) {
      setError('Full Name must start with capital letters (e.g., Dr Paschal).');
      return;
    }

    if (!validateUsername(username)) {
      setError('Username must be 4-15 characters and can include numbers or underscores.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters, with uppercase, lowercase, number, and special character (@$!%*?&).');
      return;
    }

    // Success
    try {
      // Check health first to diagnose connection
      try {
        const healthCheck = await fetch('/api/health');
        if (!healthCheck.ok) {
          console.warn('Health check failed', healthCheck.status);
        }
      } catch (hErr) {
        console.error('Health check unreachable', hErr);
      }

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || `Login failed (Status ${response.status}).`);
      }
    } catch (err: any) {
      setError(`System connection error: ${err.message || 'Server unreachable'}. Check if the server is running and reachable.`);
    }
  };

  const passwordStrength = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="absolute top-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary-deep rounded-xl flex items-center justify-center text-white font-serif text-2xl shadow-lg ring-4 ring-primary-soft">S</div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Siha Angavu</h1>
        </div>
        <p className="text-slate-500 font-medium">Mental Health Hospital Management</p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-slate-900">Dr. Paschal's Portal</CardTitle>
            <CardDescription>Enter clinical credentials to access patient records</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="fullName" 
                    placeholder="e.g. Dr Paschal" 
                    className={cn("pl-10 rounded-xl bg-slate-50 border-none transition-all focus:ring-2 focus:ring-primary-deep", 
                      fullName && !validateFullName(fullName) && "ring-2 ring-red-400")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="username" 
                    placeholder="Unique username" 
                    className="pl-10 rounded-xl bg-slate-50 border-none transition-all focus:ring-2 focus:ring-primary-deep"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Security Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 rounded-xl bg-slate-50 border-none transition-all focus:ring-2 focus:ring-primary-deep"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                
                {password && (
                  <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-slate-100 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 text-[10px]">
                      {passwordStrength.length ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                      <span className={passwordStrength.length ? 'text-green-700' : 'text-slate-500'}>8+ chars</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      {passwordStrength.upper ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                      <span className={passwordStrength.upper ? 'text-green-700' : 'text-slate-500'}>Uppercase</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      {passwordStrength.number ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                      <span className={passwordStrength.number ? 'text-green-700' : 'text-slate-500'}>Number</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      {passwordStrength.special ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                      <span className={passwordStrength.special ? 'text-green-700' : 'text-slate-500'}>Special @$!%</span>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-12 bg-primary-deep hover:bg-teal-800 text-white rounded-xl text-lg font-semibold shadow-lg shadow-primary-deep/20">
                Grant Access
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 bg-slate-50/50 p-6">
             <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-widest font-semibold">
               <Hospital className="w-4 h-4" />
               Clinical Secure System
             </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
