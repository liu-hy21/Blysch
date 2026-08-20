<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI 选择器规范

时间轴页的选择器是全站标准。新增或改表单时必须沿用，禁止系统原生控件。

## 下拉框

- 一律使用 `src/components/ui/pixel-select.tsx` 的 `PixelSelect`
- 禁止 `<select>`、`<option>`
- 菜单必须悬浮（portal + fixed），不得撑开后面的布局
- 外观：`pixel-field` 触发条、硬边墨线、选中项金底 + `◆`、右侧 `ChevronDown`

```tsx
<PixelSelect
  label="分类"
  value={category}
  onChange={setCategory}
  options={items.map((c) => ({ value: c, label: c }))}
/>
```

## 日期选择器

- 一律使用 `src/components/ui/pixel-date-picker.tsx` 的 `PixelDatePicker`
- 禁止 `<input type="date">`
- 值格式为 `YYYY-MM-DD`；展示为 `YYYY.MM.DD`
- 触发条必须与 `PixelSelect` 一致（`pixel-field` + `ChevronDown`），日历面板同样悬浮

```tsx
<PixelDatePicker label="日期" value={date} onChange={setDate} />
```
