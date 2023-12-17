'use client'

import Cookie from 'js-cookie'
import React from 'react'
import styles from '../page.module.scss'

export const ThemeToggle = ({ initialTheme }: { initialTheme: string }) => {
	const [theme, setTheme] = React.useState(initialTheme)

	React.useEffect(() => {
		if (initialTheme === 'system') {
			setTheme(
				document.documentElement.getAttribute('data-theme-color') || 'light'
			)
		}
	}, [initialTheme])

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

	if (theme === 'system') {
		return <button className={styles.toggle}>Loading</button>
	}

	return (
		<button onClick={handleClick} className={styles.toggle}>
			Switch to {theme === 'light' ? 'dark' : 'light'} mode
		</button>
	)
}
