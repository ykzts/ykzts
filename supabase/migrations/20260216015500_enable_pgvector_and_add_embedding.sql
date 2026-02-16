-- Migration: Enable pgvector extension and add embedding column to posts table
-- Phase 1: Vector search infrastructure setup

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to posts table
-- Using vector(1536) for OpenAI text-embedding-3-small model
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Create index for vector similarity search
-- Using HNSW index for efficient similarity search
-- HNSW works well on empty tables and handles incremental inserts without requiring retraining
-- Unlike IVFFlat which needs k-means clustering on existing data at creation time
CREATE INDEX IF NOT EXISTS posts_embedding_idx 
  ON posts 
  USING hnsw (embedding vector_cosine_ops);

-- Note: HNSW provides better recall for incremental inserts compared to IVFFlat
-- For blog-scale datasets with infrequent writes, HNSW is recommended
-- HNSW may require periodic reindexing during heavy update/delete churn
