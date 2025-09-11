import React from "react";
import { useNavigate } from "react-router-dom";
import blogNews from "../data/blognews.json"; 

const Blog = () => {
  const navigate = useNavigate();

  const handleReadMore = (blog) => {
    // Transform the blog data to match what BlogDetails expects
    const transformedBlog = {
      id: blog.id,
      title: blog.title,
      description: blog.description,
      content: blog.content || blog.description,
      image: blog.image,
      date: blog.date,
      author: blog.author || "Admin",
      category: blog.category || "Furniture",
      tags: blog.tags || ["Furniture", "Design", "Home"],
      readTime: blog.readTime || "5 min read",
      views: blog.views || 1250
    };

    // Store in localStorage for persistence
    localStorage.setItem('currentBlog', JSON.stringify(transformedBlog));
    
    console.log('Navigating to blog details:', transformedBlog);
    
    navigate(`/blogdetails/${blog.id}`, {
      state: { blogData: transformedBlog }
    });
  };

  return (
    <section className="py-16 bg-white px-6 sm:px-12 lg:px-32 ">
      <div className="max-w-7xl mx-auto ">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
            <span className="w-8 h-0.5 bg-yellow-500"></span>
            <span className="font-medium">Related News & Blogs</span>
          </p>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            Latest Related <span className="text-green-800">News & Blogs</span>
          </h2>
        </div>

        {/* Blog Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {blogNews.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => handleReadMore(blog)}
            >
              <div className="relative">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-56 object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', blog.image);
                    e.target.src = '/images/blog-default.jpg'; // Fallback image
                  }}
                />
                <div className="absolute bottom-0 left-32 bg-yellow-500 text-gray-900 text-sm px-4 py-2 rounded-t-lg rounded-b-none shadow border-t-4 border-l-4 border-r-4 border-white">
                  {blog.date}
                </div>
              </div>
              <div className="p-6 ">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
                  {blog.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{blog.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click when clicking button
                    handleReadMore(blog);
                  }}
                  className="text-green-700 text-sm font-semibold underline hover:text-green-900 transition"
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
