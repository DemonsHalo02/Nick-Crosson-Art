"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon, MessageSquare, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference">
        <div className="text-xl font-medium tracking-widest uppercase">
          Nick Crosson
        </div>
        <div className="flex gap-6 text-sm tracking-widest uppercase">
          <Link href="/login" className="hover:opacity-60 transition-opacity">Login</Link>
          <Link href="/signup" className="hover:opacity-60 transition-opacity">Subscribe</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Abstract background blobs */}
        <div className="absolute inset-0 opacity-20 flex justify-center items-center pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-[800px] h-[800px] bg-gradient-to-tr from-zinc-800 to-zinc-400 rounded-full blur-3xl opacity-30"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center z-10 space-y-6"
        >
          <h1 className="text-5xl md:text-8xl font-light tracking-tighter">
            Exclusive <br /> <span className="font-serif italic">Comic & Art</span>
          </h1>
          <p className="max-w-md mx-auto text-zinc-400 text-lg md:text-xl font-light leading-relaxed">
            Step into the official archive. High-resolution chapters, behind-the-scenes concepts, and an ad-free reading experience.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-black text-sm uppercase tracking-widest font-medium overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Become a Member <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-zinc-200 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            </Link>
            
            <Link href="/login" className="px-8 py-4 border border-white/20 text-white text-sm uppercase tracking-widest font-medium hover:bg-white/5 transition-colors">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-zinc-950 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<ImageIcon className="w-8 h-8 mb-6" />}
            title="High-Res Quality"
            description="Experience every detail of the comic exactly as drawn, in uncompressed high resolution."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 mb-6" />}
            title="Exclusive Access"
            description="Read chapters before they release anywhere else. Dive into concept art and sketches."
          />
          <FeatureCard 
            icon={<MessageSquare className="w-8 h-8 mb-6" />}
            title="Community"
            description="Discuss theories, leave comments, and interact directly with the creator and other readers."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-sm text-zinc-500 uppercase tracking-widest">
        © {new Date().getFullYear()} Nick Crosson. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="p-8 border border-white/5 hover:border-white/20 transition-colors bg-white/[0.02]"
    >
      <div className="text-zinc-400">{icon}</div>
      <h3 className="text-xl font-medium mb-4">{title}</h3>
      <p className="text-zinc-400 font-light leading-relaxed">{description}</p>
    </motion.div>
  );
}
