"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Link from "next/link";
import { LogOut, Image as ImageIcon, Lock, Plus } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetchedPosts);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  const handleApprove = async (data: any, actions: any) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        membershipStatus: "Active",
        paypalSubscriptionId: data.subscriptionID || data.orderID,
      });
      setProfile({ ...profile, membershipStatus: "Active" });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-light tracking-widest uppercase">Loading...</div>;
  }

  if (!user || !profile) return null;

  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", vault: true, intent: "subscription" }}>
      <div className="min-h-screen bg-black text-white font-sans pb-24">
        <nav className="border-b border-white/10 p-6 flex justify-between items-center">
          <div className="text-xl font-medium tracking-widest uppercase">
            <Link href="/">Nick Crosson</Link>
          </div>
          <div className="flex items-center gap-6 text-sm tracking-widest uppercase">
            <span className="text-zinc-500 hidden sm:inline">Hello, {profile.name}</span>
            {profile.membershipStatus === "Active" && (
              <Link href="/upload" className="flex items-center gap-2 hover:opacity-60 transition-opacity text-white">
                <Plus className="w-4 h-4" /> Upload Art
              </Link>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 hover:opacity-60 transition-opacity">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto p-6 py-12">
          {profile.membershipStatus === "Inactive" && (
            <div className="max-w-md mx-auto text-center space-y-8 mb-24 border border-white/10 p-8 bg-zinc-950">
              <h2 className="text-2xl font-light tracking-widest uppercase">Upgrade to Premium</h2>
              <p className="text-zinc-400 font-light text-sm leading-relaxed">
                Subscribe to unlock premium art, full manhwa chapters, and the ability to upload your own creations to the community.
              </p>
              <div className="bg-white p-4 rounded-md">
                <PayPalButtons 
                  createSubscription={(data, actions) => {
                    return actions.subscription.create({
                      plan_id: "P-2AA307801R3221747NI6C4BA" // Replace with actual Plan ID
                    });
                  }}
                  onApprove={handleApprove}
                  style={{ layout: "vertical", color: "black", shape: "rect" }}
                />
              </div>
            </div>
          )}

          <div className="space-y-12">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-light tracking-widest uppercase mb-2">Community Gallery</h2>
                <p className="text-zinc-500 font-light">Explore art from Nick Crosson and other members.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link href={`/read/${post.id}`} key={post.id} className="group block">
                  <div className="aspect-[2/3] bg-zinc-900 border border-white/5 group-hover:border-white/20 transition-colors flex flex-col items-center justify-center text-zinc-700 relative overflow-hidden">
                    {post.imageUrls && post.imageUrls.length > 0 ? (
                      <img src={post.imageUrls[0]} alt={post.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <ImageIcon className="w-12 h-12 mb-4 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                    )}
                    
                    {post.isPremium && (
                      <div className="absolute top-4 right-4 bg-black/80 p-2 rounded-full backdrop-blur-md border border-white/10 text-white">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{post.title}</h3>
                      <p className="text-zinc-500 text-sm mt-1">By {post.authorName}</p>
                    </div>
                    {post.isPremium ? (
                      <span className="text-xs tracking-widest uppercase text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded bg-yellow-500/10">Premium</span>
                    ) : (
                      <span className="text-xs tracking-widest uppercase text-zinc-500 border border-white/10 px-2 py-1 rounded">Free</span>
                    )}
                  </div>
                </Link>
              ))}

              {posts.length === 0 && (
                <div className="col-span-full py-24 text-center text-zinc-600 font-light border border-white/5 border-dashed">
                  No art has been uploaded yet. Be the first!
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </PayPalScriptProvider>
  );
}
