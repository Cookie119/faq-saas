"""
FAQBot Service - using Groq + llama-3.1-8b-instant
"""

import httpx
from typing import List, Optional

from core.config import get_settings
from services.domain_loader import ParsedDomain
from services.knowledge_search import knowledge_search, SearchResult

settings = get_settings()

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
CONTEXT_CHAR_LIMIT = 6000


class BotResponse:
    def __init__(
        self,
        answer: str,
        retrieved_chunks: List[SearchResult],
        search_fallback: bool,
        tokens_used: int,
    ):
        self.answer = answer
        self.retrieved_chunks = retrieved_chunks
        self.search_fallback = search_fallback
        self.tokens_used = tokens_used


class FAQBot:

    async def ask(
        self,
        domain: ParsedDomain,
        question: str,
        history: Optional[List[dict]] = None,
    ) -> BotResponse:

        # 1. Retrieve relevant chunks
        results = knowledge_search.search(domain.chunks, question, top_k=4)
        has_results = any(r.score > 0 for r in results)

        # 2. Build context
        if has_results:
            context = knowledge_search.format_context(results)
        else:
            context = domain.raw[:CONTEXT_CHAR_LIMIT]

        # 3. Build system prompt
        system_prompt = self._build_system_prompt(domain, context)

        # 4. Build messages — Groq uses OpenAI format
        messages = [{"role": "system", "content": system_prompt}]
        if history:
            for msg in history[-6:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": question})

        # 5. Call Groq
        answer, tokens_used = await self._call_groq(messages)

        return BotResponse(
            answer=answer,
            retrieved_chunks=results,
            search_fallback=not has_results,
            tokens_used=tokens_used,
        )

    # ── Prompt Builder ────────────────────────────────────────────────────────

    def _build_system_prompt(self, domain: ParsedDomain, context: str) -> str:
        persona = (
            f"You are {domain.persona}."
            if domain.persona
            else f"You are a helpful FAQ assistant for {domain.name}."
        )

        fallback = (
            f'If the answer is not in the knowledge base, respond with: "{domain.fallback_msg}"'
            if domain.fallback_msg
            else "If the answer is not found, say you don't have that information and suggest contacting support."
        )

        return f"""{persona}

Respond in {domain.language}. Your tone should be: {domain.tone}.

Answer questions ONLY based on the knowledge base below. Do not invent information.
{fallback}

Keep answers concise (2-4 sentences). Use bullet points for multi-step answers.

─── KNOWLEDGE BASE ───────────────────────────
{context}
──────────────────────────────────────────────

Rules:
- Only answer from the knowledge base above
- Never fabricate facts, prices, policies, or procedures
- If greeted, respond warmly but briefly
- If unsure, say so and suggest the user contact support"""

    # ── Groq API ──────────────────────────────────────────────────────────────

    async def _call_groq(self, messages: list) -> tuple[str, int]:
        headers = {
            "Authorization": f"Bearer {settings.groq_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.ai_model,
            "max_tokens": settings.ai_max_tokens,
            "messages": messages,
            "temperature": 0.3,   # lower = more factual, less creative
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(GROQ_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        text = data["choices"][0]["message"]["content"]
        tokens = data.get("usage", {}).get("completion_tokens", 0)
        return text or "No response generated.", tokens


# Singleton
faq_bot = FAQBot()