#!/usr/bin/env python3
"""Integrate approved standalone HTML into existing VraxisRSVP preview wrappers.
Usage: python3 tools/integrate_approved_interiors.py --repo . --approved ./approved-interiors --dry-run
Then remove --dry-run after reviewing the report. Never modifies live site remotely.
"""
import argparse, hashlib, json, pathlib, re, sys

def digest(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]

def replace_template(wrapper, interior):
    # The existing previews embed their interior in const TEMPLATE="..."; iframe.srcdoc=TEMPLATE.
    match = re.search(r'\bconst\s+TEMPLATE\s*=\s*("(?:\\.|[^"\\])*")\s*;', wrapper, re.S)
    if not match:
        raise ValueError("Expected const TEMPLATE JSON string not found")
    old = json.loads(match.group(1))
    if not isinstance(old, str) or "<html" not in old.lower():
        raise ValueError("Existing embedded template is not HTML")
    if 'frame.srcdoc=TEMPLATE' not in wrapper:
        raise ValueError("Preview wrapper no longer uses expected srcdoc binding")
    # JSON serialisation escapes HTML quotes, backslashes, control characters.
    # Escape '<' in the JS string to avoid terminating the outer script on </script>.
    encoded = json.dumps(interior, ensure_ascii=True).replace("<", "\\u003c")
    updated = wrapper[:match.start(1)] + encoded + wrapper[match.end(1):]
    assert 'frame.srcdoc=TEMPLATE' in updated
    return updated, old

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=pathlib.Path, required=True)
    parser.add_argument("--approved", type=pathlib.Path, required=True)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--ids", nargs="*", default=[f"{i:03d}" for i in range(1,21)])
    args = parser.parse_args()
    report = []
    failed = False
    for id in args.ids:
        if not re.fullmatch(r"0[01][0-9]|020", id) or id == "000":
            raise ValueError(f"Invalid template ID: {id}")
        approved = args.approved / f"{id}.html"
        target = args.repo / f"preview-{id}.html"
        try:
            interior = approved.read_text(encoding="utf-8")
            wrapper = target.read_text(encoding="utf-8")
            if not re.search(r"<html\b", interior, re.I):
                raise ValueError("Approved file is not a complete HTML document")
            updated, previous = replace_template(wrapper, interior)
            record = {"id":id,"approved_sha":digest(interior),"old_sha":digest(previous),"changed":interior!=previous,"bytes":len(updated.encode("utf-8"))}
            if not args.dry_run and record["changed"]:
                target.write_text(updated, encoding="utf-8")
            report.append(record)
        except (OSError, ValueError, AssertionError) as e:
            report.append({"id":id,"error":str(e)})
            failed = True
    print(json.dumps(report, indent=2))
    if failed:
        sys.exit("Some previews were not integrated. Resolve errors before merging.")

if __name__ == "__main__":
    main()
