"""
KnowledgeSearch
BM25-inspired keyword search over domain chunks.
No external dependencies — fast, works offline.
"""

import math
import re
from typing import List
from services.domain_loader import DomainChunk


STOPWORDS = {
    "the","a","an","is","it","in","on","at","to","for","of","and","or","but",
    "with","this","that","are","was","be","have","has","will","can","not",
    "your","you","we","our","how","what","when","where","why","who","i","do",
    "does","did","my","me","about","tell","please","thanks","get","give",
}


class SearchResult:
    def __init__(self, chunk: DomainChunk, score: float):
        self.heading = chunk.heading
        self.content = chunk.content
        self.score = round(score, 3)


class KnowledgeSearch:

    def search(self, chunks: List[DomainChunk], query: str, top_k: int = 4) -> List[SearchResult]:
        if not chunks:
            return []

        terms = self._tokenize(query)
        if not terms:
            return [SearchResult(c, 0.0) for c in chunks[:top_k]]

        scored = [
            SearchResult(chunk, self._score(chunk, terms))
            for chunk in chunks
        ]

        # Return top_k with score > 0, falling back to all chunks if nothing matches
        relevant = sorted([r for r in scored if r.score > 0], key=lambda x: -x.score)
        return relevant[:top_k] if relevant else [SearchResult(c, 0.0) for c in chunks[:top_k]]

    def format_context(self, results: List[SearchResult]) -> str:
        """Format results into a readable block for the prompt."""
        if not results:
            return ""
        return "\n\n".join(f"### {r.heading}\n{r.content}" for r in results)

    # ── Scoring ───────────────────────────────────────────────────────────────

    def _score(self, chunk: DomainChunk, query_terms: List[str]) -> float:
        full_text = (chunk.heading + " " + chunk.content).lower()
        score = 0.0

        for term in query_terms:
            # Strong signal: term appears in heading
            if term in chunk.heading.lower():
                score += 5.0

            # Medium signal: term in keyword index
            if term in chunk.keywords:
                score += 3.0

            # Weak signal: frequency in full text
            count = len(re.findall(re.escape(term), full_text))
            if count:
                score += count * 1.0

        # Normalise by log of text length to avoid bias toward long chunks
        return score / math.log(len(full_text) + 2)

    def _tokenize(self, text: str) -> List[str]:
        return [
            w for w in re.sub(r"[^a-z0-9\s]", " ", text.lower()).split()
            if len(w) > 2 and w not in STOPWORDS
        ]


# Singleton
knowledge_search = KnowledgeSearch()