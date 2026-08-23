import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import ReportModal from "../components/ReportModal";

const SOCIAL_LABELS = { instagram: "Instagram", telegram: "Telegram", facebook: "Facebook" };

export default function PublicProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/users/${id}/profile`)
      .then((res) => {
        setProfile(res.data.user);
        setComments(res.data.comments);
      })
      .catch(() => setError("Profilni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCommentSubmit(e) {
    e.preventDefault();
    setCommentError("");

    if (commentText.trim().length < 3) {
      setCommentError("Izoh juda qisqa");
      return;
    }

    setCommentSubmitting(true);
    try {
      await api.post(`/users/${id}/comments`, { text: commentText.trim() });
      setComments((prev) => [
        { id: Date.now().toString(), text: commentText.trim(), authorName: currentUser.fullName, createdAt: new Date() },
        ...prev,
      ]);
      setCommentText("");
    } catch (err) {
      setCommentError(err.response?.data?.message || "Izoh qo'shishda xatolik yuz berdi");
    } finally {
      setCommentSubmitting(false);
    }
  }

  if (loading) return <p className="py-16 text-center text-muted">Yuklanmoqda...</p>;

  if (error || !profile) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-700">{error || "Profil topilmadi"}</p>
        <Link to="/users/search" className="mt-3 inline-block text-sm text-ink-700 hover:underline">
          Qidiruvga qaytish
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const socialEntries = Object.entries(profile.socialLinks || {}).filter(
    ([, data]) => data?.username || data?.url
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="rounded-xl border border-line bg-white p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-lg font-medium text-[#4A2E06]">
          {profile.fullName?.slice(0, 2).toUpperCase()}
        </div>
        <h1 className="font-display mt-3 text-xl font-medium text-ink-900">
          {profile.fullName}
        </h1>
        {profile.phone && <p className="mt-1 text-sm text-muted">{profile.phone}</p>}

        {socialEntries.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {socialEntries.map(([key, data]) => (
              <span key={key} className="rounded-full bg-paper-200 px-3 py-1 text-xs text-ink">
                {data.url ? (
                  <a href={data.url} target="_blank" rel="noreferrer" className="hover:underline">
                    {SOCIAL_LABELS[key] || key}: {data.username || data.url}
                  </a>
                ) : (
                  `${SOCIAL_LABELS[key] || key}: ${data.username}`
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Izohlar */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-ink">
          Izohlar {comments.length > 0 && `(${comments.length})`}
        </h2>

        {!isOwnProfile && (
          <form onSubmit={handleCommentSubmit} className="mb-4 space-y-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              placeholder="Bu odam haqida fikringizni yozing..."
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink-700"
            />
            {commentError && <p className="text-xs text-red-600">{commentError}</p>}
            <button
              type="submit"
              disabled={commentSubmitting}
              className="rounded-lg bg-ink-700 px-4 py-2 text-sm font-medium text-paper-100 hover:bg-ink-900 disabled:opacity-60"
            >
              {commentSubmitting ? "Yuborilmoqda..." : "Izoh qoldirish"}
            </button>
          </form>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-muted">Hali izoh yo'q</p>
        ) : (
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="rounded-lg border border-line bg-white p-3">
                <p className="text-sm text-ink">{c.text}</p>
                <p className="mt-1 text-xs text-muted-2">{c.authorName}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shikoyat qilish */}
      {!isOwnProfile && (
        <div className="mt-8 text-center">
          {reportSent ? (
            <p className="text-sm text-muted">Shikoyatingiz qabul qilindi</p>
          ) : (
            <button
              onClick={() => setShowReportModal(true)}
              className="text-sm text-red-600 hover:underline"
            >
              Shikoyat qilish
            </button>
          )}
        </div>
      )}

      <ReportModal
        open={showReportModal}
        targetUserId={id}
        onClose={() => setShowReportModal(false)}
        onSubmitted={() => {
          setShowReportModal(false);
          setReportSent(true);
        }}
      />
    </div>
  );
}