-- OJ 平台 MySQL 架构初始化脚本 (MySQL 8+)
-- 字符集统一使用 utf8mb4，时间戳精度采用微秒

SET NAMES utf8mb4;                    -- 设置客户端字符集为 utf8mb4，支持完整 Unicode 包括 emoji
SET time_zone = '+00:00';             -- 设置时区为 UTC，确保时间戳一致性

-- 与项目 .env 对齐，默认数据库名为 gin_demo
CREATE DATABASE IF NOT EXISTS gin_demo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;  -- 创建数据库，如不存在则创建
USE gin_demo;                         -- 切换到目标数据库

-- 用户表：管理员/学生
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                                                   -- 用户主键，无符号大整数，自增
    username VARCHAR(50) NOT NULL UNIQUE,                                                            -- 用户名，最长50字符，非空且唯一
    email VARCHAR(255) NOT NULL UNIQUE,                                                              -- 邮箱地址，最长255字符，非空且唯一
    password_hash VARCHAR(255) NOT NULL,                                                             -- 密码哈希值，bcrypt 加密后存储
    role ENUM('admin','student') NOT NULL,                                                           -- 用户角色，枚举类型：管理员或学生
    status ENUM('active','suspended') NOT NULL DEFAULT 'active',                                     -- 用户状态，枚举类型：活跃或暂停，默认活跃
    last_login_at DATETIME(6) NULL,                                                                  -- 最后登录时间，微秒精度，可为空
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),                                    -- 创建时间，微秒精度，默认当前时间
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),    -- 更新时间，微秒精度，自动更新
    INDEX idx_users_role (role)                                                                      -- 角色字段索引，优化按角色查询
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;                                  -- InnoDB 引擎，utf8mb4 字符集

-- 论坛分类
CREATE TABLE forum_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                                                   -- 分类主键，无符号大整数，自增
    name VARCHAR(100) NOT NULL,                                                                      -- 分类名称，最长100字符，非空
    slug VARCHAR(120) NOT NULL UNIQUE,                                                               -- URL 友好标识符，最长120字符，非空且唯一
    description TEXT NULL,                                                                           -- 分类描述，文本类型，可为空
    created_by BIGINT UNSIGNED NOT NULL,                                                             -- 创建者用户ID，关联 users 表
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),                                    -- 创建时间，微秒精度，默认当前时间
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE              -- 外键约束：创建者删除时限制，更新时级联
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;                                  -- InnoDB 引擎，utf8mb4 字符集

-- 论坛主题（帖子主题）
CREATE TABLE forum_threads (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                                                   -- 主题主键，无符号大整数，自增
    category_id BIGINT UNSIGNED NOT NULL,                                                            -- 所属分类ID，关联 forum_categories 表
    author_id BIGINT UNSIGNED NOT NULL,                                                              -- 作者用户ID，关联 users 表
    title VARCHAR(200) NOT NULL,                                                                     -- 主题标题，最长200字符，非空
    is_locked TINYINT(1) NOT NULL DEFAULT 0,                                                         -- 是否锁定，布尔类型，默认0（未锁定）
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),                                    -- 创建时间，微秒精度，默认当前时间
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),    -- 更新时间，微秒精度，自动更新
    FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE ON UPDATE CASCADE,  -- 外键约束：分类删除时级联删除
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,              -- 外键约束：作者删除时限制，更新时级联
    INDEX idx_threads_category (category_id),                                                        -- 分类ID索引，优化按分类查询
    INDEX idx_threads_author (author_id)                                                             -- 作者ID索引，优化按作者查询
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;                                  -- InnoDB 引擎，utf8mb4 字符集

-- 论坛帖子（支持楼中楼回复）
CREATE TABLE forum_posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                                                   -- 帖子主键，无符号大整数，自增
    thread_id BIGINT UNSIGNED NOT NULL,                                                              -- 所属主题ID，关联 forum_threads 表
    author_id BIGINT UNSIGNED NOT NULL,                                                              -- 作者用户ID，关联 users 表
    parent_id BIGINT UNSIGNED NULL,                                                                  -- 父帖子ID，支持楼中楼回复，可为空
    content MEDIUMTEXT NOT NULL,                                                                     -- 帖子内容，中等文本类型，非空
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,                                                        -- 是否删除，布尔类型，默认0（未删除）
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),                                    -- 创建时间，微秒精度，默认当前时间
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),    -- 更新时间，微秒精度，自动更新
    FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE ON UPDATE CASCADE,       -- 外键约束：主题删除时级联删除
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,              -- 外键约束：作者删除时限制，更新时级联
    FOREIGN KEY (parent_id) REFERENCES forum_posts(id) ON DELETE SET NULL ON UPDATE CASCADE,        -- 外键约束：父帖删除时设为NULL，更新时级联
    INDEX idx_posts_thread (thread_id),                                                              -- 主题ID索引，优化按主题查询
    INDEX idx_posts_author (author_id)                                                               -- 作者ID索引，优化按作者查询
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;                                  -- InnoDB 引擎，utf8mb4 字符集

