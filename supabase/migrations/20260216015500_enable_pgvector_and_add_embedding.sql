-- Migration: Enable pgvector extension and add embedding column to posts table
-- Phase 1: Vector search infrastructure setup

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to posts table
-- Using vector(1536) for OpenAI text-embedding-3-small model
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Create index for vector similarity search
-- Using ivfflat index for efficient similarity search
-- Lists parameter set to rows/1000 (will use 10 initially, can be adjusted later)
CREATE INDEX IF NOT EXISTS posts_embedding_idx 
  ON posts 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- Note: The index will need to be reindexed as more posts are added
-- Recommended lists value: rows/1000, so adjust as the dataset grows
-- Can be updated later with: REINDEX INDEX posts_embedding_idx;
