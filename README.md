# x-html

A static web page development tools component

# Installation

```bash
# npm
$ npm i -g x-html

# or yarn
$ yarn global add x-html
```


## CLI Usage

```bash
# make project directory & cd into
$ mkdir my-project && cd $_
$ touch x-html.config.js
```

> x-html.config.js

```js
module.exports = {
  entry: [
    './index.html'
  ],
  output: {
    path: './dist',
    filename: '[name].[ext]'
  }
}
```

```bash
$ x-html
```


## example

```
└── my-project ·········································· proj root
    ├── dist ············································ dist
    ├── tabBar.html ····································· component
    ├── index.html ···································· · entry page
    └── x-html.config.js ································ x-html's config file

```

> index.html

```html
<head>
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <title>i'am 火骑士空空</title>
</head>
<template>
  <div>
    <h1> I am a chinese, i love their motherland!</h1>
    <TabBar></TabBar>
  </div>
</template>
<script>
  import TabBar from './tabBar.html'
</script>
<style>
  h1 {
    color: red;
  }
</style>
```

> tabBar.html

```html
<style>
  ul {
    background: #190E08;
  }
</style>
<template>
  <ul>
    <li>foo</li>
    <li>bar</li>
    <li>xxx</li>
  </ul>
</template>
<script>
</script>
```


```bash
# run  x-html, it will read x-html.config.js and build something
$ x-html
```

> The results are as follows.
> dist/index.html

```html
<!DOCTYPE html>
<html lang="en">

  <head>
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <title>i'am 火骑士空空</title>
    <style>
      h1 {
        color: red;
      }

      ul {
        background: #190E08;
      }
    </style>
  </head>

  <body>
    <div>
      <h1> I am a chinese, i love their motherland!</h1>
      <ul>
        <li>foo</li>
        <li>bar</li>
        <li>xxx</li>
      </ul>
    </div>
  </body>

</html>
```


## License

[MIT](LICENSE) &copy; [火骑士空空]()
