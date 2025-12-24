"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import {
  createPageThunk,
  updatePageThunk,
  selectPages,
} from "@/store/slices/pages";

const defaultSections = [
  { section1: [] },
  { section2: [] },
  { section3: [] },
  { section4: [] },
];

const templates = [
  { value: "home", label: "Home" },
  { value: "creators", label: "Creators" },
  { value: "services", label: "Services" },
  { value: "how_it_works", label: "How It Works" },
  { value: "pricing", label: "Pricing" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
];

const statusOptions = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
  { value: "draft", label: "Draft" },
];

const PageForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const pages = useSelector(selectPages);
  const isEdit = Boolean(params?.id);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    template: "home",
    status: "1",
    meta_title: "",
    meta_author: "",
    meta_keywords: "",
    meta_description: "",
    meta_feature_image: "",
    data: defaultSections,
  });

  useEffect(() => {
    if (isEdit && pages.length > 0) {
      const page = pages.find((p) => p.id === params.id);
      if (page) {
        setForm({
          ...form,
          ...page,
          data: page.data || defaultSections,
        });
      }
    }
    // eslint-disable-next-line
  }, [isEdit, params.id, pages]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "title" && !isEdit) {
      setForm((prev) => ({ ...prev, slug: value.toLowerCase().replace(/\s+/g, "-") }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      dispatch(updatePageThunk({ ...form, id: params.id }));
    } else {
      dispatch(createPageThunk(form));
    }
    router.push("/admin/pages");
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-2">{isEdit ? "Edit Page" : "Create Pages"}</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 font-medium">Title*</label>
          <input name="title" value={form.title} onChange={handleChange} required className="w-full border p-2 rounded" />
          <label className="block mt-4 mb-1 font-medium">Slug</label>
          <input name="slug" value={form.slug} onChange={handleChange} disabled={isEdit} className="w-full border p-2 rounded bg-gray-100" />
          <label className="block mt-4 mb-1 font-medium">Template*</label>
          <select name="template" value={form.template} onChange={handleChange} required className="w-full border p-2 rounded">
            {templates.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <label className="block mt-4 mb-1 font-medium">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border p-2 rounded">
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <label className="block mt-4 mb-1 font-medium">Meta Title</label>
          <input name="meta_title" value={form.meta_title} onChange={handleChange} className="w-full border p-2 rounded" />
          <label className="block mt-4 mb-1 font-medium">Meta Author</label>
          <input name="meta_author" value={form.meta_author} onChange={handleChange} className="w-full border p-2 rounded" />
          <label className="block mt-4 mb-1 font-medium">Meta Keywords</label>
          <input name="meta_keywords" value={form.meta_keywords} onChange={handleChange} className="w-full border p-2 rounded" />
          <label className="block mt-4 mb-1 font-medium">Meta Description</label>
          <textarea name="meta_description" value={form.meta_description} onChange={handleChange} className="w-full border p-2 rounded" />
          <label className="block mt-4 mb-1 font-medium">Meta Feature Image</label>
          <input name="meta_feature_image" value={form.meta_feature_image} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <div className="mb-2 font-medium">Sections</div>
          <div className="flex space-x-2 mb-4">
            {form.data.map((section, idx) => (
              <button
                type="button"
                key={idx}
                className="px-3 py-1 rounded bg-gray-200"
                // onClick={() => setActiveSection(idx)}
              >
                Section {idx + 1}
              </button>
            ))}
          </div>
          {/* Section details UI can be expanded here */}
          <div className="border rounded p-4 bg-gray-50 text-gray-500">Section editor coming soon...</div>
        </div>
        <div className="md:col-span-2 flex justify-end mt-4">
          <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700">
            {isEdit ? "Update Page" : "Create Page"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PageForm;
