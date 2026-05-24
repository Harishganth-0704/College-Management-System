import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiBookOpen, FiClock, FiTag, FiGlobe, FiAlertCircle } from "react-icons/fi";
import axiosWrapper from "../utils/AxiosWrapper";

const PublicNoteView = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicNote = async () => {
      setLoading(true);
      try {
        const response = await axiosWrapper.get(`/public-note/note/${noteId}`);
        if (response.data.success) {
          setNote(response.data.data);
        } else {
          setError("This note could not be loaded or is no longer public.");
        }
      } catch (err) {
        console.error("Public note load error:", err);
        setError(
          err.response?.data?.error || 
          "Unable to find this note. It may have been deleted or set to private."
        );
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchPublicNote();
    }
  }, [noteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Fetching shared eNote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 text-center">
          <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Access Denied / Not Found</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">{error}</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition duration-200 shadow-md"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 text-slate-800">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Banner header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
              <FiGlobe className="animate-spin-slow text-emerald-300" />
              Shared Publicly
            </span>
            <span className="text-xs text-white/70 flex items-center gap-1.5">
              <FiClock />
              {new Date(note.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            {note.title}
          </h1>
        </div>

        {/* Note Body */}
        <div className="p-8">
          <div className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
            {note.content}
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-slate-100">
              {note.tags.map(
                (tag, idx) =>
                  tag && (
                    <span
                      key={idx}
                      className="bg-slate-50 text-slate-600 text-xs px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5"
                    >
                      <FiTag className="text-slate-400" />
                      {tag}
                    </span>
                  )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            Powered by <strong className="text-blue-600 flex items-center gap-1"><FiBookOpen /> eNote Space</strong>
          </span>
          <Link to="/" className="text-blue-600 font-semibold hover:underline">
            Create your own notes space
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicNoteView;
