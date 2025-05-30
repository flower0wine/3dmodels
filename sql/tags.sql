-- 创建标签表
CREATE TABLE tags (
  -- 主键，使用UUID类型
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 标签名称，必填
  name TEXT NOT NULL,
  
  -- 标签描述，可选
  description TEXT,
  
  -- 创建时间，自动设置当前时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- 更新时间，自动设置当前时间
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- 创建者ID，外键关联到auth.users表
  user_id UUID REFERENCES auth.users(id)
);

-- 创建标签与模型的关联表
CREATE TABLE model_tags (
  -- 主键，使用UUID类型
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 模型ID，外键关联到models表
  model_id UUID REFERENCES models(id) ON DELETE CASCADE NOT NULL,
  
  -- 标签ID，外键关联到tags表
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  
  -- 创建时间，自动设置当前时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- 更新时间，自动设置当前时间
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- 添加唯一约束，确保一个模型不会重复关联同一个标签
  UNIQUE(model_id, tag_id)
);

-- 添加自动更新updated_at的触发器
CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_model_tags_updated_at
BEFORE UPDATE ON model_tags
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- 添加RLS策略，控制标签访问权限
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 创建标签访问策略
CREATE POLICY "标签可以被任何用户查看"
ON tags FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "用户可以创建自己的标签"
ON tags FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "用户只能更新自己的标签"
ON tags FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的标签"
ON tags FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 添加RLS策略，控制模型标签关联的访问权限
ALTER TABLE model_tags ENABLE ROW LEVEL SECURITY;

-- 创建模型标签关联的访问策略
CREATE POLICY "模型标签关联可以被任何用户查看"
ON model_tags FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "用户可以为自己的模型添加标签"
ON model_tags FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM models
  WHERE id = model_id
));

CREATE POLICY "用户只能删除自己模型的标签关联"
ON model_tags FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM models
  WHERE id = model_id AND user_id = auth.uid()
));

-- 创建索引以提高查询性能
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_model_tags_model_id ON model_tags(model_id);
CREATE INDEX idx_model_tags_tag_id ON model_tags(tag_id);

-- 添加全文搜索支持
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tags_name_trgm ON tags USING GIN (name gin_trgm_ops);
CREATE INDEX idx_tags_description_trgm ON tags USING GIN (description gin_trgm_ops); 