-- 题库（Problem）
CREATE TABLE problems (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                                                   -- 题目主键，无符号大整数，自增
    title VARCHAR(200) NOT NULL,                                                                     -- 题目标题，最长200字符，非空
    slug VARCHAR(220) NOT NULL UNIQUE,                                                               -- URL 友好标识符，最长220字符，非空且唯一
    description LONGTEXT NOT NULL,                                                                   -- 题目描述，长文本类型，非空
    input_format TEXT NULL,                                                                          -- 输入格式说明，文本类型，可为空
    output_format TEXT NULL,                                                                         -- 输出格式说明，文本类型，可为空
    sample_input TEXT NULL,                                                                          -- 样例输入，文本类型，可为空
    sample_output TEXT NULL,                                                                         -- 样例输出，文本类型，可为空
    difficulty ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',                              -- 难度等级，枚举类型，默认中等
    visibility ENUM('public','private') NOT NULL DEFAULT 'public',                                  -- 可见性，枚举类型，默认公开
    time_limit_ms INT UNSIGNED NOT NULL DEFAULT 1000,                                               -- 时间限制，毫秒，无符号整数，默认1000ms
    memory_limit_kb INT UNSIGNED NOT NULL DEFAULT 65536,                                            -- 内存限制，KB，无符号整数，默认64MB
    created_by BIGINT UNSIGNED NOT NULL,                                                             -- 创建者用户ID，关联 users 表
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),                                    -- 创建时间，微秒精度，默认当前时间
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),    -- 更新时间，微秒精度，自动更新
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,             -- 外键约束：创建者删除时限制，更新时级联
    INDEX idx_problems_visibility (visibility),                                                      -- 可见性索引，优化按可见性查询
    INDEX idx_problems_difficulty (difficulty)                                                       -- 难度索引，优化按难度查询
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;                                  -- InnoDB 引擎，utf8mb4 字符集

-- 题目标签
CREATE TABLE problem_tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                                                   -- 标签主键，无符号大整数，自增
    name VARCHAR(50) NOT NULL UNIQUE,                                                                -- 标签名称，最长50字符，非空且唯一
    color VARCHAR(7) NULL DEFAULT '#1890ff',                                                         -- 标签颜色，7字符十六进制色值，默认蓝色
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),                                    -- 创建时间，微秒精度，默认当前时间
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),    -- 更新时间，微秒精度，自动更新
    INDEX idx_problem_tags_name (name)                                                               -- 标签名称索引，优化按名称查询
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;                                  -- InnoDB 引擎，utf8mb4 字符集

-- 题目与标签映射（多对多）
CREATE TABLE problem_tag_map (
    problem_id BIGINT UNSIGNED NOT NULL,                                                             -- 题目ID，关联 problems 表
    tag_id BIGINT UNSIGNED NOT NULL,                                                                 -- 标签ID，关联 problem_tags 表
    PRIMARY KEY (problem_id, tag_id),                                                                -- 复合主键，确保题目-标签组合唯一
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE ON UPDATE CASCADE,           -- 外键约束：题目删除时级联删除，更新时级联
    FOREIGN KEY (tag_id) REFERENCES problem_tags(id) ON DELETE CASCADE ON UPDATE CASCADE            -- 外键约束：标签删除时级联删除，更新时级联
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;                                  -- InnoDB 引擎，utf8mb4 字符集

-- 提交（Submission）
CREATE TABLE submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                                                   -- 提交主键，无符号大整数，自增
    user_id BIGINT UNSIGNED NOT NULL,                                                                -- 提交用户ID，关联 users 表
    problem_id BIGINT UNSIGNED NOT NULL,                                                             -- 题目ID，关联 problems 表
    language VARCHAR(20) NOT NULL,                                                                   -- 编程语言，最长20字符，非空
    code LONGTEXT NOT NULL,                                                                          -- 提交代码，长文本类型，非空
    status ENUM('pending','running','accepted','wrong_answer','time_limit_exceeded','memory_limit_exceeded','runtime_error','compile_error','system_error') NOT NULL DEFAULT 'pending', -- 判题状态，枚举类型，默认待判
    score INT UNSIGNED NULL DEFAULT 0,                                                               -- 得分，无符号整数，默认0
    time_used_ms INT UNSIGNED NULL DEFAULT 0,                                                        -- 运行时间，毫秒，无符号整数，默认0
    memory_used_kb INT UNSIGNED NULL DEFAULT 0,                                                      -- 内存使用，KB，无符号整数，默认0
    judge_info JSON NULL,                                                                            -- 判题详细信息，JSON格式，可为空
    submitted_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),                                  -- 提交时间，微秒精度，默认当前时间
    judged_at DATETIME(6) NULL,                                                                      -- 判题完成时间，微秒精度，可为空
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,                 -- 外键约束：用户删除时级联删除，更新时级联
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE ON UPDATE CASCADE,           -- 外键约束：题目删除时级联删除，更新时级联
    INDEX idx_submissions_user_id (user_id),                                                         -- 用户ID索引，优化按用户查询
    INDEX idx_submissions_problem_id (problem_id),                                                   -- 题目ID索引，优化按题目查询
    INDEX idx_submissions_status (status),                                                           -- 状态索引，优化按状态查询
    INDEX idx_submissions_submitted_at (submitted_at)                                                -- 提交时间索引，优化按时间排序
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;                                  -- InnoDB 引擎，utf8mb4 字符集

