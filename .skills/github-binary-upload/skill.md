---
name: github-binary-upload
description: "Upload binary files to an existing GitHub repository using Git blobs encoded as base64, validate blob integrity by SHA, create a tree and commit, then fast-forward the target branch."
---

# GitHub Binary Upload

Use this skill when a binary file (image, archive, model, audio, etc.) must be committed through the GitHub connector and there is no direct binary upload action.

## Workflow

1. Optimize the asset for its intended use before upload when practical.
2. Read the binary bytes and encode them as base64.
3. Compute the expected Git blob SHA locally:
   `sha1("blob " + byte_length + "\0" + bytes)`.
4. Call GitHub `create_blob` with `encoding="base64"`.
5. Compare the returned SHA to the expected Git blob SHA. If they differ, do not commit that blob.
6. Fetch the target branch head and base tree.
7. Call `create_tree` with the validated blob SHA and desired repository path.
8. Call `create_commit` using the current branch head as parent.
9. Call `update_ref` with `force=false`.
10. Verify the branch head or repository path after the update.

## Payload strategy

For large binary assets, avoid sending several large base64 payloads in one request. Prefer:
- one asset at a time;
- optimized WebP/AVIF previews for web projects;
- smaller intermediate assets if connector payloads are truncated;
- validating every returned SHA before referencing a blob in a tree.

Never commit a blob whose returned SHA does not match the locally computed Git blob SHA.

## Example

```text
binary -> base64 -> create_blob -> verify SHA
       -> create_tree -> create_commit -> update_ref
```
