# Gin + GORM Web 项目说明

本文档介绍项目的目录结构以及各文件的职责与实现要点，便于快速理解与扩展。

## 项目概览

- HTTP 框架：Gin
- ORM：GORM（支持 SQLite、MySQL、Postgres）
- 配置：环境变量（支持 `.env`）
- 功能：基础中间件、健康检查、用户 CRUD 示例（已对齐 OJ 架构字段）

## 目录结构

```
.
├── .env                 # 当前环境配置（已设置为 MySQL 示例）
├── .env.example         # 环境配置示例
├── go.mod
├── go.sum
├── internal/
│   ├── config/
│   │   └── env.go       # 加载环境变量与默认值
│   ├── database/
│   │   └── db.go        # 数据库连接与连接池配置
│   ├── handlers/
│   │   └── user.go      # 用户模块的 HTTP 处理器（CRUD）
│   ├── models/
│   │   └── user.go      # 用户模型定义
│   └── router/
│       └── router.go    # 路由与中间件、健康检查
├── api/
│   └── openapi.yaml     # OpenAPI 规范，便于 Apifox/Postman 导入测试
└── main.go              # 程序入口：配置→数据库→迁移→路由→启动
```

## 文件解析

### `main.go`

- 职责：应用启动流程与生命周期管理。
- 关键步骤：
  1. `config.Load()` 读取 `.env` 或环境变量，构建配置。
  2. `database.Connect(cfg)` 按驱动建立 GORM 连接，并设置连接池。
  3. `db.AutoMigrate(&models.User{})` 自动迁移模型表结构。
  4. 若存在旧版遗留列 `users.name`，启动时自动删除以对齐新模型。
  5. `router.SetupRouter(db)` 初始化 Gin 路由和中间件。
  6. `app.Run(":" + cfg.Port)` 启动 HTTP 服务。

### `internal/config/env.go`

- 职责：集中管理应用配置（端口、数据库驱动和 DSN 等）。
- 实现：
  - 使用 `godotenv.Load()` 尝试加载 `.env`（文件不存在不报错）。
  - 读取 `PORT`、`DB_DRIVER`、`DB_DSN` 环境变量。
  - 默认值：`PORT=8080`、`DB_DRIVER=sqlite`、`DB_DSN=file:app.db?_fk=1`（若 `.env` 未指定）。
- 说明：当前仓库内 `.env` 已切换为 MySQL 连接示例；但代码层面默认回退到 SQLite，便于无配置情况下启动。

### `internal/database/db.go`

- 职责：建立并返回 `*gorm.DB` 连接；配置连接池。
- 实现：
  - 驱动选择：
    - `sqlite`：`gorm.Open(sqlite.Open(cfg.DBDsn))`
    - `mysql`：`gorm.Open(mysql.Open(cfg.DBDsn))`
    - `postgres`：`gorm.Open(postgres.Open(cfg.DBDsn))`
  - 日志：`logger.Info`，便于观察 SQL 执行情况。
  - 连接池：`SetMaxOpenConns(20)`、`SetMaxIdleConns(10)`。
- 错误处理：若驱动不支持或连接失败，返回明确错误。

### `internal/models/user.go`

- 职责：定义用户实体模型，供 CRUD 与迁移使用。
- 字段（对齐 OJ 架构 `users` 表）：
  - `ID` 主键（`BIGINT UNSIGNED`）
  - `Username` 唯一、长度 ≤ 50
  - `Email` 唯一、长度 ≤ 255
  - `PasswordHash` 哈希存储（不会出现在 JSON 返回）
  - `Role` 角色，`admin|student`，默认 `student`
  - `Status` 状态，`active|suspended`，默认 `active`
  - `LastLoginAt` 最近登录时间（可空）
  - `CreatedAt` / `UpdatedAt` 时间戳

### `internal/handlers/user.go`

- 职责：用户模块的 HTTP 处理器，操作数据库并返回 JSON。
- 接口实现：
  - `CreateUser`：`POST /api/v1/users/`，校验 `username`、`email`、`password`（≥6），`role` 可选（默认 `student`）；密码会进行哈希存储；响应不包含 `passwordHash`。
  - `ListUsers`：`GET /api/v1/users/`，查询全部用户列表。
  - `GetUser`：`GET /api/v1/users/:id`，按 ID 获取用户，未找到返回 404。
  - `UpdateUser`：`PUT /api/v1/users/:id`，支持部分字段更新（`email`、`password`、`role`、`status`）；若更新密码则重新哈希。
  - `DeleteUser`：`DELETE /api/v1/users/:id`，删除用户，成功返回 204。

### `internal/router/router.go`

- 职责：统一路由注册与中间件配置，暴露健康检查。
- 中间件：
  - `gin.Logger()`：请求日志
  - `gin.Recovery()`：panic 恢复
  - `cors.Default()`：默认 CORS 设置，方便前端联调
- 路由：
  - `GET /health`：健康检查，尝试执行 `SELECT 1` 检测数据库连接；正常返回 `{ "status": "ok" }`。
  - `API v1` 分组：`/api/v1`
    - 用户资源：`/api/v1/users`

### `.env` 与 `.env.example`

- `.env`：当前为 MySQL 示例（本地环境）。
  - `PORT=8080`
  - `DB_DRIVER=mysql`
  - `DB_DSN=root:password@tcp(127.0.0.1:3306)/gin_demo?parseTime=true&loc=Local`
- `.env.example`：提供各数据库的 DSN 示例；可复制为 `.env` 并按需修改。

### `go.mod` 与 `go.sum`

- `go.mod`：模块名 `Golang`，依赖列表由 `go get` 与 `go mod tidy` 管理。
- `go.sum`：锁定各依赖版本的校验信息，确保构建可重现。

### `api/openapi.yaml`

- 含 `/health` 与 `/api/v1/users` 的 Create/List/Detail/Update/Delete 接口定义。
- 请求体与响应字段对齐当前模型（`username/email/password/role/status`），响应隐藏 `passwordHash`。
- 可直接在 Apifox/Postman 导入进行测试。

### `sql/oj_schema_mysql.sql`

- 提供 OJ 平台的完整 MySQL 初始化脚本，包含 `users`/论坛/题库/标签/提交等表。
- 若你希望直接使用该架构，请在 MySQL 导入脚本并确保 `.env` 指向对应数据库。

## 运行与环境

- 安装依赖：`go mod tidy`（已执行）
- 启动：`go run .`
- 访问健康检查：`http://localhost:8080/health`
- 升级提示：从旧版迁移后，若 `users` 表仍有 `name` 列，启动过程会自动删除以避免插入错误。

## API 概览

- `POST /api/v1/users/`
- `GET /api/v1/users/`
- `GET /api/v1/users/:id`
- `PUT /api/v1/users/:id`
- `DELETE /api/v1/users/:id`

## 数据库配置示例

- SQLite：
  - `DB_DRIVER=sqlite`
  - `DB_DSN=file:app.db?_fk=1`
- MySQL：
  - `DB_DRIVER=mysql`
  - `DB_DSN=user:password@tcp(127.0.0.1:3306)/dbname?parseTime=true&loc=Local`
- Postgres：
  - `DB_DRIVER=postgres`
  - `DB_DSN=host=localhost user=user password=pass dbname=db port=5432 sslmode=disable TimeZone=Asia/Shanghai`

## 扩展建议

- 鉴权：JWT 或 session，保护用户接口
- 文档：Swagger(OpenAPI) 生成与路由注释
- 日志：引入 `zap` 做结构化日志与统一错误返回
- 部署：Docker 化，`docker-compose` 管理 MySQL/Postgres 与应用
