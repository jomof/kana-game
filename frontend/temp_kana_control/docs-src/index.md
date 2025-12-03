---
layout: page.11ty.cjs
title: <kana-control> ⌲ Home
---

# &lt;kana-control>

`<kana-control>` is a tiny web component that provides a Japanese IME powered by WanaKana. Type romaji and it converts to kana inline. You can also provide an English prompt via the `english` attribute to display the phrase to translate.

## As easy as HTML

<section class="columns">
  <div>

Add the element anywhere and start typing romaji (e.g. `konnnichiha`) — it becomes `こんにちは`.

```html
<kana-control english="Hello world."></kana-control>
```

  </div>
  <div>

<kana-control english="Hello world."></kana-control>

  </div>
</section>

## Example conversion

```txt
Input:  konnnichiha
Output: こんにちは
```

WanaKana handles IME edge cases such as `n` before `ni` (use triple `n`).
