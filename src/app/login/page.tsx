"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4">
      <Link href="/" className="absolute top-8 left-8 text-sm uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
        ← Back
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light tracking-widest uppercase mb-2">Sign In</h1>
          <p className="text-zinc-500 font-light text-sm">Welcome back to the archive.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="text-red-500 text-sm font-light bg-red-500/10 p-4 border border-red-500/20">{error}</div>}
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/40 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase tracking-widest text-zinc-500">Password</label>
              <Link href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">Forgot?</Link>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/40 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black text-sm uppercase tracking-widest font-medium py-4 hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500">
          Need an account? <Link href="/signup" className="text-white hover:underline">Subscribe</Link>
        </div>
      </motion.div>
    </div>
  );
}
