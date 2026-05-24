import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiShare2,
  FiLock,
  FiUnlock,
  FiCopy,
  FiX,
  FiTag,
  FiBookOpen,
} from "react-icons/fi";
import axiosWrapper from "../utils/AxiosWrapper";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    isPublic: false,
  });

  const userToken = localStorage.getItem("userToken");

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      let url = "/note";
      const params = [];
      if (selectedTag) params.push(`tag=${encodeURIComponent(selectedTag)}`);
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await axiosWrapper.get(url, getHeaders());
      if (response.data.success) {
        setNotes(response.data.data);
        
        // Extract all unique tags
        const tags = new Set();
        response.data.data.forEach((note) => {
          if (note.tags && Array.isArray(note.tags)) {
            note.tags.forEach((tag) => {
              if (tag) tags.add(tag.trim());
            });
          }
        });
        setAvailableTags(Array.from(tags));
      } else {
        toast.error("Failed to load notes");
      }
    } catch (error) {
      console.error("Fetch notes error:", error);
      toast.error(error.response?.data?.error || "Error loading notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedTag]);

  // Debounced/Triggered search handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setFormData({
      title: "",
      content: "",
      tags: "",
      isPublic: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags ? note.tags.join(", ") : "",
      isPublic: note.isPublic || false,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Please fill in title and content");
      return;
    }

    // Process tags
    const tagArray = formData.tags
      ? formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
      : [];

    const requestData = {
      title: formData.title,
      content: formData.content,
      tags: tagArray,
      isPublic: formData.isPublic,
    };

    try {
      if (editingNote) {
        // Update note
        const response = await axiosWrapper.put(
          `/note/${editingNote._id}`,
          requestData,
          getHeaders()
        );
        if (response.data.success) {
          toast.success("Note updated successfully!");
          setIsModalOpen(false);
          fetchNotes();
        } else {
          toast.error("Failed to update note");
        }
      } else {
        // Create note
        const response = await axiosWrapper.post("/note", requestData, getHeaders());
        if (response.data.success) {
          toast.success("Note created successfully!");
          setIsModalOpen(false);
          fetchNotes();
        } else {
          toast.error("Failed to create note");
        }
      }
    } catch (error) {
      console.error("Save note error:", error);
      toast.error(error.response?.data?.error || "Error saving note");
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await axiosWrapper.delete(`/note/${noteId}`, getHeaders());
      if (response.data.success) {
        toast.success("Note deleted successfully!");
        fetchNotes();
      } else {
        toast.error("Failed to delete note");
      }
    } catch (error) {
      console.error("Delete note error:", error);
      toast.error(error.response?.data?.error || "Error deleting note");
    }
  };

  const handleTogglePublic = async (note) => {
    try {
      const response = await axiosWrapper.put(
        `/note/${note._id}`,
        { isPublic: !note.isPublic },
        getHeaders()
      );
      if (response.data.success) {
        toast.success(
          response.data.data.isPublic
            ? "Note is now Public! Anyone with the link can view it."
            : "Note is now Private."
        );
        fetchNotes();
      } else {
        toast.error("Failed to update note privacy");
      }
    } catch (error) {
      console.error("Toggle public error:", error);
      toast.error(error.response?.data?.error || "Error updating note privacy");
    }
  };

  const copyShareLink = (noteId) => {
    const shareUrl = `${window.location.protocol}//${window.location.host}/public-note/${noteId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Public share link copied to clipboard!");
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
            <FiBookOpen className="text-blue-600" />
            eNote Space
          </h1>
          <p className="text-slate-500 mt-1">Create, organize, and share your notes seamlessly.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg transition duration-200"
        >
          <FiPlus className="text-lg" />
          New Note
        </button>
      </div>

      {/* Search & Tag Filter Grid */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-1/3 relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm transition"
          />
          <button type="submit" className="absolute left-3 top-3 text-slate-400 hover:text-blue-600">
            <FiSearch className="text-lg" />
          </button>
        </form>

        {/* Tag Filters */}
        <div className="w-full md:w-2/3 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedTag("")}
            className={`px-4 py-2 text-xs font-semibold rounded-full border transition duration-200 flex items-center gap-1.5 ${
              selectedTag === ""
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Notes
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition duration-200 flex items-center gap-1.5 ${
                selectedTag === tag
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <FiTag className="text-2xs" />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
          <FiBookOpen className="mx-auto text-5xl text-slate-300 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-700">No notes found</h3>
          <p className="text-slate-400 text-sm mt-1">Get started by creating your first eNote today!</p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 bg-slate-100 hover:bg-slate-200 text-blue-600 font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            Create Note
          </button>
        </div>
      ) : (
        /* Notes Masonry/Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 hover:border-slate-200 overflow-hidden flex flex-col transition duration-300 transform hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="p-5 pb-3 flex justify-between items-start gap-4">
                <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">
                  {note.title}
                </h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePublic(note)}
                    title={note.isPublic ? "Public (Shared)" : "Private (Personal)"}
                    className={`p-1.5 rounded-lg transition ${
                      note.isPublic
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                    }`}
                  >
                    {note.isPublic ? <FiUnlock size={14} /> : <FiLock size={14} />}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-5 py-2 flex-grow">
                {/* Render clean text summary */}
                <p className="text-slate-500 text-sm line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              {/* Tags Section */}
              {note.tags && note.tags.length > 0 && (
                <div className="px-5 py-2 flex flex-wrap gap-1">
                  {note.tags.map(
                    (tag, idx) =>
                      tag && (
                        <span
                          key={idx}
                          className="bg-slate-50 text-slate-600 text-xs px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1"
                        >
                          <FiTag className="text-3xs" />
                          {tag}
                        </span>
                      )
                  )}
                </div>
              )}

              {/* Card Footer */}
              <div className="px-5 py-4 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center mt-4">
                <span className="text-2xs text-slate-400">
                  {new Date(note.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                
                <div className="flex items-center gap-2">
                  {note.isPublic && (
                    <button
                      onClick={() => copyShareLink(note._id)}
                      title="Copy Public Link"
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    >
                      <FiShare2 size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEditModal(note)}
                    title="Edit Note"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <FiEdit size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    title="Delete Note"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
              <h2 className="font-bold text-lg">
                {editingNote ? "Edit eNote" : "Create New eNote"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics II - Lecture 3 Notes"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Content
                </label>
                <textarea
                  placeholder="Write your note contents here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm transition resize-none font-mono text-slate-800 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tags <span className="text-2xs font-normal text-slate-400">(comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. calculus, physics, assignment"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm transition"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">Public Note sharing</span>
                  <span className="text-2xs text-slate-400">
                    Allow anyone with the link to view this note.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 border border-slate-200 hover:bg-slate-50 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg transition"
                >
                  Save eNote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
