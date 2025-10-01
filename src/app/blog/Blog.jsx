"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import blogData from "../data/blog.json";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from "../components/Header";
import Features from "../components/Features";
import { Pagination, Stack } from "@mui/material";

const Blog = () => {
  const router = useRouter();
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(blogData.blogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedBlogs = blogData.blogs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleBlogClick = (slug) => {
    router.push(`/blog/${slug}`);
  };


  return (
    <>
      <HeaderFile data={blogData} />

      <section className="py-16 px-6 sm:px-12 lg:px-32 bg-white">
        <div className="max-w-7xl mx-auto ">
          {/* Blog Cards */}
          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-10">
            {selectedBlogs.map((blog, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => handleBlogClick(blog.slug)}
              >
                <div className="relative">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-98 h-72 object-cover rounded-xl"
                  />
                  <div className="absolute bottom-0 left-30 bg-yellow-500 text-gray-900 text-sm px-4 py-2 rounded-t-lg rounded-b-none shadow border-t-4 border-l-4 border-r-4 border-white">
                    {blog.date}
                  </div>
                </div>
                <div className="mt-4 mb-4 p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {blog.description}
                  </p>
                  <button
                    className="text-green-700 text-sm font-semibold underline hover:text-green-900 transition"
                    onClick={() => handleBlogClick(blog.slug)}
                  >
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination UI */}

          <Stack spacing={2} className="mt-10">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, value) => handlePageChange(value)}
              variant="outlined"
              className="flex justify-center"
            />
          </Stack>

          {/* <div className="flex justify-center items-center gap-3 mt-10 select-none">
            {/* Left Arrow 
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-2xl text-gray-700 disabled:text-gray-300 bg-transparent border-none"
              style={{ background: "none" }}
            >
              &lt;
            </button>
            {/* Static Page Numbers 
            {["1", "2", "3", "4", "...", "10"].map((page, idx) =>
              page === "..." ? (
                <span key={idx} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(Number(page))}
                  className={`mx-1 ${
                    currentPage === Number(page)
                      ? "bg-yellow-500 text-black w-8 h-8 rounded-full font-semibold"
                      : "text-gray-700"
                  }`}
                  style={{
                    minWidth: currentPage === Number(page) ? "2.5rem" : "auto",
                    minHeight: currentPage === Number(page) ? "2.5rem" : "auto",
                  }}
                >
                  {page}
                </button>
              )
            )}
            {/* Right Arrow 
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-2xl text-gray-700 disabled:text-gray-300 bg-transparent border-none"
              style={{ background: "none" }}
            >
              &gt;
            </button>
          </div> */}
        </div>
      </section>

      <Features data={furnitureData.features} />

    </>
  );
};

export default Blog;
