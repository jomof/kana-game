---
layout: page.11ty.cjs
title: <kana-game> ⌲ Home
---

# &lt;kana-game>

`<kana-game>` is an awesome element. It's a great introduction to building web components with LitElement, with nice documentation site as well.

## As easy as HTML

<section class="columns">
  <div>

`<kana-game>` is just an HTML element. You can it anywhere you can use HTML!

```html
<kana-game></kana-game>
```

  </div>
  <div>

<kana-game></kana-game>

  </div>
</section>

## Configure with attributes

<section class="columns">
  <div>

`<kana-game>` can be configured with attributed in plain HTML.

```html
<kana-game name="HTML"></kana-game>
```

  </div>
  <div>

<kana-game name="HTML"></kana-game>

  </div>
</section>

## Declarative rendering

<section class="columns">
  <div>

`<kana-game>` can be used with declarative rendering libraries like Angular, React, Vue, and lit-html

```js
import {html, render} from 'lit-html';

const name = 'lit-html';

render(
  html`
    <h2>This is a &lt;kana-game&gt;</h2>
    <kana-game .name=${name}></kana-game>
  `,
  document.body
);
```

  </div>
  <div>

<h2>This is a &lt;kana-game&gt;</h2>
<kana-game name="lit-html"></kana-game>

  </div>
</section>
