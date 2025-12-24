"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPages,
  deletePageThunk,
  selectPages,
  selectPagesLoading,
  selectPagesPagination,
} from "@/store/slices/pages";

// Example: You can replace this with your own modal/form logic


const PageList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pages = useSelector(selectPages);
  const loading = useSelector(selectPagesLoading);
  const pagination = useSelector(selectPagesPagination);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPages(pagination.currentPage, pagination.perPage));
  }, [dispatch, pagination.currentPage, pagination.perPage]);

  return (
    <AdminLayout>
        <div className="p-6 space-y-6">
      <div className="p-4 bg-white rounded-xl shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Pages</h2>
          <button
            className="bg-blue-800 text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform font-semibold"
            onClick={() => router.push('/admin/pages/create')}
          >
            + New Page
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700">
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Slug</th>
                <th className="px-4 py-3 text-left font-semibold">Template</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Created at</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center p-6">Loading...</td></tr>
              ) : pages.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-6 text-gray-400">No pages found.</td></tr>
              ) : (
                pages.map((page: any) => (
                  <tr key={page.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{page.title}</td>
                    <td className="px-4 py-3">{page.slug}</td>
                    <td className="px-4 py-3">{page.template}</td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={page.status === 1}
                          readOnly
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-500 rounded-full peer peer-checked:bg-pink-600 transition-all duration-200 relative">
                          <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${page.status === 1 ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </label>
                    </td>
                    <td className="px-4 py-3">{page.created_at ? new Date(page.created_at).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3 flex gap-2 items-center">
                      <button
                        className="p-1 text-pink-600 hover:text-pink-800 transition"
                        title="Edit"
                        onClick={() => router.push(`/admin/pages/${page.id}/edit`)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="p-1 text-red-500 hover:text-red-700 transition"
                        title="Delete"
                        onClick={() => setConfirmDeleteId(page.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
              </div>
      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="mb-4 text-sm text-gray-600">Are you sure you want to delete this page? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                onClick={() => {
                  dispatch(deletePageThunk(confirmDeleteId));
                  setConfirmDeleteId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PageList;