-- 可选：初始化一个管理员账号（请替换密码哈希）
-- INSERT INTO users (username, email, password_hash, role, is_active) VALUES                        -- 插入管理员用户示例（已注释）
-- ('admin', 'admin@example.com', '$2a$10$...', 'admin', true);                                      -- 用户名、邮箱、密码哈希、角色、激活状态

-- 开发环境模拟数据（可重复执行，尽量幂等）
START TRANSACTION;                                                                                    -- 开始事务，确保数据插入的原子性

-- Users：五个基础账号（密码哈希为占位符，请替换为真实 bcrypt 哈希）
INSERT IGNORE INTO users (username, email, password_hash, role, is_active, created_at) VALUES        -- 插入用户数据，忽略重复键冲突
('admin', 'admin@example.com', '$2a$10$placeholder_hash_admin', 'admin', true, NOW()),               -- 管理员账号：admin/admin@example.com
('teacher1', 'teacher1@example.com', '$2a$10$placeholder_hash_teacher1', 'teacher', true, NOW()),     -- 教师账号：teacher1/teacher1@example.com
('student1', 'student1@example.com', '$2a$10$placeholder_hash_student1', 'student', true, NOW()),     -- 学生账号1：student1/student1@example.com
('student2', 'student2@example.com', '$2a$10$placeholder_hash_student2', 'student', true, NOW()),     -- 学生账号2：student2/student2@example.com
('student3', 'student3@example.com', '$2a$10$placeholder_hash_student3', 'student', true, NOW());     -- 学生账号3：student3/student3@example.com

-- Forum Categories：由 admin 创建
INSERT IGNORE INTO forum_categories (name, description, created_by, created_at) VALUES               -- 插入论坛分类数据，忽略重复键冲突
('算法讨论', '讨论各种算法和数据结构', 1, NOW()),                                                      -- 算法讨论分类，由用户ID=1（admin）创建
('题目求助', '遇到难题时寻求帮助', 1, NOW()),                                                          -- 题目求助分类，由用户ID=1（admin）创建
('经验分享', '分享编程和竞赛经验', 1, NOW()),                                                          -- 经验分享分类，由用户ID=1（admin）创建
('公告通知', '系统公告和重要通知', 1, NOW());                                                          -- 公告通知分类，由用户ID=1（admin）创建

-- Forum Threads：示例主题（按标题去重）
INSERT INTO forum_threads (title, category_id, author_id, created_at)                               -- 插入论坛主题，避免重复标题
SELECT '如何优化动态规划算法？', c.id, u.id, NOW()                                                    -- 主题：动态规划优化讨论
FROM forum_categories c, users u                                                                     -- 从分类和用户表中获取ID
WHERE c.name = '算法讨论' AND u.username = 'student1'                                                 -- 分类：算法讨论，创建者：student1
AND NOT EXISTS (SELECT 1 FROM forum_threads t WHERE t.title = '如何优化动态规划算法？');               -- 检查标题是否已存在

INSERT INTO forum_threads (title, category_id, author_id, created_at)                               -- 插入论坛主题，避免重复标题
SELECT '二分查找的边界问题', c.id, u.id, NOW()                                                        -- 主题：二分查找边界问题
FROM forum_categories c, users u                                                                     -- 从分类和用户表中获取ID
WHERE c.name = '题目求助' AND u.username = 'student2'                                                 -- 分类：题目求助，创建者：student2
AND NOT EXISTS (SELECT 1 FROM forum_threads t WHERE t.title = '二分查找的边界问题');                   -- 检查标题是否已存在

INSERT INTO forum_threads (title, category_id, author_id, created_at)                               -- 插入论坛主题，避免重复标题
SELECT '我的刷题心得分享', c.id, u.id, NOW()                                                          -- 主题：刷题心得分享
FROM forum_categories c, users u                                                                     -- 从分类和用户表中获取ID
WHERE c.name = '经验分享' AND u.username = 'student3'                                                 -- 分类：经验分享，创建者：student3
AND NOT EXISTS (SELECT 1 FROM forum_threads t WHERE t.title = '我的刷题心得分享');                     -- 检查标题是否已存在

