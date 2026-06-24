"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Lock } from "lucide-react";

export default function ReadManhwaPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
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
        setUser(null);
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, "posts", params.id));
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.id]);

  useEffect(() => {
    if (!post) return;

    const q = query(
      collection(db, "comments"),
      where("chapterId", "==", params.id),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [post, params.id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    await addDoc(collection(db, "comments"), {
      chapterId: params.id,
      userId: user.uid,
      userEmail: user.email,
      content: newComment,
      createdAt: serverTimestamp(),
    });

    setNewComment("");
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center font-light tracking-widest uppercase">Loading...</div>;
  }

  if (!post) {
    return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-light tracking-widest uppercase">
      <h2>Post Not Found</h2>
      <Link href="/dashboard" className="text-zinc-500 hover:text-white mt-4 text-sm underline">Return to Archive</Link>
    </div>;
  }

  const isLocked = post.isPremium && profile?.membershipStatus !== "Active";

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-white/10 p-6 flex justify-between items-center z-50">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm tracking-widest uppercase hover:text-zinc-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>
        <div className="text-xl font-medium tracking-widest uppercase truncate max-w-sm text-center">
          {post.title}
        </div>
        <div className="w-24" /> {/* Spacer */}
      </nav>

      <main className="max-w-4xl mx-auto pt-32 pb-24 px-4">
        {isLocked ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center border border-white/10 bg-zinc-950 p-8 text-center">
            <Lock className="w-12 h-12 text-zinc-500 mb-6" />
            <h2 className="text-2xl font-light tracking-widest uppercase mb-4">Premium Content</h2>
            <p className="text-zinc-400 font-light mb-8 max-w-md">
              This art piece is exclusive to active subscribers. Please upgrade your membership to unlock this content.
            </p>
            <Link href="/dashboard" className="bg-white text-black px-8 py-3 text-sm uppercase tracking-widest font-medium hover:bg-zinc-200 transition-colors">
              Upgrade Now
            </Link>
          </div>
        ) : (
          <>
            {/* Manhwa Reader Container */}
            <div className="space-y-4 mb-24 min-h-screen">
              {post.description && (
                <div className="mb-12 text-center text-zinc-400 font-light max-w-2xl mx-auto">
                  {post.description}
                </div>
              )}
              {post.imageUrls && post.imageUrls.map((url: string, idx: number) => (
                <img key={idx} src={url} alt={`Page ${idx + 1}`} className="w-full h-auto" />
              ))}
            </div>

            {/* Comments Section */}
            <div className="border-t border-white/10 pt-16">
              <h3 className="text-2xl font-light tracking-widest uppercase mb-12">Comments ({comments.length})</h3>
              
              {!user ? (
                <div className="mb-12 text-zinc-500 font-light border border-white/10 p-6 text-center">
                  <Link href="/login" className="text-white underline">Sign in</Link> to leave a comment.
                </div>
              ) : (
                <form onSubmit={handlePostComment} className="mb-12 relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave your thoughts..."
                    className="w-full bg-zinc-950 border border-white/10 p-6 pr-16 text-white placeholder-zinc-700 focus:outline-none focus:border-white/40 transition-colors resize-none h-32"
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim()}
                    className="absolute bottom-6 right-6 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </form>
              )}

              <div className="space-y-8">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-sm font-medium uppercase">
                        {comment.userEmail?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-medium">{comment.userEmail?.split("@")[0] || "User"}</div>
                        <div className="text-xs text-zinc-600 mt-1">
                          {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString() : "Just now"}
                        </div>
                      </div>
                    </div>
                    <p className="text-zinc-300 font-light leading-relaxed pl-14">
                      {comment.content}
                    </p>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <div className="text-center text-zinc-600 font-light py-12">
                    Be the first to share your thoughts on this chapter.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
