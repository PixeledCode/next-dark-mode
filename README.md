# Next 13/14 Dark Mode

This repository is a separate implementation of the [Dark Mode in Joy of React](https://github.com/joy-of-react/next-13-dark-mode/tree/main). This differs by relying on CSS Variables and uses `prefers-color-scheme` API to detect the user's preference for first time visitors.

## Getting Started

This method is made for Next.js `/app` router. But the methodology should work with any React framework that generates `html` on the server.

Let's start by creating a simple toggle without user preference detection.

1. Creating a component for toggling theme. [/components/theme-toggle.tsx](/app/components/theme-toggle.tsx)

```tsx
'use client'

import React from 'react'
import Cookie from 'js-cookie'

export const ThemeToggle = ({ initialTheme }: { initialTheme: string }) => {
	const [theme, setTheme] = React.useState(initialTheme)

	function handleClick() {
		// get next theme
		const newTheme = theme === 'light' ? 'dark' : 'light'
		// set theme for local state
		setTheme(newTheme)

		// set cookies for next visit
		Cookie.set('theme-color', newTheme, {
			expires: 1000,
		})

		// set theme for html
		document.documentElement.setAttribute('data-theme-color', newTheme)
	}

	return (
		<button onClick={handleClick}>
			Switch to {theme === 'light' ? 'dark' : 'light'} mode
		</button>
	)
}
```

> We are using [js-cookie](https://www.npmjs.com/package/js-cookie) to handle cookies. You can use any library or write your own.

2. In `/app/layout.tsx`, we will look for the cookie and set the theme for the visitors.

```tsx
import { cookies } from 'next/headers'
import { ThemeToggle } from './components/theme-toggle'
import './globals.css'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const savedTheme = cookies().get('theme-color')
	// if no cookie, set theme to light
	const theme = savedTheme?.value || 'light'

	return (
		<html lang="en" data-theme-color={theme}>
			<body>
				<header className="header">
					<ThemeToggle initialTheme={theme} />
				</header>
				{children}
			</body>
		</html>
	)
}
```

## Adding User Preference Detection

Now that we have a working toggle, let's add user preference detection. We will use `prefers-color-scheme` API to detect the user's preference for visitors.

1. In `/app/layout.tsx`, we will inject a script in the head that will run on the client.

```tsx
const ThemeScript = () => {
	const codeToRunOnClient = `
		(function() {
			if(document.documentElement.getAttribute('data-theme-color') === 'system' && window.matchMedia) {
				const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
				document.documentElement.setAttribute('data-theme-color', theme)

				window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
					const newColorScheme = event.matches ? "dark" : "light";
					document.documentElement.setAttribute('data-theme-color', newColorScheme)
			});
			}
		})()
	`

	return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />
}
```

> We are using IIFE to avoid polluting the global namespace.

> Injecting the script is intentional, we are XSSing ourselves.

2. Now we will add the script to the head and also change default theme to `system`. `ThemeScript` will detect that the theme is `system` and will set the theme based on user preference.

```tsx
...

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const savedTheme = cookies().get('theme-color')
	const theme = savedTheme?.value || 'system'

	return (
		<html lang="en" data-theme-color={theme}>
			<head>
				<ThemeScript />
			</head>
			<body className={inter.className}>
				<header className="header">
					<ThemeToggle initialTheme={theme} />
				</header>
				{children}
			</body>
		</html>
	)
}
```

3. This works, we need to sync the toggle with the user preference. We will use `useEffect` to sync the toggle with the user preference.

```tsx
// /components/theme-toggle.tsx

React.useEffect(() => {
	if (initialTheme === 'system') {
		setTheme(
			document.documentElement.getAttribute('data-theme-color') || 'light'
		)
	}
}, [initialTheme])
```

4. Also change the button to reflect the user preference. Everthing else will remain the same.

```tsx
if (theme === 'system') {
	return <button className={styles.toggle}>Loading</button>
}

return (
	<button onClick={handleClick} className={styles.toggle}>
		Switch to {theme === 'light' ? 'dark' : 'light'} mode
	</button>
)
```

## CSS Variables

We are using CSS Variables to set the theme. It's upto you on how to manage the variables. One way is to create a `/tokens.css` file and import it in `/globals.css`.

```css
/* /tokens.css */
:root,
[data-theme-color='light'] {
	--foreground-rgb: 0, 0, 0;
	--background-start-rgb: 214, 219, 220;
	--background-end-rgb: 255, 255, 255;

	--callout-rgb: 238, 240, 241;
	--callout-border-rgb: 172, 175, 176;
	--card-rgb: 180, 185, 188;
	--card-border-rgb: 131, 134, 135;
}

[data-theme-color='dark'] {
	color-scheme: dark;
	--foreground-rgb: 255, 255, 255;
	--background-start-rgb: 0, 0, 0;
	--background-end-rgb: 0, 0, 0;

	--callout-rgb: 20, 20, 20;
	--callout-border-rgb: 108, 108, 108;
	--card-rgb: 100, 100, 100;
	--card-border-rgb: 200, 200, 200;
}
```

```css
/* /globals.css */
@import './tokens.css';

...
```

### CSS based on theme

Since we are [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) to set the theme, we can use CSS to change the styles based on theme. We cannot rely on `@media (prefers-color-scheme: dark)` anymore.

```css
[data-theme-color='dark'] {
	.logo {
		filter: invert(1) drop-shadow(0 0 0.3rem #ffffff70);
	}
}
```

## Tailwind

> Work in progress

General idea is to use classes to set the theme instead of `data-theme-color`. Then in `tailwind.config.js`, set the dark mode property to class:

```js
module.exports = {
	darkMode: 'class',
}
```

Using dark mode classes is possible then:

```html
<div className="bg-white dark:bg-black"></div>
```