-- Forum Posts：为主题添加示例回复（按 thread+author+前缀去重）
INSERT INTO forum_posts (thread_id, author_id, parent_id, content, created_at)                       -- 插入论坛回复，避免重复内容
SELECT t.id, u.id, NULL, '动态规划的关键是找到状态转移方程，建议多练习经典题型。', NOW()            -- 回复内容：动态规划学习建议
FROM forum_threads t, users u                                                                        -- 从主题和用户表中获取ID
WHERE t.title='如何优化动态规划算法？' AND u.username='teacher1'                                      -- 主题：动态规划优化，回复者：teacher1
AND NOT EXISTS (                                                                                     -- 检查是否已存在相似回复
  SELECT 1 FROM forum_posts p
  WHERE p.thread_id=t.id AND p.author_id=u.id AND p.content LIKE '动态规划的关键是%'                  -- 按内容前缀去重
);

INSERT INTO forum_posts (thread_id, author_id, parent_id, content, created_at)                       -- 插入论坛回复，避免重复内容
SELECT t.id, u.id, NULL, '二分查找要注意左右边界的处理，推荐使用左闭右开区间。', NOW()                -- 回复内容：二分查找边界处理建议
FROM forum_threads t, users u                                                                        -- 从主题和用户表中获取ID
WHERE t.title='二分查找的边界问题' AND u.username='admin'                                             -- 主题：二分查找边界，回复者：admin
AND NOT EXISTS (                                                                                     -- 检查是否已存在相似回复
  SELECT 1 FROM forum_posts p
  WHERE p.thread_id=t.id AND p.author_id=u.id AND p.content LIKE '二分查找要注意%'                    -- 按内容前缀去重
);

-- Problems：示例题目
INSERT INTO problems (title, slug, description, difficulty, visibility, created_by, created_at)      -- 插入题目数据，避免重复slug
SELECT '两数之和','two-sum','给定数组与目标值，返回索引。', 'easy','public', u.id, NOW()              -- 题目：两数之和，简单难度，公开可见
FROM users u WHERE u.username='admin'                                                                -- 创建者：admin用户
AND NOT EXISTS (SELECT 1 FROM problems WHERE slug='two-sum');                                        -- 检查slug是否已存在

INSERT INTO problems (title, slug, description, difficulty, visibility, created_by, created_at)      -- 插入题目数据，避免重复slug
SELECT '最长递增子序列','longest-increasing-subsequence','经典 DP 问题，O(n log n) 解法。', 'medium','public', u.id, NOW() -- 题目：最长递增子序列，中等难度，公开可见
FROM users u WHERE u.username='admin'                                                                -- 创建者：admin用户
AND NOT EXISTS (SELECT 1 FROM problems WHERE slug='longest-increasing-subsequence');                -- 检查slug是否已存在

-- Problem Tags：基础标签
INSERT IGNORE INTO problem_tags (name, created_at) VALUES                                            -- 插入题目标签，忽略重复名称
('数组', NOW()),                                                                                      -- 标签：数组
('哈希', NOW()),                                                                                      -- 标签：哈希
('动态规划', NOW()),                                                                                  -- 标签：动态规划
('图论', NOW()),                                                                                      -- 标签：图论
('字符串', NOW());                                                                                    -- 标签：字符串

-- Tag 映射：two-sum -> 数组, 哈希
INSERT INTO problem_tag_map (problem_id, tag_id)                                                     -- 插入题目-标签映射关系
SELECT p.id, t.id FROM problems p, problem_tags t                                                    -- 从题目和标签表中获取ID
WHERE p.slug='two-sum' AND t.name IN ('数组','哈希')                                                 -- 题目：两数之和，标签：数组、哈希
AND NOT EXISTS (                                                                                     -- 检查映射关系是否已存在
  SELECT 1 FROM problem_tag_map m WHERE m.problem_id=p.id AND m.tag_id=t.id                         -- 避免重复插入相同的映射
);

-- Tag 映射：LIS -> 动态规划, 数组
INSERT INTO problem_tag_map (problem_id, tag_id)                                                     -- 插入题目-标签映射关系
SELECT p.id, t.id FROM problems p, problem_tags t                                                    -- 从题目和标签表中获取ID
WHERE p.slug='longest-increasing-subsequence' AND t.name IN ('动态规划','数组')                      -- 题目：最长递增子序列，标签：动态规划、数组
AND NOT EXISTS (                                                                                     -- 检查映射关系是否已存在
  SELECT 1 FROM problem_tag_map m WHERE m.problem_id=p.id AND m.tag_id=t.id                         -- 避免重复插入相同的映射
);

COMMIT;                                                                                           -- 提交事务，确保所有模拟数据插入成功