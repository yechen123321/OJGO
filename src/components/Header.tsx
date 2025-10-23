import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-[#F9F9F9]">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded bg-blue-500 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
            </svg>
          </div>
          <span className="font-semibold text-[18px] text-gray-900">
            CodeJudge
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-gray-600 text-[15px]">
          <Link
            to="/"
            className="inline-block transition-all duration-200 ease-out hover:text-gray-900 hover:text-[16px]"
          >
            首页
          </Link>
          <Link
            to="/problems"
            className="inline-block transition-all duration-200 ease-out hover:text-gray-900 hover:text-[16px]"
          >
            题库
          </Link>
          <Link
            to="/weekly-tests"
            className="inline-block transition-all duration-200 ease-out hover:text-gray-900 hover:text-[16px]"
          >
            周测
          </Link>
          <a
            href="#"
            className="inline-block transition-all duration-200 ease-out hover:text-gray-900 hover:text-[16px]"
          >
            讨论
          </a>
        </nav>

        {/* Search */}
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 !text-[15px] text-sm inline-block text-[#0056A4] hover:text-[#0056A4] hover:!text-[16px] hover:cursor-pointer transition-all duration-200 ease-out">
            登录
          </button>
          <button className="px-3 py-1.5 !text-[15px] inline-block bg-[#0056A4] !text-white hover:text-white rounded-md hover:cursor-pointer hover:bg-[#1966AC] transition-all duration-200 ease-out hover:!text-[16px]">
            注册
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
