import React from 'react'

const problems = [
  { id: 1, title: '两数之和', difficulty: '简单', acceptance: '52.3%', submissions: '2.8M', tags: ['数组', '哈希表'] },
  { id: 2, title: '二叉树的最大深度', difficulty: '简单', acceptance: '76.4%', submissions: '1.5M', tags: ['树', 'DFS'] },
  { id: 3, title: '新增数字子序列', difficulty: '中等', acceptance: '35.2%', submissions: '1.2M', tags: ['双指针', '滑动窗口'] },
  { id: 4, title: '合并两个有序链表', difficulty: '困难', acceptance: '48.7%', submissions: '664K', tags: ['链表', '递归'] },
  { id: 5, title: '有效的括号', difficulty: '简单', acceptance: '44.3%', submissions: '2.1M', tags: ['栈', '字符串'] },
  { id: 6, title: '三数之和', difficulty: '中等', acceptance: '31.7%', submissions: '1.8M', tags: ['排序', '双指针'] }
]

const HotList: React.FC = () => {

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl !font-bold text-gray-900">热门题目</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                placeholder="搜索题目..." 
                className="w-72 md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="bg-white hover:cursor-pointer rounded-xl border border-gray-200 shadow-sm flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-400 font-medium w-8">#{problem.id}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{problem.title}</h3>
                    {/* 难度 Pill */}
                    <span
                      className={`${
                        problem.difficulty === '简单'
                          ? 'bg-green-100 text-green-600'
                          : problem.difficulty === '中等'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-red-100 text-red-600'
                      } inline-flex items-center rounded-full px-2 py-0.5 text-xs`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                  {/* 标签 Chips */}
                  <div className="mt-2 flex items-center gap-2">
                    {problem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右侧指标与操作 */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  {/* 通过率 */}
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  <span className="text-gray-700">
                    通过率 <span className="text-gray-900 font-medium">{problem.acceptance}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  {/* 提交数 */}
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M12 22a10 10 0 110-20 10 10 0 010 20z" />
                  </svg>
                  <span className="text-gray-900">{problem.submissions}</span>
                </div>
                <button className="text-blue-500 hover:text-blue-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <button className="hover:cursor-pointer inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 font-medium transition-all duration-200 ease-out hover:scale-105">
            查看全部题目
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default HotList