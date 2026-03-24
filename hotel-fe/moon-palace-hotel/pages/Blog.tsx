import React from "react";
import { BLOG_POSTS } from "../services/mockData";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../components/Breadcrumb";

export const Blog: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-lux-50 font-sans pt-24 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-lux-100 hover:shadow-xl transition-all group flex flex-col cursor-pointer"
            >
              <div className="h-60 overflow-hidden relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-lux-900 uppercase tracking-wider">
                  {post.category}
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-xs text-lux-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {post.date}
                  </span>

                  <span className="flex items-center gap-1">
                    <User size={12} /> {post.author}
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-lux-900 mb-3 group-hover:text-lux-500 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-lux-600 text-sm mb-6 line-clamp-3 flex-1">
                  {post.excerpt}
                </p>

                <button className="text-lux-900 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Đọc thêm <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <button className="px-8 py-3 border border-lux-200 text-lux-600 rounded-full font-bold hover:bg-white hover:text-lux-900 hover:border-lux-900 transition-all">
            Xem thêm bài viết cũ hơn
          </button>
        </div>
      </div>
    </div>
  );
};
