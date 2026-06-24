"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

export default function UploadPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const p = docSnap.data();
          setProfile(p);
          if (p.membershipStatus !== "Active") {
            router.push("/dashboard");
          }
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrls.trim()) {
      setError("Title and at least one Image URL are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const urls = imageUrls.split("\n").map(url => url.trim()).filter(url => url !== "");
      
      const postRef = await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName: profile.name,
        title,
        description,
        imageUrls: urls,
        isPremium,
        createdAt: serverTimestamp(),
      });
      
      router.push(`/read/${postRef.id}`);
    } catch (err: any) {
      setError("Failed to upload art. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-light tracking-widest uppercase">Loading...</div>;
  }

  if (!user || profile?.membershipStatus !== "Active") return null;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-white/10 p-6 flex justify-between items-center z-50">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm tracking-widest uppercase hover:text-zinc-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="text-xl font-medium tracking-widest uppercase">
          Upload Art
        </div>
        <div className="w-24" /> {/* Spacer */}
      </nav>

      <main className="max-w-2xl mx-auto pt-32 pb-24 px-4">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <div className="text-red-500 text-sm font-light bg-red-500/10 p-4 border border-red-500/20">{error}</div>}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">Project Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/40 transition-colors"
              placeholder="E.g., Awakening - Chapter 1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">Description (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/40 transition-colors h-32 resize-none"
              placeholder="Tell us about this piece..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500">Image URLs (One per line)</label>
            <textarea 
              required
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-white/40 transition-colors h-48 resize-none font-mono text-sm"
              placeholder="https://res.cloudinary.com/.../image1.jpg&#10;https://res.cloudinary.com/.../image2.jpg"
            />
            <p className="text-xs text-zinc-600 font-light">Paste your Cloudinary image URLs here. Each line represents one page/image in the reader.</p>
          </div>

          <div className="flex items-center gap-4 p-4 border border-white/10 bg-zinc-950">
            <input 
              type="checkbox" 
              id="isPremium"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="w-5 h-5 accent-white"
            />
            <label htmlFor="isPremium" className="flex flex-col cursor-pointer">
              <span className="font-medium tracking-widest uppercase text-sm">Premium Only</span>
              <span className="text-xs text-zinc-500 font-light">Only active subscribers will be able to view this post.</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-white text-black text-sm uppercase tracking-widest font-medium py-4 hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? "Publishing..." : <><Upload className="w-4 h-4" /> Publish Art</>}
          </button>
        </form>
      </main>
    </div>
  );
}
