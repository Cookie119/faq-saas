"""
DomainLoader
Parses raw markdown (from DB) into a structured domain object with searchable chunks.
Each ## heading becomes one chunk.
"""

import re
from typing import Optional


class DomainChunk:
    def __init__(self, heading: str, content: str):
        self.heading = heading
        self.content = content
        self.tokens = len(content) // 4  # naive estimate
        self.keywords = self._extract_keywords(heading + " " + content)

    def _extract_keywords(self, text: str) -> list[str]:
        stopwords = {
            "the","a","an","is","it","in","on","at","to","for","of","and","or","but",
            "with","this","that","are","was","be","have","has","will","can","not",
            "your","you","we","our","how","what","when","where","why","who","i",
        }
        return [
            w for w in re.sub(r"[^a-z0-9\s]", " ", text.lower()).split()
            if len(w) > 2 and w not in stopwords
        ]


class ParsedDomain:
    def __init__(
        self,
        id: str,
        slug: str,
        name: str,
        persona: Optional[str],
        tone: str,
        language: str,
        fallback_msg: Optional[str],
        raw: str,
        chunks: list[DomainChunk],
    ):
        self.id = id
        self.slug = slug
        self.name = name
        self.persona = persona
        self.tone = tone
        self.language = language
        self.fallback_msg = fallback_msg
        self.raw = raw
        self.chunks = chunks


class DomainLoader:

    def parse(self, domain_db) -> ParsedDomain:
        """
        Takes a Domain DB model and returns a ParsedDomain ready for search + AI.
        Frontmatter fields on the DB model take priority over anything in the markdown.
        """
        raw = domain_db.md_content
        body, fm = self._extract_frontmatter(raw)
        chunks = self._split_chunks(body)

        return ParsedDomain(
            id=domain_db.id,
            slug=domain_db.slug,
            name=domain_db.display_name,
            persona=domain_db.persona or fm.get("persona"),
            tone=domain_db.tone or fm.get("tone", "helpful and professional"),
            language=domain_db.language or fm.get("language", "English"),
            fallback_msg=domain_db.fallback_msg or fm.get("fallback"),
            raw=body,
            chunks=chunks,
        )

    def extract_frontmatter_defaults(self, md_content: str) -> dict:
        """
        Pull frontmatter from an uploaded .md file so we can pre-fill
        the domain creation form for the user.
        """
        body, fm = self._extract_frontmatter(md_content)
        first_h1 = re.search(r"^#\s+(.+)", body, re.MULTILINE)
        return {
            "name": fm.get("name", first_h1.group(1).strip() if first_h1 else ""),
            "persona": fm.get("persona", ""),
            "tone": fm.get("tone", "helpful and professional"),
            "language": fm.get("language", "English"),
            "fallback": fm.get("fallback", ""),
        }

    # ── Private ───────────────────────────────────────────────────────────────

    def _extract_frontmatter(self, raw: str) -> tuple[str, dict]:
        """Strip YAML frontmatter between --- delimiters."""
        match = re.match(r"^---\n([\s\S]+?)\n---\n([\s\S]*)$", raw.strip())
        if not match:
            return raw, {}

        fm = {}
        for line in match.group(1).splitlines():
            if ":" in line:
                key, _, val = line.partition(":")
                fm[key.strip()] = val.strip().strip("\"'")

        return match.group(2), fm

    def _split_chunks(self, body: str) -> list[DomainChunk]:
        """Split by ## headings. Each section = one searchable chunk."""
        sections = re.split(r"\n(?=##\s)", body)
        chunks = []

        for section in sections:
            lines = section.strip().splitlines()
            if not lines:
                continue

            if lines[0].startswith("##"):
                heading = lines[0].lstrip("#").strip()
                content = "\n".join(lines[1:]).strip()
            else:
                heading = "General"
                content = "\n".join(lines).strip()

            if content:
                chunks.append(DomainChunk(heading=heading, content=content))

        return chunks


# Singleton
domain_loader = DomainLoader()