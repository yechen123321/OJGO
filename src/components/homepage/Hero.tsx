import React from "react";
import { BookOpen, ChevronRight, Flame } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-1 rounded-md bg-blue-100 text-blue-600 text-sm font-medium mb-6">
          <Flame className="mr-1 h-3 w-3" />
          每日一题挑战进行中
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl !font-bold text-gray-900 mb-6 leading-tight">
          提升编程能力的
          <span className="text-blue-500">最佳平台</span>
        </h1>

        {/* Description */}
        <p className="text-[16px] text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          3000+ 精选算法题目，助你掌握核心算法思想，轻松应对技术面试
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button className="px-5 py-4 hover:cursor-pointer bg-blue-500 !text-white font-medium rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center">
            开始做题
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
          <button className="px-5 py-4 hover:cursor-pointer border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            学习路径
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
