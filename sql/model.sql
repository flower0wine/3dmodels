-- 创建models表
CREATE TABLE models (
  -- 主键，使用UUID类型
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 模型名称，必填
  name TEXT NOT NULL,
  
  -- 模型描述，可选
  description TEXT,
  
  -- 缩略图路径，必填
  thumbnail_path TEXT NOT NULL,

  -- 缩略图URL，必填
  thumbnail_url TEXT NOT NULL,
  
  -- 存储路径，必填
  storage_path TEXT NOT NULL,
  
  -- 存储URL，必填
  storage_url TEXT NOT NULL,
  
  -- 分类，可选
  category TEXT,
  
  -- 创建时间，自动设置当前时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- 更新时间，自动设置当前时间
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- 作者ID，可选，外键关联到auth.users表
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- 文件格式，必填
  format TEXT NOT NULL,
  
  -- 文件大小，可选
  file_size BIGINT NOT NULL
);

-- 添加自动更新updated_at的触发器
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_models_updated_at
BEFORE UPDATE ON models
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- 添加RLS策略，仅允许作者修改自己的模型
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- 创建存储桶策略
CREATE POLICY "模型可以被任何已认证用户查看"
ON models FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "用户可以插入自己的模型"
ON models FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的模型"
ON models FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的模型"
ON models FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 创建索引以提高查询性能
CREATE INDEX idx_models_user_id ON models(user_id);
CREATE INDEX idx_models_created_at ON models(created_at);
CREATE INDEX idx_models_category ON models(category);
CREATE INDEX idx_models_format ON models(format);