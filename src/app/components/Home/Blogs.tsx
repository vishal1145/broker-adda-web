"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface BlogItem {
  slug: string;
  title: string;
  date: string;
  image: string;
  description: string;
}

interface BlogsData {
  title: string;
  subtitle: string;
  button: string;
  items: BlogItem[];
}

const Blogs = ({ data = { subtitle: "", title: "", button: "", items: [] } }: { data: BlogsData }) => {

  const router = useRouter();

  const handleOpenBlogPage = (e: React.MouseEvent) =>{
    e.preventDefault();
    router.push("/blog");
  }

  const handleBlogDetails = (slug: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    router.push(`/blog/${slug}`);
  };

  return (
    <section className="bg-white py-16">
      <div className="w-full mx-auto">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
        <div>
          <p className="text-xl text-gray-900  text-left">
            <span className="text-yellow-500">—</span> {data.subtitle}
          </p>
          <h2 className="text-4xl font-medium text-gray-900 mt-2 text-center">
            <span>{(data.title || "").split(" ").slice(0, 3).join(" ")}</span>
            <span className="block text-green-900  text-left">
              {(data.title || "").split(" ").slice(3).join(" ")}
            </span>
          </h2>
        </div>
        <button
          onClick={handleOpenBlogPage}
          className="bg-green-900 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-green-800"
        >
          {/* {data.button} */}
          View All Blogs
        </button>
      </div>

      {/* Blog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {(data.items || []).map((blog, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition text-left "
          >
            <div className="relative">
              {blog.image ? (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-52 object-cover"
                />
              ) : null}
              <div className="absolute bottom-0 left-32 bg-yellow-500 text-gray-900 text-sm px-4 py-2 rounded-t-lg  rounded-b-none shadow border-t-4 border-l-4  border-r-4 border-white">
                {blog.date}
              </div>
            </div>
            <div className="pt-8 px-5 pb-5">
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                {blog.title}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{blog.description}</p>
              <button
                onClick={(e) => handleBlogDetails(blog.slug, e)}
                className="text-green-900 text-sm font-semibold hover:underline flex items-center"
              >
                Read More
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 w-5 h-5 text-green-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
};

export default Blogs;
